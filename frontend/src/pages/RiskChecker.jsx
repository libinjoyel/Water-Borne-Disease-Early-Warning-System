import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, User, Droplet, Sparkles, Download, ArrowRight, ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react';
import { riskAPI, locationAPI } from '../services/api';

export default function RiskChecker() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Other',
    district: 'District Central',
    symptoms: { fever: false, cramps: false, diarrhea: false, vomiting: false },
    waterSource: 'Tap Water',
    recentFlooding: 'No',
  });
  const [showResult, setShowResult] = useState(false);
  const [calculationRisk, setCalculationRisk] = useState({ score: 0, level: 'Low', color: 'text-emerald-500 bg-emerald-500/10' });
  const [environmentalRisk, setEnvironmentalRisk] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const totalSteps = 3;

  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleSymptom = (symptom) => {
    setFormData(prev => ({
      ...prev,
      symptoms: { ...prev.symptoms, [symptom]: !prev.symptoms[symptom] },
    }));
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(prev => prev + 1);
    } else {
      calculateRiskScore();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(prev => prev - 1);
  };

  const calculateRiskScore = async () => {
    setIsCalculating(true);

    let symptomScore = 0;
    if (formData.symptoms.diarrhea) symptomScore += 35;
    if (formData.symptoms.vomiting) symptomScore += 25;
    if (formData.symptoms.fever) symptomScore += 20;
    if (formData.symptoms.cramps) symptomScore += 15;
    if (formData.waterSource === 'Open Well' || formData.waterSource === 'Borewell') symptomScore += 15;
    if (formData.recentFlooding === 'Yes') symptomScore += 25;
    symptomScore = Math.min(100, symptomScore);

    let envScore = null;
    try {
      const locRes = await locationAPI.getAll();
      const locations = locRes.data.locations || [];
      const match = locations.find(l =>
        l.district?.toLowerCase() === formData.district.toLowerCase() ||
        l.name?.toLowerCase() === formData.district.toLowerCase()
      );

      if (match) {
        const riskRes = await riskAPI.getForLocation(match._id);
        if (riskRes.data.risk) {
          envScore = riskRes.data.risk.score;
          setEnvironmentalRisk(riskRes.data.risk);
        }
      }
    } catch {}

    const finalScore = envScore !== null
      ? Math.round((symptomScore * 0.5) + (envScore * 0.5))
      : symptomScore;

    let level = 'Low';
    let color = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';

    if (finalScore >= 60) {
      level = 'High';
      color = 'text-rose-500 bg-rose-500/10 border-rose-500/20';
    } else if (finalScore >= 25) {
      level = 'Medium';
      color = 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    }

    setCalculationRisk({ score: finalScore, level, color });
    setIsCalculating(false);
    setShowResult(true);
  };

  const resetWizard = () => {
    setFormData({
      name: '', age: '', gender: 'Other', district: 'District Central',
      symptoms: { fever: false, cramps: false, diarrhea: false, vomiting: false },
      waterSource: 'Tap Water', recentFlooding: 'No',
    });
    setStep(1);
    setShowResult(false);
    setEnvironmentalRisk(null);
  };

  const triggerPdfDownload = () => window.print();

  const progressPercent = (step / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 pb-28">
      <div className="max-w-2xl mx-auto px-4 pt-12 space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-teal-500/10 rounded-2xl text-teal-600 dark:text-teal-400 border border-teal-500/20">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">AI Infection Risk Checker</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Evaluate your localized biological vulnerability based on symptoms, hydrology index, and regional active clusters.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-3xl shadow-xl overflow-hidden p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {!showResult ? (
              <motion.div key="wizard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <span>Step {step} of {totalSteps}</span>
                    <span>{Math.round(progressPercent)}% Completed</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div className="h-full bg-gradient-to-r from-teal-500 to-sky-500" initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 0.3 }} />
                  </div>
                </div>

                <div className="py-4 min-h-[220px]">
                  {step === 1 && (
                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <User className="h-5 w-5 text-teal-500" /> Patient Profile details
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col space-y-1.5">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                          <input type="text" name="name" value={formData.name} onChange={handleTextChange} placeholder="Optional"
                            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500" />
                        </div>
                        <div className="flex flex-col space-y-1.5">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Age (Years)</label>
                          <input type="number" name="age" value={formData.age} onChange={handleTextChange} placeholder="e.g. 28"
                            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col space-y-1.5">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gender</label>
                          <select name="gender" value={formData.gender} onChange={handleTextChange}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500">
                            <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                          </select>
                        </div>
                        <div className="flex flex-col space-y-1.5">
                          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current District</label>
                          <select name="district" value={formData.district} onChange={handleTextChange}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500">
                            <option value="District Central">District Central</option>
                            <option value="District East">District East</option>
                            <option value="District South">District South</option>
                            <option value="District West">District West</option>
                            <option value="District North">District North</option>
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-teal-500 animate-pulse" /> Symptom Assessment Profile
                      </h3>
                      <p className="text-xs text-slate-400">Select any symptoms that you have experienced over the past 48 hours.</p>
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        {Object.keys(formData.symptoms).map((sym) => (
                          <button key={sym} type="button" onClick={() => toggleSymptom(sym)}
                            className={`py-3.5 px-4 rounded-2xl border font-bold text-sm tracking-wide capitalize flex items-center justify-between transition-all ${formData.symptoms[sym] ? 'bg-teal-500/10 border-teal-500 text-teal-600 dark:text-teal-400 shadow-md shadow-teal-500/5' : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 text-slate-600 dark:text-slate-350'}`}>
                            <span>{sym}</span>
                            <div className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center ${formData.symptoms[sym] ? 'border-teal-500 bg-teal-500 text-white' : 'border-slate-300 dark:border-slate-700'}`}>
                              {formData.symptoms[sym] && <span className="text-[9px] font-extrabold">&#10003;</span>}
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-5">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Droplet className="h-5 w-5 text-teal-500" /> Hydrology & Environment Factors
                      </h3>
                      <div className="flex flex-col space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Primary Drinking Water Source</label>
                        <select name="waterSource" value={formData.waterSource} onChange={handleTextChange}
                          className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500">
                          <option value="Tap Water">Piped Tap Water (Municipal)</option>
                          <option value="Open Well">Open Well / Reservoir</option>
                          <option value="Borewell">Deep Tube Well / Borewell</option>
                          <option value="Bottled">Packaged / Bottled Water</option>
                        </select>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Has your local neighborhood experienced recent flooding or pipeline leaks?</label>
                        <div className="grid grid-cols-2 gap-3">
                          {['Yes', 'No'].map((option) => (
                            <button key={option} type="button" onClick={() => setFormData(prev => ({ ...prev, recentFlooding: option }))}
                              className={`py-3 rounded-xl border font-bold text-sm transition-all ${formData.recentFlooding === option ? 'bg-teal-500/10 border-teal-500 text-teal-600 dark:text-teal-400 shadow-sm' : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-550 dark:text-slate-455'}`}>
                              {option === 'Yes' ? '\u26A0\uFE0F Yes, within last 14 days' : '\u2713 No reports'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-850">
                  <button onClick={handleBack} disabled={step === 1}
                    className={`px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-850 text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${step === 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                  <button onClick={handleNext} disabled={isCalculating}
                    className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-teal-600/10 hover:shadow-teal-500/20 cursor-pointer disabled:opacity-60">
                    {isCalculating ? (
                      <><div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin mr-1" /> Calculating...</>
                    ) : (
                      <>{step === totalSteps ? 'Calculate Risk' : 'Continue'} <ArrowRight className="h-4 w-4" /></>
                    )}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 text-center">
                <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="80" cy="80" r="70" fill="transparent" stroke="rgba(241,245,249,0.1)" strokeWidth="12" />
                    <circle cx="80" cy="80" r="70" fill="transparent"
                      stroke={calculationRisk.level === 'High' ? '#EF4444' : calculationRisk.level === 'Medium' ? '#F59E0B' : '#10B981'}
                      strokeWidth="12" strokeDasharray={440} strokeDashoffset={440 - (440 * calculationRisk.score) / 100} strokeLinecap="round" />
                  </svg>
                  <div className="absolute text-center">
                    <span className="block text-3xl font-extrabold font-mono text-slate-900 dark:text-white">{calculationRisk.score}%</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Threat Index</span>
                  </div>
                </div>

                <div className="max-w-md mx-auto">
                  <div className={`p-4 rounded-2xl border text-sm ${calculationRisk.color} flex flex-col items-center gap-1.5`}>
                    <span className="font-extrabold text-base tracking-wide uppercase">{calculationRisk.level} Threat Risk detected</span>
                    <p className="text-xs leading-relaxed max-w-sm text-center">
                      {calculationRisk.level === 'High' && 'Seek Medical Attention Immediately. Severe clinical factors (diarrhea/vomiting clusters) identified alongside regional contamination indicators. Report details to safety teams.'}
                      {calculationRisk.level === 'Medium' && 'Monitor & Boil Water. Moderate risk indices. Heavy local rainfall indicates elevated water contamination risk. Ensure all domestic drinking supply is boiled for 3 minutes.'}
                      {calculationRisk.level === 'Low' && 'Safe. Continue standard sanitation procedures. No acute environmental or symptom vectors reported in your immediate cluster zone.'}
                    </p>
                  </div>
                </div>

                {environmentalRisk && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-left text-xs space-y-1.5">
                    <span className="font-bold text-teal-600 dark:text-teal-400 block text-center">Environmental Risk Factor (from local weather data)</span>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      {environmentalRisk.factors && (
                        <>
                          <div><span className="text-slate-400">Temp</span><br /><span className="font-bold font-mono">{environmentalRisk.factors.temperature.value}°C ({environmentalRisk.factors.temperature.score}pts)</span></div>
                          <div><span className="text-slate-400">Humidity</span><br /><span className="font-bold font-mono">{environmentalRisk.factors.humidity.value}% ({environmentalRisk.factors.humidity.score}pts)</span></div>
                          <div><span className="text-slate-400">Rainfall</span><br /><span className="font-bold font-mono">{environmentalRisk.factors.rainfall.value}mm ({environmentalRisk.factors.rainfall.score}pts)</span></div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div id="patient-report-card" className="hidden print:block text-left text-xs text-slate-800 space-y-2.5 p-6 border rounded-xl border-slate-300">
                  <h2 className="text-sm font-bold border-b pb-1 text-slate-900">AquaGuard - Biosentinel Risk Report</h2>
                  <div className="grid grid-cols-2 gap-2">
                    <div><strong>Name:</strong> {formData.name || 'Anonymous Patient'}</div>
                    <div><strong>Age/Gender:</strong> {formData.age || 'N/A'} / {formData.gender}</div>
                    <div><strong>District:</strong> {formData.district}</div>
                    <div><strong>Water Source:</strong> {formData.waterSource}</div>
                  </div>
                  <div><strong>Reported Symptoms:</strong> {Object.keys(formData.symptoms).filter(s => formData.symptoms[s]).join(', ') || 'None'}</div>
                  <div><strong>Environmental Flooding:</strong> {formData.recentFlooding}</div>
                  <div className="pt-2 border-t font-semibold">Calculated Threat Index: {calculationRisk.score}% ({calculationRisk.level} Risk)</div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 justify-center pt-6 border-t border-slate-100 dark:border-slate-850">
                  <button onClick={resetWizard}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-850 text-sm font-semibold flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                    <RefreshCw className="h-4.5 w-4.5" /> Reset Evaluation
                  </button>
                  <button onClick={triggerPdfDownload}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-teal-600/10 cursor-pointer">
                    <Download className="h-4.5 w-4.5" /> Download Medical Report
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
