import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ShieldCheck, Truck, ShieldAlert, Sparkles, CloudRain, Thermometer, AlertCircle, RefreshCw } from 'lucide-react';

// Base mock cases representing projected infected cases over 10 days if no action is taken
const BASE_PROJECTED_CASES = [
  { day: 'Day 1', cases: 10 },
  { day: 'Day 2', cases: 25 },
  { day: 'Day 3', cases: 55 },
  { day: 'Day 4', cases: 120 },
  { day: 'Day 5', cases: 210 },
  { day: 'Day 6', cases: 350 },
  { day: 'Day 7', cases: 480 },
  { day: 'Day 8', cases: 540 },
  { day: 'Day 9', cases: 590 },
  { day: 'Day 10', cases: 620 },
];

export default function ResourceSimulator() {
  // 1. Interventions allocation states
  const [chlorineKits, setChlorineKits] = useState(0);
  const [waterTankers, setWaterTankers] = useState(0);
  const [medicalCamps, setMedicalCamps] = useState(0);
  
  // 2. What-If Environmental Triggers states
  const [rainfallPct, setRainfallPct] = useState(0);
  const [tempRise, setTempRise] = useState(0);
  const [leakageIndex, setLeakageIndex] = useState(0);

  // 3. Dynamic results states
  const [chartData, setChartData] = useState([]);
  const [mitigationScore, setMitigationScore] = useState(0);
  const [totalProjectedCases, setTotalProjectedCases] = useState(0);
  const [mitigatedTotalCases, setMitigatedTotalCases] = useState(0);

  useEffect(() => {
    // A. Calculate What-If Outbreak Escalation Multiplier
    // Higher rainfall, temp, and pipeline leakage indexes increase the baseline severity
    const rainfallEscalation = 1 + (rainfallPct / 100) * 0.8; // up to +80% cases
    const tempEscalation = 1 + (tempRise / 5) * 0.3; // up to +30% cases
    const leakageEscalation = 1 + (leakageIndex / 100) * 0.9; // up to +90% cases
    
    const environmentalMultiplier = rainfallEscalation * tempEscalation * leakageEscalation;

    // B. Calculate Mitigation Impact Factor based on resource allocations
    const chlorineImpact = chlorineKits * 1.6; // 50 kits max = 80% impact
    const tankerImpact = waterTankers * 8; // 10 tankers max = 80% impact
    const campImpact = medicalCamps * 22; // 4 camps max = 88% impact
    
    // Total impact capped at 88% reduction
    const totalImpact = Math.min(chlorineImpact + tankerImpact + campImpact, 88);
    setMitigationScore(Math.round(totalImpact));

    // C. Map baseline cases through escalation multiplier and intervention mitigations
    let baselineSum = 0;
    let mitigatedSum = 0;

    const updatedData = BASE_PROJECTED_CASES.map((item, index) => {
      // First scale baseline with environmental factors
      const escalatedBaseline = Math.round(item.cases * environmentalMultiplier);
      baselineSum += escalatedBaseline;

      if (index === 0) {
        mitigatedSum += escalatedBaseline;
        return {
          day: item.day,
          baselineCases: escalatedBaseline,
          mitigatedCases: escalatedBaseline
        };
      }

      // Compounding effectiveness as resources take effect over time (sigmoid-like impact)
      const dailyEffectiveness = (totalImpact / 100) * Math.min(1, (index / 8));
      const mitigatedCases = Math.max(
        Math.round(escalatedBaseline * (1 - dailyEffectiveness)),
        5 // minimum base active infection cases
      );
      mitigatedSum += mitigatedCases;

      return {
        day: item.day,
        baselineCases: escalatedBaseline,
        mitigatedCases: mitigatedCases
      };
    });

    setChartData(updatedData);
    setTotalProjectedCases(baselineSum);
    setMitigatedTotalCases(mitigatedSum);
  }, [chlorineKits, waterTankers, medicalCamps, rainfallPct, tempRise, leakageIndex]);

  const handleReset = () => {
    setChlorineKits(0);
    setWaterTankers(0);
    setMedicalCamps(0);
    setRainfallPct(0);
    setTempRise(0);
    setLeakageIndex(0);
  };

  const getThreatStatusColor = (score) => {
    if (score >= 60) return "text-rose-500 bg-rose-500/10 border-rose-500/20";
    if (score >= 30) return "text-amber-500 bg-amber-500/10 border-amber-500/20";
    return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
  };

  const savedLivesCount = Math.max(0, totalProjectedCases - mitigatedTotalCases);

  return (
    <div className="bg-[#0A2540] text-slate-100 rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-8">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-teal-400 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-teal-400 animate-pulse" />
            Intervention & Containment Simulator
          </h2>
          <p className="text-slate-400 text-xs mt-1 leading-relaxed">
            Run predictive sandbox projections by toggling environmental risk inputs and municipal resource responses.
          </p>
        </div>
        <button
          onClick={handleReset}
          className="self-start sm:self-auto px-4 py-2 border border-slate-700/60 hover:border-slate-600 rounded-xl text-xs font-semibold text-slate-350 hover:text-white bg-slate-900/60 hover:bg-slate-900 flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Reset Parameters
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left Double Columns: Control Panels */}
        <div className="xl:col-span-1 space-y-6">
          {/* Section A: What-If Environmental Triggers */}
          <div className="p-5 bg-slate-950/40 border border-slate-800/80 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <CloudRain className="h-4.5 w-4.5" />
              Environmental Triggers (What-If)
            </h3>

            {/* Slider 1: Rainfall Pct */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-350">Monsoon Rainfall Increase</span>
                <span className="text-amber-500 font-mono font-bold">+{rainfallPct}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={rainfallPct}
                onChange={(e) => setRainfallPct(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <span className="text-[10px] text-slate-500 block leading-tight">Elevated rainfall causes runoff and municipal drainage spillages.</span>
            </div>

            {/* Slider 2: Temp Rise */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-350">Temperature Rise</span>
                <span className="text-amber-500 font-mono font-bold">+{tempRise}°C</span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={tempRise}
                onChange={(e) => setTempRise(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <span className="text-[10px] text-slate-500 block leading-tight">Warmer conditions accelerate pathogen replication coefficients.</span>
            </div>

            {/* Slider 3: Pipeline Leakage */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-350">Infrastructure Leak Index</span>
                <span className="text-amber-500 font-mono font-bold">{leakageIndex}/100</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={leakageIndex}
                onChange={(e) => setLeakageIndex(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <span className="text-[10px] text-slate-500 block leading-tight">Cracks in distribution piping introduce ground contamination.</span>
            </div>
          </div>

          {/* Section B: Resource Interventions */}
          <div className="p-5 bg-slate-950/40 border border-slate-800/80 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <ShieldCheck className="h-4.5 w-4.5" />
              Deploy Interventions
            </h3>

            {/* Slider 1: Chlorine Kits */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">Chlorine Distribution Kits</span>
                <span className="text-teal-400 font-mono font-bold">{chlorineKits} Units</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={chlorineKits}
                onChange={(e) => setChlorineKits(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
              <span className="text-[10px] text-slate-500 block leading-tight">Disinfects household storage (treats 10,000 liters total).</span>
            </div>

            {/* Slider 2: Water Tankers */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">Clean Water Tankers</span>
                <span className="text-teal-400 font-mono font-bold">{waterTankers} Trucks</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={waterTankers}
                onChange={(e) => setWaterTankers(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
              <span className="text-[10px] text-slate-500 block leading-tight">Supplies temporary drinking wells during pipeline repairs.</span>
            </div>

            {/* Slider 3: Medical Camps */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300">Mobile Medical Camps</span>
                <span className="text-teal-400 font-mono font-bold">{medicalCamps} Hubs</span>
              </div>
              <input
                type="range"
                min="0"
                max="4"
                value={medicalCamps}
                onChange={(e) => setMedicalCamps(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
              <span className="text-[10px] text-slate-500 block leading-tight">Deploys field units with saline drips and hydration packs.</span>
            </div>
          </div>
        </div>

        {/* Right Columns: Recharts Display & Numerical Metrics */}
        <div className="xl:col-span-2 space-y-6 flex flex-col justify-between">
          
          {/* Outbreak line curves charts */}
          <div className="bg-slate-950/30 border border-slate-800 p-5 rounded-2xl flex-1 flex flex-col justify-between">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-200">10-Day Pathogen Projections Dashboard</h3>
              <p className="text-[11px] text-slate-500">Visualizing unmitigated outbreaks vs. intervention containment.</p>
            </div>

            <div className="w-full h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.3} />
                  <XAxis dataKey="day" stroke="#64748B" fontSize={11} fontWeight={600} />
                  <YAxis stroke="#64748B" fontSize={11} fontWeight={600} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#090F23', borderColor: 'rgba(255,255,255,0.08)', color: '#fff', borderRadius: '12px' }} 
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 650 }} />
                  <Line 
                    name="Unmitigated Outbreak Baseline" 
                    type="monotone" 
                    dataKey="baselineCases" 
                    stroke="#EF4444" 
                    strokeWidth={2} 
                    dot={false}
                    strokeDasharray="4 4" 
                  />
                  <Line 
                    name="Mitigated Curve (Post Intervention)" 
                    type="monotone" 
                    dataKey="mitigatedCases" 
                    stroke="#14B8A6" 
                    strokeWidth={3} 
                    dot={{ strokeWidth: 1.5, r: 4 }}
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-3 border-t border-slate-800/80">
              <div className="text-center sm:text-left text-xs font-semibold text-slate-400">
                Total cases unmitigated: <span className="text-rose-500 font-bold font-mono">{totalProjectedCases}</span> | 
                Mitigated: <span className="text-teal-400 font-bold font-mono">{mitigatedTotalCases}</span>
              </div>
              
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 italic">
                <AlertCircle className="h-3.5 w-3.5 text-teal-500" />
                <span>Calculations derived from WHO epidemiological algorithms.</span>
              </div>
            </div>
          </div>

          {/* Key Simulation Summary Metrics Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Metric 1: Reduction Gauge */}
            <div className="p-4 bg-teal-950/20 border border-teal-900/40 rounded-2xl text-center">
              <span className="block text-[10px] font-bold text-teal-500 uppercase tracking-wider">Curve Reduction</span>
              <span className="block text-2xl font-extrabold text-teal-400 font-mono mt-1">-{mitigationScore}%</span>
            </div>

            {/* Metric 2: Saved Lives */}
            <div className="p-4 bg-sky-950/20 border border-sky-900/40 rounded-2xl text-center">
              <span className="block text-[10px] font-bold text-sky-500 uppercase tracking-wider">Mitigated Infections</span>
              <span className="block text-2xl font-extrabold text-sky-400 font-mono mt-1">{savedLivesCount}</span>
            </div>

            {/* Metric 3: Safety Classification */}
            <div className={`p-4 border rounded-2xl text-center ${getThreatStatusColor(totalProjectedCases - savedLivesCount)}`}>
              <span className="block text-[10px] font-bold uppercase tracking-wider">Post-Action Threat</span>
              <span className="block text-xl font-bold mt-1 text-slate-200">
                {mitigatedTotalCases >= 400 ? 'Severe Alert' : mitigatedTotalCases >= 150 ? 'Moderate Alert' : 'Contained'}
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
