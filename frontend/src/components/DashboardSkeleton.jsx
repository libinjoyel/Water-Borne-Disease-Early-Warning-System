import React from 'react';

export default function DashboardSkeleton() {
  return (
    <div className="w-full space-y-6 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl animate-pulse">
      {/* Grid of KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-slate-100 dark:bg-slate-850/60 border border-slate-200/50 dark:border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between">
            <div className="h-3 w-1/3 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-6 w-1/2 bg-slate-300 dark:bg-slate-650 rounded" />
          </div>
        ))}
      </div>
      
      {/* Big Chart Skeleton Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[1, 2].map((cardIdx) => (
          <div key={cardIdx} className="p-6 bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-2xl space-y-4">
            <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-750 rounded" />
            <div className="h-3 w-1/2 bg-slate-200/60 dark:bg-slate-800 rounded" />
            <div className="h-64 bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 rounded-xl p-4 flex items-end gap-3 justify-around pt-8">
              {[40, 80, 55, 90, 35, 70, 60].map((height, idx) => (
                <div 
                  key={idx} 
                  className="w-8 bg-slate-200 dark:bg-slate-800/80 rounded-t transition-all duration-500" 
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
