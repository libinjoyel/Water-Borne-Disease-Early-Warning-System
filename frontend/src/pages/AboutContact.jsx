import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Network, Database, Cpu, Map, Phone, Mail, Globe, Clock, ShieldAlert, Send } from 'lucide-react';

export default function AboutContact() {
  // Contact Form State
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: 'Inquiry',
    message: ''
  });
  const [isSuccess, setIsSuccess] = useState(false);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (contactForm.name && contactForm.email && contactForm.message) {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setContactForm({ name: '', email: '', subject: 'Inquiry', message: '' });
      }, 4000);
    } else {
      alert("Please fill in all required contact fields.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  };

  const algorithmTimeline = [
    {
      step: "01",
      title: "Heterogeneous Data Ingestion",
      description: "Aggregating telemetry logs from municipal water lines, satellite rainfall readings, humidity, and community incident reports in real time.",
      icon: Database,
      color: "text-teal-400 bg-teal-500/10 border-teal-500/20"
    },
    {
      step: "02",
      title: "Predictive ML Processing",
      description: "Our machine learning nodes parse hydrology history to calculate risk vectors based on humidity coefficients, temperature spikes, and critical rainfall thresholds.",
      icon: Cpu,
      color: "text-sky-400 bg-sky-500/10 border-sky-500/20"
    },
    {
      step: "03",
      title: "Alert Mapping & Mobilization",
      description: "Dynamic disease heatmaps and risk projections are broadcasted. Automated containment instructions are sent to localized health emergency units.",
      icon: Map,
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
    }
  ];

  const emergencyHelplines = [
    { name: "National Health Portal (NHP)", phone: "1800-180-1104", desc: "For general disease outbreak consultation." },
    { name: "National Center for Disease Control", phone: "011-23913148", desc: "Epidemiological support & health telemetry alerts." },
    { name: "Emergency Response Support", phone: "112", desc: "Immediate disaster medical evacuation." },
    { name: "Water Supply Quality Board", phone: "1800-425-1777", desc: "Report pipeline leakage/municipal contamination." }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 pb-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-20">
        
        {/* Section 1: About the System & Algorithm Timeline */}
        <section className="space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-teal-600 dark:text-teal-400 font-semibold text-sm uppercase tracking-wider">Predictive Architecture</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">How AquaGuard Works</h1>
            <p className="text-slate-500 dark:text-slate-400">
              Integrating telemetry, climatological coefficients, and community sensor inputs to prevent epidemic transmission.
            </p>
          </div>

          {/* Timeline flow */}
          <div className="relative max-w-5xl mx-auto pt-6">
            {/* Center connector line (Desktop only) */}
            <div className="absolute top-[80px] bottom-10 left-1/2 -ml-px w-0.5 bg-slate-200 dark:bg-slate-800 hidden md:block" />

            <div className="space-y-12 md:space-y-20">
              {algorithmTimeline.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className={`flex flex-col md:flex-row items-center md:justify-between gap-6 md:gap-16 ${
                      index % 2 === 1 ? 'md:flex-row-reverse' : ''
                    }`}
                  >
                    {/* Content Block */}
                    <div className="flex-1 space-y-3 text-center md:text-left md:px-6">
                      <div className="flex items-center justify-center md:justify-start gap-3">
                        <span className="text-2xl font-extrabold font-mono text-teal-500">{item.step}</span>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{item.title}</h3>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    {/* Timeline Node Icon */}
                    <div className="relative z-10 flex items-center justify-center">
                      <div className={`p-4 rounded-3xl border shadow-lg ${item.color} transform hover:rotate-6 transition-transform`}>
                        <Icon className="h-7 w-7" />
                      </div>
                    </div>

                    {/* Spacer element for row alignment balance */}
                    <div className="flex-1 hidden md:block" />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Section 2: Contact & Emergency Helplines */}
        <section className="space-y-12 pt-12 border-t border-slate-200/65 dark:border-slate-850">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-teal-600 dark:text-teal-400 font-semibold text-sm uppercase tracking-wider">Get in Touch</span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Emergency Helplines & Inquiry</h2>
            <p className="text-slate-500 dark:text-slate-400">
              Need validation support, municipal coordination, or general details? Contact health teams.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Left: Contact Form */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 p-6 sm:p-8 rounded-3xl shadow-md space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Send Inquiry</h3>
              
              {isSuccess && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 bg-emerald-500/10 border border-emerald-500/35 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-semibold"
                >
                  Your message has been sent successfully. Health administrators will reply shortly!
                </motion.div>
              )}

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Your Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={contactForm.name}
                      onChange={handleChange}
                      required
                      placeholder="e.g. John Doe"
                      className="px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={contactForm.email}
                      onChange={handleChange}
                      required
                      placeholder="e.g. john@example.com"
                      className="px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Inquiry Subject</label>
                  <select
                    name="subject"
                    value={contactForm.subject}
                    onChange={handleChange}
                    className="px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="Inquiry">General Inquiry</option>
                    <option value="Validation">Model Validation / API Access</option>
                    <option value="Reporting">Report Outbreak Cluster</option>
                    <option value="TechSupport">Technical System Support</option>
                  </select>
                </div>

                <div className="flex flex-col space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Message *</label>
                  <textarea
                    name="message"
                    value={contactForm.message}
                    onChange={handleChange}
                    required
                    rows="4"
                    placeholder="Enter details of your inquiry..."
                    className="px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-teal-600/10 cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  Send Inquiry Message
                </button>
              </form>
            </div>

            {/* Right: Emergency Contacts Grid */}
            <div className="space-y-6 flex flex-col justify-between">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-rose-500 animate-pulse" />
                  Emergency Helpline contacts
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  During high-risk disease surges, contact these desks immediately for medical support or sanitization supplies.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {emergencyHelplines.map((hp) => (
                    <div key={hp.name} className="p-4 bg-slate-950/40 rounded-2xl border border-slate-850 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">{hp.name}</h4>
                        <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{hp.desc}</p>
                      </div>
                      <span className="text-sm font-bold text-teal-400 font-mono mt-3.5 block">{hp.phone}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Physical Location Detail Card */}
              <div className="bg-slate-100 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-850 p-5 rounded-3xl flex items-center gap-4">
                <Globe className="h-8 w-8 text-teal-555 shrink-0" />
                <div className="text-xs">
                  <span className="font-bold text-slate-900 dark:text-white block mb-0.5">National Bio-Risk Control Command</span>
                  Sector 4, Rajendra Nagar, New Delhi, India 110023
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
