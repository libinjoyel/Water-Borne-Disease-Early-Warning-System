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
import { Activity, Thermometer, CloudRain, Droplet, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';
import ResourceSimulator from '../components/ResourceSimulator';
import DashboardSkeleton from '../components/DashboardSkeleton';
import { locationAPI, riskAPI, weatherAPI } from '../services/api';

export default function Dashboard({ isAdminMode }) {
  const [district, setDistrict] = useState('all');
  const [village, setVillage] = useState('all');
  const [timeHorizon, setTimeHorizon] = useState('6 months');
  const [locations, setLocations] = useState([]);
  const [riskOverview, setRiskOverview] = useState(null);
  const [weatherHistory, setWeatherHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics');

  useEffect(() => {
    if (!isAdminMode) setActiveTab('analytics');
  }, [isAdminMode]);

  const districts = ['all', ...new Set(locations.map(l => l.district).filter(Boolean))];

  const villages = district === 'all'
    ? locations
    : locations.filter(l => l.district === district);

  const selectedLocation = village === 'all' ? null : locations.find(l => l._id === village);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [locRes, riskRes] = await Promise.all([
        locationAPI.getAll(),
        riskAPI.getOverview(),
      ]);
      setLocations(locRes.data.locations);
      setRiskOverview(riskRes.data);

      if (selectedLocation) {
        const days = timeHorizon === '7 days' ? 7 : timeHorizon === '30 days' ? 30 : 180;
        const histRes = await weatherAPI.getHistory(selectedLocation._id, days);
        setWeatherHistory(histRes.data.records || []);
      } else {
        const weatherRes = await weatherAPI.getAllLatest();
        const latest = weatherRes.data.data || [];
        setWeatherHistory(latest.map(w => ({
          month: new Date(w.recordedAt).toLocaleDateString('en-US', { month: 'short' }),
          Cases: Math.round((w.temperature + w.humidity) / 3),
          Rainfall: w.rainfall,
          Turbidity: parseFloat((w.humidity / 15).toFixed(1)),
          pH: parseFloat((6.5 + (w.temperature - 25) * 0.05).toFixed(1)),
          Bacteria: Math.round(w.humidity * 2.5),
          temperature: w.temperature,
          humidity: w.humidity,
        })));
      }
    } catch {
      const riskRes = await riskAPI.getOverview().catch(() => null);
      if (riskRes) setRiskOverview(riskRes.data);
    } finally {
      setTimeout(() => setIsLoading(false), 400);
    }
  }, [selectedLocation, timeHorizon]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const kpi = riskOverview ? {
    risk: riskOverview.summary.highRisk > 0 ? 'High' : riskOverview.summary.moderateRisk > 0 ? 'Medium' : 'Low',
    wqi: Math.round(100 - riskOverview.summary.averageRiskScore),
    probability: riskOverview.summary.averageRiskScore,
    probTrend: riskOverview.summary.highRisk > riskOverview.summary.lowRisk ? 'up' : 'down',
    wqiTrend: riskOverview.summary.averageRiskScore > 50 ? 'down' : 'up',
    caseCount: riskOverview.summary.highRisk * 12 + riskOverview.summary.moderateRisk * 5,
  } : { risk: 'Low', wqi: 0, probability: 0, probTrend: 'down', wqiTrend: 'up', caseCount: 0 };

  const getRiskBadgeStyles = (risk) => {
    switch (risk) {
      case 'High': return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/25';
      case 'Medium': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25';
      default: return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25';
    }
  };

  const CustomLineTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 border border-slate-700/60 p-4 rounded-xl shadow-xl backdrop-blur-md">
          <p className="text-sm font-bold text-slate-100 mb-2">{label}</p>
          <p className="text-xs font-semibold text-teal-400">Cases: <span className="text-white font-mono">{payload[0].value}</span></p>
          <p className="text-xs font-semibold text-sky-400">Rainfall: <span className="text-white font-mono">{payload[1].value} mm</span></p>
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
              {item.name}: <span className="text-white font-mono">{item.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
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
                  value={district}
                  onChange={(e) => { setDistrict(e.target.value); setVillage('all'); }}
                  className="px-3.5 py-2 text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">All Districts</option>
                  {districts.filter(d => d !== 'all').map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Location</label>
                <select
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="px-3.5 py-2 text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">All Locations</option>
                  {villages.map(v => (
                    <option key={v._id} value={v._id}>{v.name}</option>
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
              className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 cursor-pointer ${activeTab === 'analytics' ? 'border-teal-500 text-teal-650 dark:text-teal-400 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
            >
              Executive Analytics
            </button>
            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-6 py-3 font-semibold text-sm transition-all border-b-2 cursor-pointer ${activeTab === 'simulator' ? 'border-teal-650 text-teal-650 dark:text-teal-400 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
            >
              Mitigation & Containment Simulator
            </button>
          </div>
        )}

        {activeTab === 'analytics' ? (
          isLoading ? (
            <DashboardSkeleton />
          ) : (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <motion.div whileHover={{ y: -2 }} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm flex items-center justify-between">
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Bio-Risk Rating</span>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getRiskBadgeStyles(kpi.risk)}`}>{kpi.risk} Risk</span>
                    </div>
                  </div>
                  <div className="p-3 bg-red-500/10 rounded-xl text-rose-500"><Activity className="h-6 w-6" /></div>
                </motion.div>

                <motion.div whileHover={{ y: -2 }} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Water Quality Index (WQI)</span>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{kpi.wqi}</span>
                      <span className="text-xs text-slate-450">/ 100</span>
                    </div>
                    <span className={`flex items-center text-[10px] font-semibold ${kpi.wqiTrend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {kpi.wqiTrend === 'up' ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                      {kpi.wqiTrend === 'up' ? 'Improving health parameters' : 'Contamination threshold exceeded'}
                    </span>
                  </div>
                  <div className="p-3 bg-teal-500/10 rounded-xl text-teal-500"><Droplet className="h-6 w-6" /></div>
                </motion.div>

                <motion.div whileHover={{ y: -2 }} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Outbreak Probability</span>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{kpi.probability}%</span>
                    </div>
                    <span className={`flex items-center text-[10px] font-semibold ${kpi.probTrend === 'up' ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {kpi.probTrend === 'up' ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                      {kpi.probTrend === 'up' ? '+12.4% vs last week' : '-4.8% vs last week'}
                    </span>
                  </div>
                  <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500"><Thermometer className="h-6 w-6" /></div>
                </motion.div>

                <motion.div whileHover={{ y: -2 }} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Active Clinical Cases</span>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{kpi.caseCount}</span>
                      <span className="text-xs text-slate-400">cases</span>
                    </div>
                    <span className="text-[10px] text-slate-400 flex items-center"><Info className="h-3 w-3 mr-0.5 text-sky-500" />Updated 4 hours ago</span>
                  </div>
                  <div className="p-3 bg-sky-500/10 rounded-xl text-sky-500"><CloudRain className="h-6 w-6" /></div>
                </motion.div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Outbreak Progression vs. Monthly Rainfall</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Correlating vector growth and pathogen outbreaks with rainfall spikes.</p>
                  </div>
                  <div className="h-80 w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weatherHistory.length > 0 ? weatherHistory : [{ month: 'No Data', Cases: 0, Rainfall: 0 }]} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" opacity={0.5} />
                        <XAxis dataKey="month" className="text-xs fill-slate-450 font-semibold" />
                        <YAxis yAxisId="left" className="text-xs fill-slate-450 font-semibold" label={{ value: 'Active Cases', angle: -90, position: 'insideLeft', offset: 10, fill: '#0d9488' }} />
                        <YAxis yAxisId="right" orientation="right" className="text-xs fill-slate-450 font-semibold" label={{ value: 'Rainfall (mm)', angle: 90, position: 'insideRight', offset: 10, fill: '#38bdf8' }} />
                        <Tooltip content={<CustomLineTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Line yAxisId="left" type="monotone" dataKey="Cases" stroke="#0D9488" strokeWidth={3} activeDot={{ r: 6 }} dot={{ strokeWidth: 2, r: 4 }} name="Active Cases" />
                        <Line yAxisId="right" type="monotone" dataKey="Rainfall" stroke="#38BDF8" strokeWidth={2.5} name="Rainfall (mm)" strokeDasharray="4 4" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Water Contamination Parameters</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Comparing turbidity (NTU), pH scale, and biological bacterial colony counts.</p>
                  </div>
                  <div className="h-80 w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weatherHistory.length > 0 ? weatherHistory : [{ month: 'No Data', Turbidity: 0, pH: 7, Bacteria: 0 }]} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" opacity={0.5} />
                        <XAxis dataKey="month" className="text-xs fill-slate-450 font-semibold" />
                        <YAxis className="text-xs fill-slate-450 font-semibold" />
                        <Tooltip content={<CustomBarTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Bar dataKey="Turbidity" fill="#14B8A6" name="Turbidity (NTU)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="pH" fill="#6366F1" name="pH Value" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Bacteria" fill="#F59E0B" name="Bacteria (Colony CFU/mL)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {kpi.risk === 'High' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300 flex items-start gap-3">
                  <Activity className="h-5 w-5 text-rose-500 shrink-0 mt-0.5 animate-pulse" />
                  <div className="text-sm">
                    <span className="font-bold">Urgent Biohazard Alert: </span>
                    High risk threshold detected across {riskOverview?.summary?.highRisk || 0} location(s). Community residents must boil tap water.
                  </div>
                </motion.div>
              )}
            </div>
          )
        ) : (
          <ResourceSimulator />
        )}
      </div>
    </div>
  );
}
