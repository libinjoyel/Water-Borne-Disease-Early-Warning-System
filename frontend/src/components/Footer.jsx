import React from 'react';
import { Link } from 'react-router-dom';
import { Droplet, Mail, Phone, MapPin, Heart, ShieldAlert } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-12 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* About column */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-gradient-to-tr from-teal-500 to-sky-500 rounded-lg">
              <Droplet className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-white tracking-tight">
              Aqua<span className="text-teal-400 font-semibold">Guard</span>
            </span>
          </div>
          <p className="text-sm leading-relaxed">
            Predictive intelligence for water safety. Helping local communities, field research units, and health departments intercept water-borne pathogen outbreaks before they spread.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">System Nav</h3>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/" className="hover:text-teal-400 transition-colors">Home</Link></li>
            <li><Link to="/dashboard" className="hover:text-teal-400 transition-colors">Executive Dashboard</Link></li>
            <li><Link to="/map" className="hover:text-teal-400 transition-colors">Interactive Outbreak Map</Link></li>
            <li><Link to="/risk-checker" className="hover:text-teal-400 transition-colors">Risk & Symptom Checker</Link></li>
            <li><Link to="/upload" className="hover:text-teal-400 transition-colors">Reporting Portal</Link></li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h3 className="text-white font-semibold mb-4 text-sm tracking-wider uppercase">Emergency Info</h3>
          <ul className="space-y-2.5 text-sm">
            <li className="flex items-center space-x-2 text-rose-400 font-medium">
              <ShieldAlert className="h-4 w-4" />
              <span>National Health Helpline: 112</span>
            </li>
            <li className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-teal-400" />
              <span>Emergency Center: 1800-345-0099</span>
            </li>
            <li className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-teal-400" />
              <span>alerts@aquaguard.gov.in</span>
            </li>
          </ul>
        </div>

        {/* Disclaimer / Mission */}
        <div className="space-y-4">
          <h3 className="text-white font-semibold text-sm tracking-wider uppercase">Disclaimer</h3>
          <p className="text-xs leading-relaxed text-slate-500">
            This dashboard uses satellite data, telemetry, and manual community submissions. Predictions are analytical simulations and should be verified alongside official medical reports. Boiling municipal/open water remains recommended during local heavy rainfall periods.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-slate-800 text-center text-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <span>© {new Date().getFullYear()} AquaGuard Warning System. All rights reserved.</span>
        <span className="flex items-center gap-1">
          Developed with <Heart className="h-3 w-3 text-teal-400 fill-teal-400" /> for Smart Community Health
        </span>
      </div>
    </footer>
  );
}
