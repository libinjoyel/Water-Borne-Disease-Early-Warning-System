import React, { useState, useEffect } from 'react';
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

// District and Village mock datasets
const DISTRICTS_DATA = {
  "All Districts": {
    "All Villages": {
      kpi: { risk: "High", wqi: 68.4, probability: 74.5, probTrend: "up", wqiTrend: "down", caseCount: 142 },
      timeline: [
        { month: 'Jan', Cases: 12, Rainfall: 45, Turbidity: 2.1, pH: 7.2, Bacteria: 12 },
        { month: 'Feb', Cases: 15, Rainfall: 50, Turbidity: 2.4, pH: 7.1, Bacteria: 15 },
        { month: 'Mar', Cases: 22, Rainfall: 80, Turbidity: 3.5, pH: 6.8, Bacteria: 28 },
        { month: 'Apr', Cases: 45, Rainfall: 160, Turbidity: 6.2, pH: 6.4, Bacteria: 65 },
        { month: 'May', Cases: 98, Rainfall: 240, Turbidity: 9.1, pH: 5.9, Bacteria: 120 },
        { month: 'Jun', Cases: 142, Rainfall: 310, Turbidity: 11.4, pH: 5.5, Bacteria: 198 },
      ]
    },
    "Village North-1": {
      kpi: { risk: "Medium", wqi: 74.2, probability: 48.0, probTrend: "down", wqiTrend: "up", caseCount: 38 },
      timeline: [
        { month: 'Jan', Cases: 3, Rainfall: 45, Turbidity: 1.8, pH: 7.4, Bacteria: 4 },
        { month: 'Feb', Cases: 5, Rainfall: 50, Turbidity: 2.0, pH: 7.3, Bacteria: 5 },
        { month: 'Mar', Cases: 8, Rainfall: 80, Turbidity: 2.8, pH: 7.0, Bacteria: 10 },
        { month: 'Apr', Cases: 14, Rainfall: 160, Turbidity: 4.5, pH: 6.7, Bacteria: 24 },
        { month: 'May', Cases: 29, Rainfall: 240, Turbidity: 6.8, pH: 6.3, Bacteria: 55 },
        { month: 'Jun', Cases: 38, Rainfall: 310, Turbidity: 7.2, pH: 6.2, Bacteria: 68 },
      ]
    },
    "Village East-2": {
      kpi: { risk: "High", wqi: 52.8, probability: 89.2, probTrend: "up", wqiTrend: "down", caseCount: 104 },
      timeline: [
        { month: 'Jan', Cases: 9, Rainfall: 45, Turbidity: 2.5, pH: 7.0, Bacteria: 20 },
        { month: 'Feb', Cases: 10, Rainfall: 50, Turbidity: 2.8, pH: 6.9, Bacteria: 25 },
        { month: 'Mar', Cases: 14, Rainfall: 80, Turbidity: 4.2, pH: 6.6, Bacteria: 48 },
        { month: 'Apr', Cases: 31, Rainfall: 160, Turbidity: 7.9, pH: 6.1, Bacteria: 106 },
        { month: 'May', Cases: 69, Rainfall: 240, Turbidity: 11.4, pH: 5.6, Bacteria: 185 },
        { month: 'Jun', Cases: 104, Rainfall: 310, Turbidity: 15.6, pH: 5.0, Bacteria: 310 },
      ]
    }
  },
  "District South": {
    "All Villages": {
      kpi: { risk: "Low", wqi: 88.5, probability: 14.2, probTrend: "down", wqiTrend: "up", caseCount: 8 },
      timeline: [
        { month: 'Jan', Cases: 1, Rainfall: 30, Turbidity: 1.1, pH: 7.4, Bacteria: 2 },
        { month: 'Feb', Cases: 1, Rainfall: 35, Turbidity: 1.2, pH: 7.4, Bacteria: 1 },
        { month: 'Mar', Cases: 2, Rainfall: 50, Turbidity: 1.5, pH: 7.3, Bacteria: 3 },
        { month: 'Apr', Cases: 4, Rainfall: 90, Turbidity: 2.1, pH: 7.2, Bacteria: 7 },
        { month: 'May', Cases: 6, Rainfall: 120, Turbidity: 2.5, pH: 7.1, Bacteria: 11 },
        { month: 'Jun', Cases: 8, Rainfall: 150, Turbidity: 2.8, pH: 7.0, Bacteria: 14 },
      ]
    },
    "Village South-1": {
      kpi: { risk: "Low", wqi: 91.2, probability: 8.5, probTrend: "down", wqiTrend: "up", caseCount: 2 },
      timeline: [
        { month: 'Jan', Cases: 0, Rainfall: 30, Turbidity: 0.9, pH: 7.5, Bacteria: 0 },
        { month: 'Feb', Cases: 0, Rainfall: 35, Turbidity: 1.0, pH: 7.5, Bacteria: 0 },
        { month: 'Mar', Cases: 1, Rainfall: 50, Turbidity: 1.1, pH: 7.4, Bacteria: 1 },
        { month: 'Apr', Cases: 2, Rainfall: 90, Turbidity: 1.4, pH: 7.3, Bacteria: 3 },
        { month: 'May', Cases: 2, Rainfall: 120, Turbidity: 1.6, pH: 7.3, Bacteria: 4 },
        { month: 'Jun', Cases: 2, Rainfall: 150, Turbidity: 1.8, pH: 7.2, Bacteria: 5 },
      ]
    }
  },
  "District West": {
    "All Villages": {
      kpi: { risk: "Medium", wqi: 72.1, probability: 42.6, probTrend: "up", wqiTrend: "down", caseCount: 45 },
      timeline: [
        { month: 'Jan', Cases: 4, Rainfall: 60, Turbidity: 1.9, pH: 7.1, Bacteria: 8 },
        { month: 'Feb', Cases: 5, Rainfall: 65, Turbidity: 2.2, pH: 7.0, Bacteria: 10 },
        { month: 'Mar', Cases: 9, Rainfall: 100, Turbidity: 3.1, pH: 6.8, Bacteria: 19 },
        { month: 'Apr', Cases: 18, Rainfall: 180, Turbidity: 5.4, pH: 6.4, Bacteria: 42 },
        { month: 'May', Cases: 33, Rainfall: 260, Turbidity: 8.0, pH: 6.0, Bacteria: 88 },
        { month: 'Jun', Cases: 45, Rainfall: 340, Turbidity: 9.8, pH: 5.7, Bacteria: 130 },
      ]
    }
  }
};

export default function Dashboard({ isAdminMode }) {
  const [district, setDistrict] = useState("All Districts");
  const [village, setVillage] = useState("All Villages");
  const [timeHorizon, setTimeHorizon] = useState("6 months");
  const [currentData, setCurrentData] = useState(DISTRICTS_DATA["All Districts"]["All Villages"]);
  const [activeTab, setActiveTab] = useState("analytics");
  const [isLoading, setIsLoading] = useState(false);

  // Force tab to analytics if admin mode disabled
  useEffect(() => {
    if (!isAdminMode) {
      setActiveTab('analytics');
    }
  }, [isAdminMode]);

  // Mutate data array based on filters
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 900);

    let resolvedDistrict = DISTRICTS_DATA[district] ? district : "All Districts";
    let villageList = DISTRICTS_DATA[resolvedDistrict];
    let resolvedVillage = villageList[village] ? village : Object.keys(villageList)[0];
    
    // Set resolved selection
    setVillage(resolvedVillage);
    
    let dataset = DISTRICTS_DATA[resolvedDistrict][resolvedVillage];
    
    // Slice timeline based on time horizon
    let updatedTimeline = [...dataset.timeline];
    if (timeHorizon === "7 days") {
      // Just mock subset for small scope representation
      updatedTimeline = updatedTimeline.slice(-1).map(item => ({ ...item, month: "Week 4" }));
    } else if (timeHorizon === "30 days") {
      updatedTimeline = updatedTimeline.slice(-2);
    }
    
    setCurrentData({
      kpi: dataset.kpi,
      timeline: updatedTimeline
    });

    return () => clearTimeout(timer);
  }, [district, village, timeHorizon]);

  // Handle district switch, resetting village lists
  const handleDistrictChange = (e) => {
    const nextDistrict = e.target.value;
    setDistrict(nextDistrict);
    const villages = Object.keys(DISTRICTS_DATA[nextDistrict]);
    setVillage(villages[0]); // default to first village in new list
  };

  const currentVillagesList = Object.keys(DISTRICTS_DATA[district] || DISTRICTS_DATA["All Districts"]);

  // Custom tooltips
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

  // Color map for risk level
  const getRiskBadgeStyles = (risk) => {
    switch (risk) {
      case "High":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/25";
      case "Medium":
        return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25";
      default:
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Header and Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-slate-200/60 dark:border-slate-800/80">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Executive Dashboard</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Real-time epidemiological risk vectors and contamination matrices.</p>
          </div>

          {/* Filters Panel - Show only on analytics tab */}
          {activeTab === "analytics" && (
            <div className="flex flex-wrap items-center gap-3">
              {/* District */}
              <div className="flex flex-col">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">District</label>
                <select 
                  value={district} 
                  onChange={handleDistrictChange}
                  className="px-3.5 py-2 text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {Object.keys(DISTRICTS_DATA).map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Village */}
              <div className="flex flex-col">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1">Village</label>
                <select 
                  value={village} 
                  onChange={(e) => setVillage(e.target.value)}
                  className="px-3.5 py-2 text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {currentVillagesList.map(v => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>

              {/* Horizon */}
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

        {/* Tab switch navigation */}
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

        {/* Tab contents conditional render */}
        {activeTab === 'analytics' ? (
          isLoading ? (
            <DashboardSkeleton />
          ) : (
            <div className="space-y-8 animate-fade-in">
            {/* Top KPI Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1: Risk Level */}
              <motion.div 
                whileHover={{ y: -2 }}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm flex items-center justify-between"
              >
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Bio-Risk Rating</span>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getRiskBadgeStyles(currentData.kpi.risk)}`}>
                      {currentData.kpi.risk} Risk
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-red-500/10 rounded-xl text-rose-500">
                  <Activity className="h-6 w-6" />
                </div>
              </motion.div>

              {/* Card 2: Water Quality Index */}
              <motion.div 
                whileHover={{ y: -2 }}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm flex items-center justify-between"
              >
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Water Quality Index (WQI)</span>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{currentData.kpi.wqi}</span>
                    <span className="text-xs text-slate-450">/ 100</span>
                  </div>
                  <span className="flex items-center text-[10px] text-emerald-500 font-semibold">
                    {currentData.kpi.wqiTrend === 'up' ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5 text-rose-500" />}
                    {currentData.kpi.wqiTrend === 'up' ? 'Improving health parameters' : 'Contamination threshold exceeded'}
                  </span>
                </div>
                <div className="p-3 bg-teal-500/10 rounded-xl text-teal-500">
                  <Droplet className="h-6 w-6" />
                </div>
              </motion.div>

              {/* Card 3: Outbreak Probability Change */}
              <motion.div 
                whileHover={{ y: -2 }}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm flex items-center justify-between"
              >
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Outbreak Probability</span>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{currentData.kpi.probability}%</span>
                  </div>
                  <span className={`flex items-center text-[10px] font-semibold ${currentData.kpi.probTrend === 'up' ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {currentData.kpi.probTrend === 'up' ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                    {currentData.kpi.probTrend === 'up' ? '+12.4% vs last week' : '-4.8% vs last week'}
                  </span>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
                  <Thermometer className="h-6 w-6" />
                </div>
              </motion.div>

              {/* Card 4: Cumulative Active Cases */}
              <motion.div 
                whileHover={{ y: -2 }}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm flex items-center justify-between"
              >
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Active Clinical Cases</span>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{currentData.kpi.caseCount}</span>
                    <span className="text-xs text-slate-400">cases</span>
                  </div>
                  <span className="text-[10px] text-slate-400 flex items-center">
                    <Info className="h-3 w-3 mr-0.5 text-sky-500" />
                    Updated 4 hours ago
                  </span>
                </div>
                <div className="p-3 bg-sky-500/10 rounded-xl text-sky-500">
                  <CloudRain className="h-6 w-6" />
                </div>
              </motion.div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Chart 1: Line Chart (Cases vs Rainfall) */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Outbreak Progression vs. Monthly Rainfall</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Correlating vector growth and pathogen outbreaks with rainfall spikes.</p>
                </div>
                
                <div className="h-80 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={currentData.timeline} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
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

              {/* Chart 2: Bar Chart (Contamination Parameters) */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-sm space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Water Contamination Parameters</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Comparing turbidity (NTU), pH scale, and biological bacterial colony counts.</p>
                </div>

                <div className="h-80 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={currentData.timeline} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
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

            {/* Warning Indicator Bottom Callout */}
            {currentData.kpi.risk === "High" && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-800 dark:text-rose-300 flex items-start gap-3"
              >
                <Activity className="h-5 w-5 text-rose-500 shrink-0 mt-0.5 animate-pulse" />
                <div className="text-sm">
                  <span className="font-bold">Urgent Biohazard Alert: </span>
                  Critical pathogeic threshold exceeded in {village === "All Villages" ? district : village}. Bacteria colonies count is above {currentData.timeline[currentData.timeline.length - 1].Bacteria} CFU/mL. Local medical services have been pre-alerted. Community residents must boil tap water.
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
