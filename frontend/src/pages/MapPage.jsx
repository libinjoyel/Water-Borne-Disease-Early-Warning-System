import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  ShieldCheck, MapPin, Activity, AlertTriangle, Layers, CloudRain, Sun, X, Check, Droplets, Info, Truck, Sparkles, RefreshCw 
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend as RechartsLegend, ResponsiveContainer 
} from 'recharts';

// Setup Leaflet icon fix to prevent broken asset image links in production
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Mock hotspot coordinates
const HOTSPOTS_DATA = {
  "Cholera": {
    "7 days": [
      { id: 1, name: "District East - Cluster A", coords: [17.3850, 78.4867], risk: "High", cases: 48, temp: 28, humidity: 82, rainfall: 140, advise: "Boil all drinking water, distribute chlorine pills." },
      { id: 2, name: "District South - Cluster C", coords: [17.3450, 78.5200], risk: "Medium", cases: 14, temp: 29, humidity: 75, rainfall: 90, advise: "Monitor public wells, test turbidity levels." }
    ],
    "30 days": [
      { id: 1, name: "District East - Cluster A", coords: [17.3850, 78.4867], risk: "High", cases: 94, temp: 27, humidity: 85, rainfall: 280, advise: "Boil all drinking water, distribute chlorine pills." },
      { id: 2, name: "District South - Cluster C", coords: [17.3450, 78.5200], risk: "High", cases: 45, temp: 28, humidity: 80, rainfall: 190, advise: "Monitor public wells, test turbidity levels." },
      { id: 3, name: "District West - Cluster B", coords: [17.4100, 78.4100], risk: "Medium", cases: 22, temp: 30, humidity: 68, rainfall: 110, advise: "Clean standing water, vector sanitation control." }
    ],
    "6 months": [
      { id: 1, name: "District East - Cluster A", coords: [17.3850, 78.4867], risk: "High", cases: 240, temp: 26, humidity: 88, rainfall: 420, advise: "Boil all drinking water, distribute chlorine pills." },
      { id: 2, name: "District South - Cluster C", coords: [17.3450, 78.5200], risk: "High", cases: 115, temp: 27, humidity: 83, rainfall: 310, advise: "Monitor public wells, test turbidity levels." },
      { id: 3, name: "District West - Cluster B", coords: [17.4100, 78.4100], risk: "Medium", cases: 68, temp: 29, humidity: 70, rainfall: 180, advise: "Clean standing water, vector sanitation control." }
    ]
  },
  "Typhoid": {
    "7 days": [
      { id: 4, name: "District Central - Cluster T1", coords: [17.3990, 78.4700], risk: "Medium", cases: 18, temp: 30, humidity: 72, rainfall: 85, advise: "Vaccinate cluster contacts, test food vendor ice/water source safety." }
    ],
    "30 days": [
      { id: 4, name: "District Central - Cluster T1", coords: [17.3990, 78.4700], risk: "High", cases: 42, temp: 29, humidity: 76, rainfall: 170, advise: "Vaccinate cluster contacts, test food vendor ice/water source safety." },
      { id: 5, name: "District North - Cluster T2", coords: [17.4500, 78.4600], risk: "Medium", cases: 19, temp: 28, humidity: 70, rainfall: 130, advise: "Sanitation check on municipal lines." }
    ],
    "6 months": [
      { id: 4, name: "District Central - Cluster T1", coords: [17.3990, 78.4700], risk: "High", cases: 88, temp: 28, humidity: 78, rainfall: 250, advise: "Vaccinate cluster contacts, test food vendor ice/water source safety." },
      { id: 5, name: "District North - Cluster T2", coords: [17.4500, 78.4600], risk: "Medium", cases: 54, temp: 28, humidity: 72, rainfall: 210, advise: "Sanitation check on municipal lines." }
    ]
  },
  "Hepatitis A": {
    "7 days": [
      { id: 6, name: "District South-East - Cluster H", coords: [17.3500, 78.5500], risk: "High", cases: 31, temp: 29, humidity: 79, rainfall: 120, advise: "Implement hygiene awareness, isolate well outputs." }
    ],
    "30 days": [
      { id: 6, name: "District South-East - Cluster H", coords: [17.3500, 78.5500], risk: "High", cases: 62, temp: 28, humidity: 82, rainfall: 220, advise: "Implement hygiene awareness, isolate well outputs." }
    ],
    "6 months": [
      { id: 6, name: "District South-East - Cluster H", coords: [17.3500, 78.5500], risk: "High", cases: 148, temp: 27, humidity: 84, rainfall: 380, advise: "Implement hygiene awareness, isolate well outputs." }
    ]
  }
};

// Recenter viewport on dynamic center change
function RecenterMap({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.setView(coords, 12, { animate: true });
    }
  }, [coords, map]);
  return null;
}

export default function MapPage({ isAdminMode }) {
  const [disease, setDisease] = useState("Cholera");
  const [timeline, setTimeline] = useState("30 days");
  const [userLocation, setUserLocation] = useState(null);
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hasGeoPermission, setHasGeoPermission] = useState(false);
  const [useFallbackMap, setUseFallbackMap] = useState(false);

  // 1. Integration containment simulator states
  const [isMitigating, setIsMitigating] = useState(false);
  const [mitigationAllocations, setMitigationAllocations] = useState({}); // format: { [hotspotId]: { chlorine: X, water: Y, camps: Z, applied: boolean } }
  
  // Slider states for active editing
  const [tempChlorine, setTempChlorine] = useState(0);
  const [tempWater, setTempWater] = useState(0);
  const [tempCamps, setTempCamps] = useState(0);

  const defaultCenter = [17.3850, 78.4867];

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = [position.coords.latitude, position.coords.longitude];
          setUserLocation(coords);
          setHasGeoPermission(true);
        },
        (error) => {
          console.warn("Geolocation permission denied, defaulting map center.");
        }
      );
    }
  }, []);

  const activeHotspots = HOTSPOTS_DATA[disease][timeline] || [];

  const handleHotspotClick = (hotspot) => {
    setSelectedHotspot(hotspot);
    setIsSidebarOpen(true);
    setIsMitigating(false); // default back to info screen on change

    // Load saved allocations if they exist
    const saved = mitigationAllocations[hotspot.id];
    setTempChlorine(saved ? saved.chlorine : 0);
    setTempWater(saved ? saved.water : 0);
    setTempCamps(saved ? saved.camps : 0);
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case "High": return "#EF4444";
      case "Medium": return "#F59E0B";
      default: return "#10B981";
    }
  };

  // Run dynamic Recharts prediction specifically scaled to active cases count
  const getDynamicTimelineData = () => {
    if (!selectedHotspot) return [];
    const baseCases = selectedHotspot.cases;
    const chlorineImpact = tempChlorine * 1.6;
    const tankerImpact = tempWater * 8;
    const campImpact = tempCamps * 22;
    const totalImpact = Math.min(chlorineImpact + tankerImpact + campImpact, 88);

    return Array.from({ length: 10 }).map((_, index) => {
      const dayVal = `Day ${index + 1}`;
      const factor = (index + 1) / 10;
      const escalatedBaseline = Math.round(baseCases * Math.sin(factor * Math.PI / 2) * 1.6);
      
      if (index === 0) {
        return { day: dayVal, baselineCases: baseCases, mitigatedCases: baseCases };
      }
      const dailyEffectiveness = (totalImpact / 100) * Math.min(1, (index / 8));
      const mitigated = Math.max(5, Math.round(escalatedBaseline * (1 - dailyEffectiveness)));

      return {
        day: dayVal,
        baselineCases: escalatedBaseline,
        mitigatedCases: mitigated
      };
    });
  };

  const handleApplyMitigation = () => {
    if (!selectedHotspot) return;
    setMitigationAllocations(prev => ({
      ...prev,
      [selectedHotspot.id]: {
        chlorine: tempChlorine,
        water: tempWater,
        camps: tempCamps,
        applied: (tempChlorine > 0 || tempWater > 0 || tempCamps > 0)
      }
    }));
    setIsMitigating(false);
  };

  const currentMitigationScore = Math.min(tempChlorine * 1.6 + tempWater * 8 + tempCamps * 22, 88);

  return (
    <div className="relative min-h-[calc(100vh-64px)] bg-slate-900 text-slate-100 flex flex-col lg:flex-row overflow-hidden">
      
      {/* Sidebar Controls (Floating Over Map) */}
      <div className="absolute top-4 left-4 z-40 w-full max-w-[340px] px-2 pointer-events-none">
        <div className="bg-slate-900/90 dark:bg-slate-950/90 border border-slate-700/50 p-5 rounded-2xl shadow-2xl backdrop-blur-md pointer-events-auto space-y-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
              <Layers className="h-4.5 w-4.5 text-teal-400" />
              Biosentinel Control
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Toggle outbreak filters and projection limits.</p>
          </div>

          {/* Disease Toggle */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Target Disease</label>
            <div className="grid grid-cols-3 gap-1 bg-slate-800/80 p-0.5 rounded-xl border border-slate-700/30">
              {Object.keys(HOTSPOTS_DATA).map(dis => (
                <button
                  key={dis}
                  onClick={() => setDisease(dis)}
                  className={`py-1.5 text-[11px] font-semibold rounded-lg transition-colors ${
                    disease === dis
                      ? 'bg-teal-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  {dis}
                </button>
              ))}
            </div>
          </div>

          {/* Timeline Selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Temporal Horizon</label>
            <div className="grid grid-cols-3 gap-1 bg-slate-800/80 p-0.5 rounded-xl border border-slate-700/30">
              {["7 days", "30 days", "6 months"].map(t => (
                <button
                  key={t}
                  onClick={() => setTimeline(t)}
                  className={`py-1.5 text-[11px] font-semibold rounded-lg transition-colors capitalize ${
                    timeline === t
                      ? 'bg-teal-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Stats Summary */}
          <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Total Hotspots:</span>
            <span className="text-teal-400 font-mono text-sm">{activeHotspots.length} Zones</span>
          </div>

          {/* Fallback canvas toggle */}
          <div className="flex items-center justify-between text-[10px] text-slate-500">
            <span>Rendering issues?</span>
            <button 
              onClick={() => setUseFallbackMap(!useFallbackMap)} 
              className="text-teal-400 hover:underline cursor-pointer"
            >
              {useFallbackMap ? "Use Interactive Leaflet" : "Use Mock SVG Canvas"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Map Viewer Area */}
      <div className="flex-1 h-[calc(100vh-64px)] w-full relative z-10 bg-slate-950">
        {useFallbackMap ? (
          /* Mock SVG Map Canvas */
          <div className="w-full h-full flex flex-col justify-center items-center relative overflow-hidden bg-[#0A1128]">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
            
            <div className="text-center relative space-y-4">
              <span className="text-teal-400 text-xs font-bold uppercase tracking-wider block">Bio-GIS Projection Fallback</span>
              <h3 className="text-xl font-extrabold text-white">Visualizing Hotspots Grid</h3>
              
              <div className="w-80 h-80 rounded-full border border-teal-500/20 flex items-center justify-center relative bg-teal-500/5">
                <div className="w-60 h-60 rounded-full border border-teal-500/10 flex items-center justify-center">
                  <div className="w-40 h-40 rounded-full border border-teal-500/5 animate-pulse flex items-center justify-center">
                    <MapPin className="h-10 w-10 text-teal-400 animate-bounce" />
                  </div>
                </div>

                {/* Hotspot Pulsars */}
                {activeHotspots.map((hs, idx) => {
                  const allocation = mitigationAllocations[hs.id];
                  const circleColor = allocation?.applied ? "#14B8A6" : getRiskColor(hs.risk);
                  
                  return (
                    <motion.div
                      key={hs.id}
                      onClick={() => handleHotspotClick(hs)}
                      className="absolute cursor-pointer p-2.5 rounded-full hover:scale-125 transition-transform"
                      style={{
                        backgroundColor: `${circleColor}22`,
                        border: `1.5px solid ${circleColor}`,
                        top: `${25 + idx * 25}%`,
                        left: `${20 + idx * 30}%`,
                      }}
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: idx * 0.3 }}
                    >
                      <span className="text-[10px] font-bold text-white whitespace-nowrap bg-slate-900/90 px-1.5 py-0.5 rounded border border-slate-700/50 block">
                        {allocation?.applied ? 'Contained' : `${hs.cases} Cases`}
                      </span>
                    </motion.div>
                  );
                })}

                {userLocation && (
                  <div className="absolute top-[40%] left-[50%] geolocation-pulse">
                    <div className="h-3.5 w-3.5 bg-teal-500 rounded-full border-2 border-white shadow-md"></div>
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">This interactive vector map simulates local outbreak clusters. Click any zone to toggle simulation.</p>
            </div>
          </div>
        ) : (
          /* Actual leaflet render */
          <MapContainer 
            center={userLocation || defaultCenter} 
            zoom={12} 
            className="w-full h-full"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            
            <RecenterMap coords={userLocation} />

            {/* User Geolocation Ring */}
            {userLocation && (
              <Marker 
                position={userLocation}
                icon={L.divIcon({
                  html: '<div class="geolocation-pulse"><div class="h-4 w-4 bg-teal-500 rounded-full border-2 border-white shadow-lg"></div></div>',
                  className: 'dummy-pulse-icon',
                  iconSize: [16, 16],
                  iconAnchor: [8, 8]
                })}
              >
                <Popup>
                  <div className="text-xs font-semibold text-slate-200">
                    <span className="text-teal-400 font-bold block mb-1">Your Fetched Region</span>
                    Safe Water Index: 92% (Optimal)
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Disease Hotspots Map Nodes */}
            {activeHotspots.map((hs) => {
              const baseCenter = [17.3850, 78.4867];
              const displayCoords = userLocation
                ? [
                    userLocation[0] + (hs.coords[0] - baseCenter[0]),
                    userLocation[1] + (hs.coords[1] - baseCenter[1])
                  ]
                : hs.coords;

              // Check if dynamic resource allocation has been applied to this hotspot
              const allocation = mitigationAllocations[hs.id];
              const isMitigated = allocation?.applied;
              const circleColor = isMitigated ? "#14B8A6" : getRiskColor(hs.risk);
              const baseRadius = hs.risk === "High" ? 1800 : 1000;
              const displayRadius = isMitigated ? Math.max(500, baseRadius / 3.5) : baseRadius;

              // Custom pulsing dynamic marker pin (ripple glowing effects)
              const markerHtml = `
                <div class="${hs.risk === 'High' && !isMitigated ? 'map-alert-glow' : ''}" style="width: 14px; height: 14px; border-radius: 50%;">
                  <div style="background-color: ${circleColor}; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 6px rgba(0,0,0,0.5);"></div>
                </div>
              `;
              const customMarkerIcon = L.divIcon({
                html: markerHtml,
                className: 'custom-map-marker-ping',
                iconSize: [14, 14],
                iconAnchor: [7, 7]
              });

              return (
                <React.Fragment key={hs.id}>
                  {/* Visual circle radius displaying risk coverage */}
                  <Circle
                    center={displayCoords}
                    radius={displayRadius}
                    pathOptions={{
                      color: circleColor,
                      fillColor: circleColor,
                      fillOpacity: 0.25,
                      weight: 1.5,
                    }}
                    eventHandlers={{
                      click: () => handleHotspotClick(hs)
                    }}
                  />

                  {/* Leaflet pinpoint overlay marker */}
                  <Marker 
                    position={displayCoords}
                    icon={customMarkerIcon}
                    eventHandlers={{
                      click: () => handleHotspotClick(hs)
                    }}
                  />
                </React.Fragment>
              );
            })}
          </MapContainer>
        )}
      </div>

      {/* Floating Action Hint */}
      <div className="absolute bottom-6 left-6 z-20 hidden md:block">
        <div className="bg-slate-900/85 px-4 py-2 border border-slate-700/40 rounded-full shadow-lg text-xs font-medium text-slate-350 flex items-center gap-2 select-none">
          <Info className="h-4 w-4 text-teal-400" />
          <span>Click on any red/amber infection zone marker to open the containment dashboard.</span>
        </div>
      </div>

      {/* Slide-out Panel (Modal) - Smooth expanding width for simulator */}
      <AnimatePresence>
        {isSidebarOpen && selectedHotspot && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`absolute lg:relative top-0 right-0 z-50 w-full h-[calc(100vh-64px)] bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col transition-all duration-300 ${
              isMitigating ? 'lg:w-[850px]' : 'lg:w-[420px]'
            }`}
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                  mitigationAllocations[selectedHotspot.id]?.applied
                    ? "bg-teal-500/10 text-teal-450 border border-teal-500/20"
                    : selectedHotspot.risk === "High" 
                      ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" 
                      : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                }`}>
                  {mitigationAllocations[selectedHotspot.id]?.applied ? "Mitigated & Contained" : `${selectedHotspot.risk} Risk Sector`}
                </span>
                <h3 className="text-lg font-bold text-white mt-1">{selectedHotspot.name}</h3>
              </div>
              <button 
                onClick={() => { setIsSidebarOpen(false); setIsMitigating(false); }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Conditional views */}
            {!isMitigating ? (
              /* View A: Info / Telemetry view */
              <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-fade-in">
                {/* Main Risk Box */}
                <div className="p-4 bg-slate-950/40 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Pathogen vector:</span>
                    <span className="font-bold text-teal-400 font-mono">{disease}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Identified cases:</span>
                    <span className="font-bold text-white font-mono text-sm">{selectedHotspot.cases} Active Cases</span>
                  </div>
                  {mitigationAllocations[selectedHotspot.id]?.applied && (
                    <div className="pt-2 border-t border-slate-800 text-[10px] text-teal-400 font-semibold">
                      Containment active: {mitigationAllocations[selectedHotspot.id].water} Tankers & {mitigationAllocations[selectedHotspot.id].chlorine} Chlorine Kits deployed.
                    </div>
                  )}
                </div>

                {/* Environmental sensors metrics */}
                <div className="space-y-4">
                  <h4 className="text-xs uppercase font-bold text-slate-500 tracking-wider">Hydrological Sensors</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl text-center">
                      <CloudRain className="h-5 w-5 text-sky-400 mx-auto mb-1.5" />
                      <span className="block text-[10px] text-slate-500 font-semibold">Rainfall</span>
                      <span className="font-bold text-sm text-slate-200 font-mono">{selectedHotspot.rainfall}mm</span>
                    </div>
                    <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl text-center">
                      <Sun className="h-5 w-5 text-amber-500 mx-auto mb-1.5" />
                      <span className="block text-[10px] text-slate-500 font-semibold">Temperature</span>
                      <span className="font-bold text-sm text-slate-200 font-mono">{selectedHotspot.temp}°C</span>
                    </div>
                    <div className="p-3 bg-slate-950/40 border border-slate-850 rounded-xl text-center">
                      <Droplets className="h-5 w-5 text-teal-400 mx-auto mb-1.5" />
                      <span className="block text-[10px] text-slate-500 font-semibold">Humidity</span>
                      <span className="font-bold text-sm text-slate-200 font-mono">{selectedHotspot.humidity}%</span>
                    </div>
                  </div>
                </div>

                {/* Recommended Proactive Interventions */}
                <div className="space-y-3">
                  <h4 className="text-xs uppercase font-bold text-slate-500 tracking-wider">Intervention Orders</h4>
                  <div className="p-4 bg-slate-950/30 border border-slate-850 rounded-xl flex items-start gap-3">
                    <ShieldCheck className="h-5 w-5 text-teal-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-slate-300 leading-relaxed">
                      <span className="font-bold text-teal-400 block mb-1">Recommended Response:</span>
                      {selectedHotspot.advise}
                    </div>
                  </div>
                </div>

                {/* Status checklist */}
                <div className="space-y-3">
                  <h4 className="text-xs uppercase font-bold text-slate-500 tracking-wider">Sanitary Containment Check</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Check className="h-4 w-4 text-emerald-500" />
                      <span>Government response dispatch initiated.</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Check className="h-4 w-4 text-emerald-500" />
                      <span>Free chlorine distribute program active.</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <div className="h-4 w-4 rounded-full border border-slate-700 flex items-center justify-center text-[8px] font-bold">...</div>
                      <span>Microbial reservoir lab testing pending (48h).</span>
                    </div>
                  </div>
                </div>

                {/* Action button */}
                {isAdminMode ? (
                  <button 
                    onClick={() => setIsMitigating(true)}
                    className="w-full py-3.5 mt-4 bg-gradient-to-r from-teal-650 to-teal-555 hover:from-teal-555 hover:to-teal-450 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-teal-600/10 cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4 text-teal-350" />
                    Deploy Mitigations (Containment Simulator)
                  </button>
                ) : (
                  <div className="p-3.5 bg-teal-500/5 dark:bg-teal-500/10 border border-teal-500/20 rounded-xl text-[11px] text-slate-350 mt-4 leading-normal flex items-start gap-2 animate-fade-in">
                    <Info className="h-4 w-4 text-teal-500 shrink-0 mt-0.5" />
                    <span>Mitigation simulations are locked. Toggle <strong>Admin Mode</strong> in the top-right navbar to deploy containment resources.</span>
                  </div>
                )}
              </div>
            ) : (
              /* View B: Expanding Containment Simulator Dashboard overlay */
              <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-between gap-6 animate-fade-in">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  
                  {/* Left Column: Interventions allocation sliders */}
                  <div className="space-y-5 p-4 bg-slate-950/40 border border-slate-800 rounded-xl">
                    <h4 className="text-xs uppercase font-bold text-teal-400 tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="h-4.5 w-4.5" />
                      Allocate Resources
                    </h4>

                    {/* Chlorine Kits */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-300">Chlorine Distribution Kits</span>
                        <span className="text-teal-400 font-mono font-bold">{tempChlorine} Units</span>
                      </div>
                      <input 
                        type="range" min="0" max="50" value={tempChlorine} 
                        onChange={(e) => setTempChlorine(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
                      />
                    </div>

                    {/* Water Tankers */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-300">Clean Water Tankers</span>
                        <span className="text-teal-400 font-mono font-bold">{tempWater} Trucks</span>
                      </div>
                      <input 
                        type="range" min="0" max="10" value={tempWater} 
                        onChange={(e) => setTempWater(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
                      />
                    </div>

                    {/* Medical camps */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-300">Mobile Medical Camps</span>
                        <span className="text-teal-400 font-mono font-bold">{tempCamps} Hubs</span>
                      </div>
                      <input 
                        type="range" min="0" max="4" value={tempCamps} 
                        onChange={(e) => setTempCamps(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-400"
                      />
                    </div>

                    {/* Impact Gauge */}
                    <div className="p-3 bg-teal-950/40 border border-teal-900/60 rounded-xl text-center">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Outbreak Suppression</span>
                      <span className="text-2xl font-extrabold text-teal-400 font-mono mt-0.5">-{Math.round(currentMitigationScore)}%</span>
                    </div>
                  </div>

                  {/* Right Column: Recharts line curve projection */}
                  <div className="space-y-4">
                    <h4 className="text-xs uppercase font-bold text-slate-500 tracking-wider">Projection Containment Curves</h4>
                    
                    <div className="h-52 w-full bg-slate-950/20 border border-slate-800 rounded-xl p-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={getDynamicTimelineData()} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.2} />
                          <XAxis dataKey="day" stroke="#64748B" fontSize={9} />
                          <YAxis stroke="#64748B" fontSize={9} />
                          <RechartsTooltip contentStyle={{ backgroundColor: '#090F23', borderColor: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: '10px' }} />
                          <Line name="Baseline" type="monotone" dataKey="baselineCases" stroke="#EF4444" strokeWidth={1.5} dot={false} strokeDasharray="3 3" />
                          <Line name="Mitigated" type="monotone" dataKey="mitigatedCases" stroke="#2DD4BF" strokeWidth={2.5} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <span className="text-[10px] text-slate-500 block leading-tight text-center italic">
                      *Adjust left sliders to flatten the green projection line.
                    </span>
                  </div>

                </div>

                {/* Bottom Controls */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-850">
                  <button 
                    type="button"
                    onClick={() => setIsMitigating(false)}
                    className="flex-1 py-3 border border-slate-800 hover:bg-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer text-center text-slate-300"
                  >
                    Back to Details
                  </button>
                  <button 
                    type="button"
                    onClick={handleApplyMitigation}
                    className="flex-1 py-3 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all cursor-pointer text-center"
                  >
                    Deploy & Apply Containment
                  </button>
                </div>

              </div>
            )}

            {/* Bottom Actions info display */}
            {!isMitigating && (
              <div className="p-6 border-t border-slate-800 bg-slate-950/20">
                <button 
                  onClick={() => alert(`Warning broadcast message sent to ${selectedHotspot.name} telemetry nodes.`)}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-750 text-slate-200 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700/50 cursor-pointer"
                >
                  <AlertTriangle className="h-4 w-4 text-rose-500" />
                  Broadcast Cluster Warning Alert
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
