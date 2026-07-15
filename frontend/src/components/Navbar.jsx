import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Droplet, MapPin, Activity, ShieldAlert, UploadCloud, Sun, Moon, Menu, X, Info } from 'lucide-react';

export default function Navbar({ isAdminMode, toggleAdminMode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [locationName, setLocationName] = useState('Fetching location...');
  const location = useLocation();

  useEffect(() => {
    // Theme setup
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    // Geolocation fetch
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            // Simulated reverse geocoding or fallback to coordinates
            // In a real app we'd fetch from an API, here we simulate a readable district name
            setTimeout(() => {
              setLocationName(`District South-East (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`);
            }, 1000);
          } catch (error) {
            setLocationName('District Central (Default)');
          }
        },
        (error) => {
          setLocationName('District Central (Default)');
        }
      );
    } else {
      setLocationName('District Central (Default)');
    }
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: Droplet },
    { name: 'Dashboard', path: '/dashboard', icon: Activity },
    { name: 'Outbreak Map', path: '/map', icon: MapPin },
    { name: 'Risk Checker', path: '/risk-checker', icon: ShieldAlert },
    { name: 'Upload Data', path: '/upload', icon: UploadCloud },
    { name: 'About & Contact', path: '/about', icon: Info },
  ];

  const filteredNavLinks = navLinks.filter(link => {
    if (link.path === '/upload') return isAdminMode;
    return true;
  });

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full transition-all duration-300 glassmorphism border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="p-2 bg-gradient-to-tr from-teal-500 to-sky-500 rounded-xl shadow-md group-hover:scale-105 transition-transform">
                <Droplet className="h-6 w-6 text-white animate-pulse" />
              </div>
              <span className="font-bold text-lg sm:text-xl tracking-tight text-slate-800 dark:text-white group-hover:text-teal-500 dark:group-hover:text-teal-400 transition-colors">
                Aqua<span className="text-teal-600 dark:text-teal-400 font-semibold">Guard</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {filteredNavLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-250 ${
                    isActive(link.path)
                      ? 'bg-teal-500/10 text-teal-650 dark:text-teal-400 border border-teal-500/20'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right section controls */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Mode Switcher Pill */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-full border border-slate-200/50 dark:border-slate-700/50 relative overflow-hidden select-none">
              <button
                onClick={() => !isAdminMode && toggleAdminMode()}
                className={`px-3 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full transition-all duration-200 cursor-pointer ${
                  isAdminMode 
                    ? 'bg-teal-500 text-white shadow' 
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                Admin
              </button>
              <button
                onClick={() => isAdminMode && toggleAdminMode()}
                className={`px-3 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full transition-all duration-200 cursor-pointer ${
                  !isAdminMode 
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-300 shadow' 
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                Citizen
              </button>
            </div>

            {/* Geolocation indicator */}
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate max-w-[180px]">
                {locationName}
              </span>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile controls & toggle */}
          <div className="flex lg:hidden items-center space-x-3">
            {/* Mode Switcher Pill Mobile */}
            <div className="flex bg-slate-105 dark:bg-slate-800 p-0.5 rounded-full border border-slate-200/50 dark:border-slate-700/50 relative overflow-hidden select-none">
              <button
                onClick={toggleAdminMode}
                className="px-2.5 py-1 text-[9px] font-bold tracking-wider uppercase rounded-full bg-teal-500 text-white shadow"
              >
                {isAdminMode ? "Admin" : "Citizen"}
              </button>
            </div>

            {/* Theme Toggle Mobile */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {/* Geolocation indicator mobile */}
            <div className="flex items-center space-x-2 px-3 py-2 mx-2 mb-2 rounded-lg bg-slate-100 dark:bg-slate-800">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 truncate">
                {locationName}
              </span>
            </div>

            {filteredNavLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg text-base font-medium transition-colors ${
                    isActive(link.path)
                      ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="h-5 w-5 text-teal-500" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
