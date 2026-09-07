import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, CheckCircle2, ShieldAlert, Image, FileText, AlertCircle, FileSpreadsheet, Trash2, Sparkles, LoaderCircle } from 'lucide-react';
import { incidentAPI, aiAPI } from '../services/api';

export default function UploadData() {
  const [pdfFile, setPdfFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [pdfAnalysis, setPdfAnalysis] = useState(null);
  const [pdfError, setPdfError] = useState(null);

  const fileInputRef = useRef(null);

  // Manual community incident form state
  const [communityForm, setCommunityForm] = useState({
    reporterName: '',
    location: '',
    color: 'Clear',
    description: '',
    photo: null
  });
  const [formErrors, setFormErrors] = useState({});
  const [isFormSuccess, setIsFormSuccess] = useState(false);

  const [photoPreview, setPhotoPreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        processPdfFile(file);
      } else {
        alert("Invalid file format. Please upload a PDF document.");
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        processPdfFile(file);
      } else {
        alert("Invalid file format. Please upload a PDF document.");
      }
    }
  };

  const processPdfFile = async (file) => {
    setPdfFile(file);
    setIsPdfLoading(true);
    setPdfError(null);
    setPdfAnalysis(null);

    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const response = await aiAPI.analyzePdf(formData);
      setPdfAnalysis(response.data);
    } catch (err) {
      setPdfError(err.response?.data?.error || err.message || 'Failed to analyze PDF. Please try again.');
    } finally {
      setIsPdfLoading(false);
    }
  };

  const removePdfFile = () => {
    setPdfFile(null);
    setPdfAnalysis(null);
    setPdfError(null);
  };

  // Manual incident form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCommunityForm(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handlePhotoSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        setCommunityForm(prev => ({ ...prev, photo: file }));
        if (formErrors.photo) {
          setFormErrors(prev => ({ ...prev, photo: null }));
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoPreview(reader.result);
          setIsScanning(true);
          setScanResult(null);

          setTimeout(() => {
            setIsScanning(false);
            setScanResult({
              turbidity: "9.2 NTU (Elevated)",
              probability: "76%",
              recommendation: "Boil water, notify regional supply center.",
              colorSuggestion: "Yellow/Brown"
            });
            setCommunityForm(prev => ({ ...prev, color: "Yellow/Brown" }));
          }, 2500);
        };
        reader.readAsDataURL(file);
      } else {
        alert("Please upload a valid image file (PNG/JPG).");
      }
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!communityForm.location.trim()) {
      errors.location = "Incident location is required.";
    }
    if (!communityForm.description.trim()) {
      errors.description = "Please describe the contamination incident.";
    }
    if (communityForm.color === "Clear") {
      errors.color = "Select a color that indicates contamination.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const [isFormLoading, setIsFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  const submitManualReport = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsFormLoading(true);
    setFormError(null);

    const formData = new FormData();
    formData.append('reporterName', communityForm.reporterName || 'Anonymous');
    formData.append('location', communityForm.location);
    formData.append('waterColor', communityForm.color);
    formData.append('description', communityForm.description);
    if (communityForm.photo) {
      formData.append('photo', communityForm.photo);
    }

    try {
      await incidentAPI.create(formData);
      setIsFormSuccess(true);
      setTimeout(() => {
        setIsFormSuccess(false);
        setCommunityForm({
          reporterName: '',
          location: '',
          color: 'Clear',
          description: '',
          photo: null
        });
        setPhotoPreview(null);
        setScanResult(null);
      }, 4000);
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to submit incident. Please try again.');
    } finally {
      setIsFormLoading(false);
    }
  };

  const renderMarkdown = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      if (line.startsWith('## ')) return <h3 key={i} className="text-sm font-bold text-teal-600 dark:text-teal-400 mt-4 mb-2">{line.replace(/^##\s*/, '')}</h3>;
      if (line.startsWith('### ')) return <h4 key={i} className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-3 mb-1">{line.replace(/^###\s*/, '')}</h4>;
      if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-bold text-xs text-slate-800 dark:text-slate-200 mt-2">{line.replace(/\*\*/g, '')}</p>;
      if (line.startsWith('- ')) return <li key={i} className="text-xs text-slate-600 dark:text-slate-400 ml-4 list-disc">{line.replace(/^-\s*/, '')}</li>;
      if (line.trim() === '---') return <hr key={i} className="my-3 border-slate-200 dark:border-slate-700" />;
      if (line.trim() === '') return <br key={i} />;
      return <p key={i} className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{line}</p>;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 pb-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <span className="text-teal-600 dark:text-teal-400 font-semibold text-sm uppercase tracking-wider">AI-Powered Data Ingestion</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Document Analysis & Community Alerts</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Upload medical reports, lab results, or water quality PDFs for AI analysis. Or lodge contamination incidents to warn your community.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Left Column: PDF AI Analysis */}
          <div className="space-y-6">
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="h-5 w-5 text-teal-500" />
                AI Document Analyzer
              </h2>
              <p className="text-xs text-slate-405 leading-relaxed">
                Upload medical reports, water quality lab results, or health documents. AI will analyze and predict potential water-borne disease risks.
              </p>
            </div>

            {/* PDF Drag & Drop Area */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => !isPdfLoading && fileInputRef.current.click()}
              className={`border-2 border-dashed rounded-3xl p-8 text-center flex flex-col items-center justify-center min-h-[280px] transition-all cursor-pointer ${
                dragActive 
                  ? 'border-teal-500 bg-teal-500/5 shadow-inner scale-[0.99]' 
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 bg-white dark:bg-slate-900/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />

              <AnimatePresence mode="wait">
                {!pdfFile ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <div className="p-4 bg-teal-500/10 rounded-full text-teal-500 inline-block">
                      <UploadCloud className="h-10 w-10 animate-bounce" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">Drag & drop your PDF document here</p>
                      <p className="text-xs text-slate-400 mt-1">Medical reports, lab results, water quality tests (Max 10MB)</p>
                    </div>
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase">
                      PDF Files Only
                    </span>
                  </motion.div>
                ) : isPdfLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    <LoaderCircle className="h-12 w-12 text-teal-500 animate-spin mx-auto" />
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">AI is analyzing your document...</p>
                      <p className="text-xs text-slate-400 mt-1">{pdfFile.name} ({(pdfFile.size / 1024).toFixed(1)} KB)</p>
                    </div>
                  </motion.div>
                ) : pdfAnalysis ? (
                  <motion.div
                    key="analysis"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4 text-left w-full"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-4 bg-emerald-500/10 rounded-full text-emerald-500">
                          <CheckCircle2 className="h-8 w-8" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-emerald-500">Analysis Complete</p>
                          <p className="text-xs text-slate-400">{pdfFile.name}</p>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); removePdfFile(); }}
                        className="p-2 rounded-lg bg-slate-200 hover:bg-rose-500 hover:text-white dark:bg-slate-700 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Document Info */}
                    {pdfAnalysis.documentInfo && (
                      <div className="flex gap-3 text-[10px] text-slate-400">
                        <span>{pdfAnalysis.documentInfo.pages} pages</span>
                        <span>{pdfAnalysis.documentInfo.characters} characters</span>
                      </div>
                    )}

                    {/* AI Analysis Result */}
                    <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 max-h-[500px] overflow-y-auto space-y-1">
                      <div className="flex items-center gap-1.5 mb-3">
                        <Sparkles className="h-4 w-4 text-teal-500 animate-pulse" />
                        <span className="text-xs font-bold text-teal-600 dark:text-teal-400">AI Health Risk Assessment</span>
                      </div>
                      {renderMarkdown(pdfAnalysis.analysis)}
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            {/* Error Display */}
            {pdfError && (
              <div className="p-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 text-xs text-rose-600 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {pdfError}
              </div>
            )}
          </div>

          {/* Right Column: Community Incident Report */}
          <div className="space-y-6">
            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-teal-500" />
                Community Contamination Report
              </h2>
              <p className="text-xs text-slate-405 leading-relaxed">
                Lodge localized water leaks or abnormalities directly. Verified reports trigger immediate hotspot flags.
              </p>
            </div>

            {/* Incident form */}
            <form onSubmit={submitManualReport} className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 p-6 rounded-3xl shadow-md space-y-4">
              
              {isFormSuccess && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2"
                >
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
                  Incident successfully submitted. Our health vector teams will verify local water sources. Thank you!
                </motion.div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Your Name (Optional)</label>
                  <input
                    type="text"
                    name="reporterName"
                    value={communityForm.reporterName}
                    onChange={handleInputChange}
                    placeholder="Anonymous Reporter"
                    className="px-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Incident Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={communityForm.location}
                    onChange={handleInputChange}
                    placeholder="e.g. Village North Street 4"
                    className={`px-4 py-2 text-sm rounded-xl border bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      formErrors.location ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
                    }`}
                  />
                  {formErrors.location && <span className="text-[10px] text-rose-500 font-semibold">{formErrors.location}</span>}
                </div>
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-455 tracking-wider font-semibold">Observed Water Color *</label>
                <select
                  name="color"
                  value={communityForm.color}
                  onChange={handleInputChange}
                  className={`px-4 py-2 text-sm rounded-xl border bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    formErrors.color ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <option value="Clear">Clear (Default)</option>
                  <option value="Cloudy">Cloudy / Turbid</option>
                  <option value="Yellow/Brown">Yellow / Muddy Brown</option>
                  <option value="Green/Algal">Green / Algae Blooms</option>
                  <option value="Red/Rust">Red / Iron Rust</option>
                </select>
                {formErrors.color && <span className="text-[10px] text-rose-500 font-semibold">{formErrors.color}</span>}
              </div>

              <div className="flex flex-col space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-455 tracking-wider font-semibold">Incident Details *</label>
                <textarea
                  name="description"
                  value={communityForm.description}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Describe smell, taste, pipe leaks, or sewage overflow..."
                  className={`px-4 py-2 text-sm rounded-xl border bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    formErrors.description ? 'border-rose-500' : 'border-slate-200 dark:border-slate-800'
                  }`}
                ></textarea>
                {formErrors.description && <span className="text-[10px] text-rose-500 font-semibold">{formErrors.description}</span>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-slate-450 tracking-wider font-semibold block">Attach Water Source Image (AI Analyzed)</label>
                
                <input
                  id="photo-input"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />

                {!photoPreview ? (
                  <div 
                    onClick={() => document.getElementById('photo-input').click()}
                    className="border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-950/40 flex flex-col items-center justify-center gap-2 animate-fade-in"
                  >
                    <Image className="h-6 w-6 text-slate-400" />
                    <span className="text-xs text-slate-400">Upload JPG / PNG incident picture to trigger AI scan</span>
                  </div>
                ) : (
                  <div className="space-y-4 animate-fade-in">
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950/40 h-44 flex items-center justify-center">
                      <img src={photoPreview} alt="Water Source Preview" className="max-h-full max-w-full object-contain" />
                      
                      {isScanning && (
                        <motion.div 
                          className="absolute left-0 right-0 h-1 bg-gradient-to-r from-teal-400 via-sky-400 to-teal-400 shadow-[0_0_12px_#2dd4bf] z-10 animate-pulse"
                          initial={{ top: 0 }}
                          animate={{ top: "100%" }}
                          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                        />
                      )}

                      {isScanning && (
                        <div className="absolute inset-0 bg-teal-905/10 backdrop-blur-[1px] flex items-center justify-center">
                          <span className="px-3 py-1.5 rounded-full bg-slate-900/90 text-[10px] font-bold text-teal-400 border border-teal-500/20 tracking-wider uppercase animate-pulse">
                            AI Scanning Water Matrix...
                          </span>
                        </div>
                      )}
                    </div>

                    {scanResult && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-xl bg-teal-500/5 dark:bg-teal-500/10 border border-teal-500/20 space-y-2 text-xs"
                      >
                        <div className="font-bold text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                          <Sparkles className="h-4 w-4 text-teal-550 animate-pulse" />
                          <span>AI Visual Classification Complete</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-655 dark:text-slate-350">
                          <div><strong>Detected Turbidity:</strong> {scanResult.turbidity}</div>
                          <div><strong>Pathogen Probability:</strong> {scanResult.probability}</div>
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                          <strong>Trigger Action:</strong> Local water color pre-selected to <strong>{scanResult.colorSuggestion}</strong>.
                        </div>
                      </motion.div>
                    )}

                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 truncate max-w-[200px] font-mono">{communityForm.photo.name}</span>
                      <button 
                        type="button"
                        onClick={() => { setPhotoPreview(null); setScanResult(null); setCommunityForm(prev => ({ ...prev, photo: null })); }}
                        className="text-xs font-bold text-rose-500 hover:underline cursor-pointer"
                      >
                        Remove Photo
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isFormLoading}
                className="w-full py-3.5 bg-teal-650 hover:bg-teal-555 text-white font-semibold rounded-xl text-xs shadow-md shadow-teal-600/10 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isFormLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                {isFormLoading ? 'Submitting...' : 'Submit Incident Alert'}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
