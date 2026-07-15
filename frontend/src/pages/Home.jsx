import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Droplet, ShieldCheck, HeartPulse, Activity, AlertTriangle, ChevronRight, Eye } from 'lucide-react';
import WaterCanvas from '../components/WaterCanvas';

export default function Home() {
  const [activeZones, setActiveZones] = useState(24);
  const [waterIndex, setWaterIndex] = useState(94.2);
  const [reportsCount, setReportsCount] = useState(148);
  const [simulatedWqi, setSimulatedWqi] = useState(88);

  // Live tickers simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveZones(prev => prev + (Math.random() > 0.7 ? 1 : Math.random() > 0.7 ? -1 : 0));
      setWaterIndex(prev => {
        const diff = (Math.random() - 0.5) * 0.4;
        return parseFloat(Math.min(100, Math.max(80, prev + diff)).toFixed(1));
      });
      setReportsCount(prev => prev + (Math.random() > 0.85 ? 1 : 0));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const safeWaterPractices = [
    {
      title: "Boiling & Solar Disinfection",
      description: "Boil water for at least 1-3 minutes during flood alerts. Alternatively, use SODIS (Solar Water Disinfection) by placing PET bottles in direct sunlight for 6 hours.",
      icon: Droplet,
      color: "from-teal-500 to-emerald-400"
    },
    {
      title: "Chlorine Treatment",
      description: "Utilize government-approved chlorine tablets or solutions for bulk storage. Add 33mg of active chlorine per 20 liters of water and allow to stand for 30 minutes before drinking.",
      icon: ShieldCheck,
      color: "from-sky-500 to-indigo-500"
    },
    {
      title: "Safe Water Storage",
      description: "Store treated water in clean, narrow-neck, covered containers equipped with a tap or handle to prevent hands from making contact with the stored liquid.",
      icon: HeartPulse,
      color: "from-purple-500 to-pink-500"
    },
    {
      title: "Symptom Identification",
      description: "Monitor for acute diarrhea, stomach cramps, and high fever. Report any clustering of cases immediately via our Community Upload portal to trigger health alerts.",
      icon: AlertTriangle,
      color: "from-amber-500 to-orange-500"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 pb-20">
      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 sm:pt-20 sm:pb-28 flex flex-col-reverse lg:flex-row items-center justify-between gap-12">
        {/* Decorative ambient blobs */}
        <div className="absolute top-1/4 left-1/10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        {/* Text Content */}
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/25 text-xs font-semibold uppercase tracking-wider"
          >
            <Activity className="h-4 w-4 text-teal-500 animate-pulse" />
            <span>AI Predictive Bio-Risk Sentinel</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-slate-900 dark:text-white"
          >
            Predicting Water Health.<br />
            <span className="bg-gradient-to-r from-teal-500 to-sky-500 bg-clip-text text-transparent">
              Preventing Disease Outbreaks.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-slate-600 dark:text-slate-350 max-w-xl mx-auto lg:mx-0 leading-relaxed"
          >
            Our community early warning platform synthesizes satellite hydrology metrics, rainfall thresholds, and public health data to predict contamination risk and stop epidemics before they start.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4"
          >
            <Link
              to="/risk-checker"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 border border-transparent text-base font-semibold rounded-xl text-white bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 shadow-lg hover:shadow-teal-500/20 transform hover:-translate-y-0.5 transition-all duration-150"
            >
              Check Local Infection Risk
              <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/map"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 border border-slate-200 dark:border-slate-800 text-base font-semibold rounded-xl text-slate-700 dark:text-slate-200 bg-white/50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Eye className="mr-2 h-5 w-5 text-teal-500" />
              Explore Outbreak Map
            </Link>
          </motion.div>

          {/* Interactive slider for WQI / Wave demonstration */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm max-w-md space-y-2.5 mx-auto lg:mx-0"
          >
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-500 dark:text-slate-400">Simulate Local Contamination (WQI):</span>
              <span className={`font-bold font-mono ${simulatedWqi < 30 ? 'text-rose-500 font-extrabold animate-pulse' : simulatedWqi < 60 ? 'text-amber-500' : 'text-teal-500 dark:text-teal-400'}`}>
                {simulatedWqi} / 100 {simulatedWqi < 30 ? 'Critical' : simulatedWqi < 60 ? 'Warning' : 'Optimal'}
              </span>
            </div>
            <input 
              type="range" min="10" max="100" value={simulatedWqi} 
              onChange={(e) => setSimulatedWqi(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
            />
            <p className="text-[10px] text-slate-400 leading-tight">
              Drag slider to simulate water quality drop. Background canvas wave shifts color (Teal → Amber → Red) and velocity dynamically.
            </p>
          </motion.div>
        </div>

        {/* Abstract Animated Water SVG */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex-1 w-full max-w-md lg:max-w-xl aspect-square flex justify-center items-center"
        >
          <svg className="w-full h-full max-h-[420px]" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="blueTealGrad" x1="0" y1="0" x2="500" y2="500" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#14B8A6" />
                <stop offset="50%" stopColor="#0EA5E9" />
                <stop offset="100%" stopColor="#0A2540" />
              </linearGradient>
              <linearGradient id="pathogenGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#EF4444" />
                <stop offset="100%" stopColor="#B91C1C" />
              </linearGradient>
            </defs>

            {/* Background glowing circle */}
            <circle cx="250" cy="250" r="170" fill="url(#blueTealGrad)" fillOpacity="0.08" stroke="url(#blueTealGrad)" strokeWidth="1" strokeDasharray="5 5" />
            
            {/* Safe water molecules grid (floating) */}
            <motion.g
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, 5, 0]
              }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Molecule 1 */}
              <circle cx="160" cy="180" r="12" fill="#14B8A6" />
              <circle cx="130" cy="205" r="7" fill="#38BDF8" />
              <circle cx="190" cy="205" r="7" fill="#38BDF8" />
              <line x1="160" y1="180" x2="130" y2="205" stroke="#E2E8F0" strokeWidth="2" opacity="0.6" />
              <line x1="160" y1="180" x2="190" y2="205" stroke="#E2E8F0" strokeWidth="2" opacity="0.6" />

              {/* Molecule 2 */}
              <circle cx="340" cy="150" r="14" fill="#0EA5E9" />
              <circle cx="310" cy="120" r="8" fill="#14B8A6" />
              <circle cx="370" cy="120" r="8" fill="#14B8A6" />
              <line x1="340" y1="150" x2="310" y2="120" stroke="#E2E8F0" strokeWidth="2" opacity="0.6" />
              <line x1="340" y1="150" x2="370" y2="120" stroke="#E2E8F0" strokeWidth="2" opacity="0.6" />
            </motion.g>

            {/* central dynamic water ripples representation */}
            <motion.path
              d="M 120,250 Q 185,210 250,250 T 380,250"
              stroke="#0D9488"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
              opacity="0.8"
              animate={{
                d: [
                  "M 120,250 Q 185,210 250,250 T 380,250",
                  "M 120,250 Q 185,290 250,250 T 380,250",
                  "M 120,250 Q 185,210 250,250 T 380,250"
                ]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.path
              d="M 140,280 Q 200,310 260,280 T 360,280"
              stroke="#38BDF8"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              opacity="0.6"
              animate={{
                d: [
                  "M 140,280 Q 200,310 260,280 T 360,280",
                  "M 140,280 Q 200,250 260,280 T 360,280",
                  "M 140,280 Q 200,310 260,280 T 360,280"
                ]
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Pathogens getting broken down / filtered */}
            <motion.g
              animate={{
                x: [0, 8, 0],
                y: [0, -12, 0]
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* Pathogen node */}
              <g className="filter-pathogen">
                <line x1="280" y1="310" x2="280" y2="350" stroke="#EF4444" strokeWidth="2" />
                <line x1="260" y1="330" x2="300" y2="330" stroke="#EF4444" strokeWidth="2" />
                <line x1="266" y1="316" x2="294" y2="344" stroke="#EF4444" strokeWidth="2" />
                <line x1="266" y1="344" x2="294" y2="316" stroke="#EF4444" strokeWidth="2" />
                <circle cx="280" cy="330" r="14" fill="url(#pathogenGrad)" />
                <circle cx="280" cy="330" r="6" fill="#F87171" opacity="0.7" />
              </g>

              {/* Shield breaking it down */}
              <motion.path
                d="M 230,300 A 70,70 0 0,0 330,300"
                stroke="#14B8A6"
                strokeWidth="3"
                strokeDasharray="4 4"
                fill="none"
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              />
            </motion.g>

            {/* Floating details / text indicator on SVG */}
            <rect x="300" y="270" width="110" height="40" rx="8" fill="#0F172A" opacity="0.9" stroke="rgba(255,255,255,0.1)" />
            <text x="312" y="294" fill="#14B8A6" fontSize="11" fontWeight="bold">WQI: 94.2 Optimal</text>
          </svg>
        </motion.div>

        {/* Particle wave canvas background */}
        <div className="absolute bottom-0 left-0 right-0 h-36 overflow-hidden pointer-events-none -z-10">
          <WaterCanvas contaminationLevel={100 - simulatedWqi} />
        </div>
      </section>

      {/* Live Stats Ticker Banner */}
      <section className="bg-gradient-to-r from-slate-900 to-[#0A2540] text-white py-6 border-y border-slate-800 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <span className="text-xs uppercase text-teal-400 font-semibold tracking-wider">Live System Metrics</span>
            <h3 className="text-lg font-bold text-slate-100">National Hydrology & Risk Sentinel Feed</h3>
          </div>
          
          <div className="flex flex-wrap justify-center sm:justify-end items-center gap-6 sm:gap-12">
            <div className="text-center">
              <span className="block text-2xl sm:text-3xl font-extrabold text-teal-400 tracking-tight font-mono">
                {activeZones}
              </span>
              <span className="text-xs text-slate-400">Monitoring Districts</span>
            </div>
            
            <div className="text-center">
              <span className="block text-2xl sm:text-3xl font-extrabold text-sky-400 tracking-tight font-mono">
                {waterIndex}%
              </span>
              <span className="text-xs text-slate-400">Safe Water Index</span>
            </div>

            <div className="text-center">
              <span className="block text-2xl sm:text-3xl font-extrabold text-indigo-400 tracking-tight font-mono">
                {reportsCount}
              </span>
              <span className="text-xs text-slate-400">Incidents Logged (24h)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Educational Section (Safe Water Practices) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="text-teal-600 dark:text-teal-400 font-semibold text-sm uppercase tracking-wider">Public Health Guide</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">Safe Water Practices & Interventions</h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            Protect your household from water-borne diseases during monsoon surges and reservoir contamination events with standard disinfection guidelines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {safeWaterPractices.map((practice, index) => {
            const Icon = practice.icon;
            return (
              <motion.div
                key={practice.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/50 dark:border-slate-800/80 shadow-md card-hover"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${practice.color} text-white mb-5 shadow-inner`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{practice.title}</h3>
                <p className="text-slate-650 dark:text-slate-400 text-sm leading-relaxed">{practice.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
