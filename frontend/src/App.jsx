import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import MapPage from './pages/MapPage';
import RiskChecker from './pages/RiskChecker';
import UploadData from './pages/UploadData';
import AboutContact from './pages/AboutContact';

function App() {
  const [isAdminMode, setIsAdminMode] = useState(() => {
    return localStorage.getItem('isAdminMode') === 'true';
  });

  const toggleAdminMode = () => {
    setIsAdminMode(prev => {
      const next = !prev;
      localStorage.setItem('isAdminMode', String(next));
      return next;
    });
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-300 flex flex-col font-sans">
        {/* Sticky navigation glassmorphism */}
        <Navbar isAdminMode={isAdminMode} toggleAdminMode={toggleAdminMode} />

        {/* Dynamic page routes render */}
        <main className="flex-1 w-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard isAdminMode={isAdminMode} />} />
            <Route path="/map" element={<MapPage isAdminMode={isAdminMode} />} />
            <Route path="/risk-checker" element={<RiskChecker />} />
            <Route path="/upload" element={<UploadData isAdminMode={isAdminMode} />} />
            <Route path="/about" element={<AboutContact />} />
          </Routes>
        </main>

        {/* Global Footer info board */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;

