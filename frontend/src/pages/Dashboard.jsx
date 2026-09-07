import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { Activity, Thermometer, CloudRain, Droplet, ArrowUpRight, ArrowDownRight, Info, AlertTriangle } from 'lucide-react';
import ResourceSimulator from '../components/ResourceSimulator';
import DashboardSkeleton from '../components/DashboardSkeleton';
import { locationAPI, statsAPI, riskAPI } from '../services/api';

const MONTH_MAP = { 0: 'Jan', 1: 'Feb', 2: 'Mar', 3: 'Apr', 4: 'May', 5: 'Jun', 6: 'Jul', 7: 'Aug', 8: 'Sep', 9: 'Oct', 10: 'Nov', 11: 'Dec' };

export default function Dashboard({ isAdminMode }) {
  const [locations, setLocations] = useState([]);
  const [districtsMap, setDistrictsMap] = useState({});
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [selectedLocationId, setSelectedLocationId] = useState('all');
  const [timeHorizon, setTimeHorizon] = useState('6 months');
  const [activeTab, setActiveTab] = useState('analytics');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [kpi, setKpi] = useState({ risk: 'Low', wqi: 0, probability: 0, probTrend: 'down', wqiTrend: 'up', caseCount: 0 });
  const [timeline, setTimeline] = useState([]);
  const [alerts, setAlerts] = useState({ unresolved: 0, critical: 0 });

  useEffect(() => {
    if (!isAdminMode) setActiveTab('analytics');
  }, [isAdminMode]);

  const computeDays = useCallback(() => {
    if (timeHorizon === '7 days') return 7;
    if (timeHorizon === '30 days') return 30;
    return 180;
  }, [timeHorizon]);

  const deriveKpiFromOverview = useCallback((overview, locationsList) => {
    const details = overview.details || [];
    if (details.length === 0) {
      setKpi({ risk: 'Low', wqi: 100, probability: 0, probTrend: 'down', wqiTrend: 'up', caseCount: 0 });
      return;
    }

    let filtered = details;
    if (selectedLocationId !== 'all') {
      filtered = details.filter(d => d.location.id === selectedLocationId);
    } else if (selectedDistrict !== 'All') {
      filtered = details.filter(d => d.location.district === selectedDistrict);
    }

    const withRisk = filtered.filter(d => d.risk);
    if (withRisk.length === 0) {
      setKpi({ risk: 'Low', wqi: 100, probability: 0, probTrend: 'down', wqiTrend: 'up', caseCount: 0 });
      return;
    }

    const avgScore = withRisk.reduce((s, d) => s + d.risk.score, 0) / withRisk.length;
    const highCount = withRisk.filter(d => d.risk.level === 'High' || d.risk.level === 'Very High').length;
    const dominantLevel = highCount > withRisk.length / 2 ? 'High'
      : withRisk.some(d => d.risk.level === 'Moderate') ? 'Moderate' : 'Low';

    const wqi = Math.max(0, Math.round(100 - avgScore));
    const probability = Math.min(100, Math.round(avgScore));
    const probTrend = probability > 50 ? 'up' : 'down';
    const wqiTrend = wqi > 60 ? 'up' : 'down';

    setKpi({ risk: dominantLevel, wqi, probability, probTrend, wqiTrend, caseCount: overview.summary?.highRisk || 0 });
  }, [selectedDistrict, selectedLocationId]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const [locRes, statsRes, overviewRes] = await Promise.all([
          locationAPI.getAll(),
          statsAPI.getSummary(),
          riskAPI.getOverview(),
        ]);

        if (cancelled) return;

        const locs = locRes.data?.locations || locRes.data || [];
        setLocations(locs);

        const dMap = {};
        for (const loc of locs) {
          const d = loc.district || 'Unknown';
          if (!dMap[d]) dMap[d] = [];
          dMap[d].push(loc);
        }
        setDistrictsMap(dMap);

        const stats = statsRes.data;
        setAlerts(stats.alerts || { unresolved: 0, critical: 0 });

        deriveKpiFromOverview(overviewRes.data, locs);

        if (overviewRes.data?.details?.length > 0) {
          await loadTimelineForLocations(overviewRes.data.details, locs, 180);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Dashboard load error:', err);
          setError('Failed to load dashboard data. Make sure the backend server is running.');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const loadTimelineForLocations = async (details, locs, days) => {
    let targetDetails = details;
    if (selectedLocationId !== 'all') {
      targetDetails = details.filter(d => d.location.id === selectedLocationId);
    } else if (selectedDistrict !== 'All') {
      targetDetails = details.filter(d => d.location.district === selectedDistrict);
    }

    const targetIds = targetDetails
      .filter(d => d.location?.id)
      .map(d => d.location.id);

    if (targetIds.length === 0) {
      setTimeline([]);
      return;
    }

    const historyPromises = targetIds.slice(0, 5).map(id =>
      riskAPI.getHistory(id, { days, limit: 200 }).catch(() => ({ data: { records: [] } }))
    );
    const historyResults = await Promise.all(historyPromises);

    const dateMap = {};
    for (const res of historyResults) {
      const records = res.data?.records || [];
      for (const rec of records) {
        const dateKey = rec.calculatedAt ? rec.calculatedAt.split('T')[0] : null;
        if (!dateKey) continue;
        if (!dateMap[dateKey]) {
          dateMap[dateKey] = { scores: [], temps: [], humidities: [], rainfalls: [] };
        }
        dateMap[dateKey].scores.push(rec.riskScore);
        if (rec.factors?.temperature?.value != null) dateMap[dateKey].temps.push(rec.factors.temperature.value);
        if (rec.factors?.humidity?.value != null) dateMap[dateKey].humidities.push(rec.factors.humidity.value);
        if (rec.factors?.rainfall?.value != null) dateMap[dateKey].rainfalls.push(rec.factors.rainfall.value);
      }
    }

    const arr = Object.entries(dateMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateStr, d]) => {
        const dt = new Date(dateStr + 'T00:00:00');
        const month = MONTH_MAP[dt.getMonth()];
        return {
          month,
          date: dateStr,
          RiskScore: Math.round(d.scores.reduce((a, b) => a + b, 0) / d.scores.length),
          Temperature: d.temps.length ? Math.round(d.temps.reduce((a, b) => a + b, 0) / d.temps.length * 10) / 10 : 0,
          Humidity: d.humidities.length ? Math.round(d.humidities.reduce((a, b) => a + b, 0) / d.humidities.length) : 0,
          Rainfall: d.rainfalls.length ? Math.round(d.rainfalls.reduce((a, b) => a + b, 0) / d.rainfalls.length) : 0,
        };
      });

    setTimeline(arr);
  };

  useEffect(() => {
    if (locations.length === 0) return;
    let cancelled = false;
    (async () => {
      try {
        const overviewRes = await riskAPI.getOverview();
        if (cancelled) return;
        deriveKpiFromOverview(overviewRes.data, locations);
        const days = computeDays();
        await loadTimelineForLocations(overviewRes.data?.details || [], locations, days);
      } catch (err) {
        console.error('Filter update error:', err);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedDistrict, selectedLocationId, timeHorizon]);

  const districtList = ['All', ...Object.keys(districtsMap)];
  const villageList = selectedDistrict === 'All'
    ? locations
    : (districtsMap[selectedDistrict] || []);

  const handleDistrictChange = (e) => {
    setSelectedDistrict(e.target.value);
    setSelectedLocationId('all');
  };

  const CustomLineTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 border border-slate-700/60 p-4 rounded-xl shadow-xl backdrop-blur-md">
          <p className="text-sm font-bold text-slate-100 mb-2">{label}</p>
          {payload.map((item, idx) => (
            <p key={idx} className="text-xs font-semibold" style={{ color: item.color }}>
              {item.name}: <span className="text-white font-mono">{item.value}{item.name.includes('Rainfall') ? ' mm' : item.name.includes('Score') ? '/100' : ''}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 border border-slate-700/60 p-4 rounded-xl shadow-xl backdrop-blur-md">
          <p className="text-sm font-bold text-slate-100 mb-2">{label} Metrics</p>
          {payload.map((item, idx) => (
            <p key={idx} className="text-xs font-semibold" style={{ color: item.color }}>
              {item.name}: <span className="text-white font-mono">{item.value}{item.name.includes('Rainfall') ? ' mm' : item.name.includes('Temp') ? '°C' : '%'}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const getRiskBadgeStyles = (risk) => {
    switch (risk) {
      case 'High':
      case 'Very High':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/25';
      case 'Moderate':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25';
      default:
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-slate-200/60 dark:border-slate-800/80">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Executive Dashboard</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Real-time epidemiological risk vectors and contamination matrices.</p>
          </div>

          {activeTab === 'analytics' && (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex flex-col">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">District</label>
                <select
                  value={selectedDistrict}
                  onChange={handleDistrictChange}
                  className="px-3.5 py-2 text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {districtList.map(d => (
                    <option key={d} value={d}>{d === 'All' ? 'All Districts' : d}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Village</label>
                <select
                  value={selectedLocationId}
                  onChange={(e) => setSelectedLocationId(e.target.value)}
                  className="px-3.5 py-2 text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">All Villages</option>
                  {villageList.map(loc => (
                    <option key={loc._id || loc.id} value={loc._id || loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Horizon</label>
                <select
                  value={timeHorizon}
                  onChange={(e) => setTimeHorizon(e.target.value)}
                  className="px-3.5 py-2 text-sm rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="7 days">7 Days</option>
                  <option value="30 days">30 Days</option>
                  <option value="6 months">6 Months (Standard)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {isAdminMode && (
          <div className="flex border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 cursor-pointer ${
                activeTab === 'analytics'
                  ? 'border-teal-500 text-teal-650 dark:text-teal-400 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Executive Analytics
            </button>
            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 cursor-pointer ${
                activeTab === 'simulator'
                  ? 'border-teal-650 text-teal-650 dark:text-teal-400 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Mitigation & Containment Simulator
            </button>
          </div>
        )}

        {activeTab === 'analytics' ? (
          isLoading ? (
            <DashboardSkeleton />
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <AlertTriangle className="h-12 w-12 text-amber-500" />
              <p className="text-slate-600 dark:text-slate-300 text-center max-w-md">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors text-sm font-semibold"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm flex items-center justify-between"
                >
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Bio-Risk Rating</span>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getRiskBadgeStyles(kpi.risk)}`}>
                        {kpi.risk} Risk
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-red-500/10 rounded-xl text-rose-500">
                    <Activity className="h-6 w-6" />
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Water Quality Index (WQI)</span>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{kpi.wqi}</span>
                      <span className="text-xs text-slate-450">/ 100</span>
                    </div>
                    <span className="flex items-center text-[10px] text-emerald-500 font-semibold">
                      {kpi.wqiTrend === 'up' ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5 text-rose-500" />}
                      {kpi.wqiTrend === 'up' ? 'Improving health parameters' : 'Contamination threshold exceeded'}
                    </span>
                  </div>
                  <div className="p-3 bg-teal-500/10 rounded-xl text-teal-500">
                    <Droplet className="h-6 w-6" />
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Outbreak Probability</span>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{kpi.probability}%</span>
                    </div>
                    <span className={`flex items-center text-[10px] font-semibold ${kpi.probTrend === 'up' ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {kpi.probTrend === 'up' ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                      {kpi.probTrend === 'up' ? 'Risk increasing' : 'Risk decreasing'}
                    </span>
                  </div>
                  <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
                    <Thermometer className="h-6 w-6" />
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ y: -2 }}
                  className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">High-Risk Locations</span>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{kpi.caseCount}</span>
                      <span className="text-xs text-slate-400">locations</span>
                    </div>
                    <span className="text-[10px] text-slate-400 flex items-center">
                      <Info className="h-3 w-3 mr-0.5 text-sky-500" />
                      {alerts.unresolved} unresolved alerts
                    </span>
                  </div>
                  <div className="p-3 bg-sky-500/10 rounded-xl text-sky-500">
                    <CloudRain className="h-6 w-6" />
                  </div>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Risk Score vs. Rainfall</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Tracking risk score progression against rainfall levels.</p>
                  </div>

                  <div className="h-80 w-full pt-4">
                    {timeline.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={timeline} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" opacity={0.5} />
                          <XAxis dataKey="month" className="text-xs fill-slate-450 font-semibold" />
                          <YAxis yAxisId="left" className="text-xs fill-slate-450 font-semibold" label={{ value: 'Risk Score', angle: -90, position: 'insideLeft', offset: 10, fill: '#0d9488' }} />
                          <YAxis yAxisId="right" orientation="right" className="text-xs fill-slate-450 font-semibold" label={{ value: 'Rainfall (mm)', angle: 90, position: 'insideRight', offset: 10, fill: '#38bdf8' }} />
                          <Tooltip content={<CustomLineTooltip />} />
                          <Legend wrapperStyle={{ fontSize: '12px' }} />
                          <Line yAxisId="left" type="monotone" dataKey="RiskScore" stroke="#0D9488" strokeWidth={3} activeDot={{ r: 6 }} dot={{ strokeWidth: 2, r: 4 }} name="Risk Score" />
                          <Line yAxisId="right" type="monotone" dataKey="Rainfall" stroke="#38BDF8" strokeWidth={2.5} name="Rainfall (mm)" strokeDasharray="4 4" />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                        No timeline data available. Fetch weather data for locations to see trends.
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Environmental Parameters</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Temperature, humidity, and rainfall readings driving the risk model.</p>
                  </div>

                  <div className="h-80 w-full pt-4">
                    {timeline.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={timeline} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" opacity={0.5} />
                          <XAxis dataKey="month" className="text-xs fill-slate-450 font-semibold" />
                          <YAxis className="text-xs fill-slate-450 font-semibold" />
                          <Tooltip content={<CustomBarTooltip />} />
                          <Legend wrapperStyle={{ fontSize: '12px' }} />
                          <Bar dataKey="Temperature" fill="#14B8A6" name="Temperature (°C)" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="Humidity" fill="#6366F1" name="Humidity (%)" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="Rainfall" fill="#F59E0B" name="Rainfall (mm)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                        No environmental data available. Fetch weather data for locations to see parameters.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {(kpi.risk === 'High' || kpi.risk === 'Very High') && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300 flex items-start gap-3"
                >
                  <Activity className="h-5 w-5 text-rose-500 shrink-0 mt-0.5 animate-pulse" />
                  <div className="text-sm">
                    <span className="font-bold">Urgent Biohazard Alert: </span>
                    Critical risk threshold exceeded across {kpi.caseCount} location(s). {alerts.critical} critical alert(s) active. Immediate water quality testing and community advisories recommended.
                  </div>
                </motion.div>
              )}
            </div>
          )
        ) : (
          <div>
            <ResourceSimulator />
          </div>
        )}
      </div>
    </div>
  );
}
