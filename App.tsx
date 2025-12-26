
import React, { useState } from 'react';
import { Lead, ScanProgress } from './types';
import { fetchCommercialLeads, analyzeRoofData } from './services/geminiService';
import { exportLeadsToCSV } from './utils/csv';
import LeadTable from './components/LeadTable';
import DashboardStats from './components/DashboardStats';

const App: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [progress, setProgress] = useState<ScanProgress>({
    total: 0,
    current: 0,
    status: 'idle',
    message: 'System ready. Awaiting command.'
  });

  const runScan = async () => {
    setProgress({ 
      total: 500, 
      current: 0, 
      status: 'searching', 
      message: 'Initializing Deep-Scan Protocols for Pittsburgh...' 
    });

    try {
      // Step 1: Initial Discovery
      const initialLeads = await fetchCommercialLeads(
        "Pittsburgh", 
        "PA", 
        (msg) => setProgress(p => ({ ...p, message: msg }))
      );

      if (initialLeads.length === 0) {
        setProgress({ status: 'idle', total: 0, current: 0, message: 'No leads found in initial sweep. Try again.' });
        return;
      }

      setLeads(initialLeads);
      setProgress(p => ({ 
        ...p, 
        total: initialLeads.length, 
        current: 0, 
        status: 'analyzing', 
        message: 'Lead Discovery successful. Beginning detailed roof analysis...' 
      }));

      // Step 2: Sequential Deep Analysis with stagger to prevent 429 bursts
      for (let i = 0; i < initialLeads.length; i++) {
        const lead = initialLeads[i];
        
        setProgress(p => ({ 
          ...p, 
          message: `Analyzing satellite signatures for ${lead.businessName}...` 
        }));

        try {
          const enrichment = await analyzeRoofData(lead, (retryMsg) => {
            setProgress(p => ({ ...p, message: retryMsg }));
          });

          setLeads(prev => prev.map((l, idx) => idx === i ? { ...l, ...enrichment } : l));
          setProgress(p => ({ ...p, current: i + 1 }));
          
          // Small mandatory gap between requests even if successful to stay under rate limits
          await new Promise(resolve => setTimeout(resolve, 800));
        } catch (err) {
          console.error(`Failed to analyze lead ${i}:`, err);
          // Continue to next lead rather than crashing
        }
      }

      setProgress(p => ({ 
        ...p, 
        status: 'completed', 
        message: `Scan finished. ${initialLeads.length} commercial leads secured.` 
      }));
    } catch (error: any) {
      console.error(error);
      setProgress(p => ({ 
        ...p, 
        status: 'error', 
        message: error?.message?.includes('429') 
          ? 'Quota exhausted. Please wait a moment and try again.' 
          : 'System failure during scan. Check credentials.'
      }));
    }
  };

  const handleExport = () => {
    exportLeadsToCSV(leads);
  };

  return (
    <div className="min-h-screen pb-20 selection:bg-blue-500/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-600/20">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-white uppercase">Lead Commander <span className="text-orange-500">AI</span></h1>
              <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase">Proprietary RoofMaxx Intelligence Unit</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={runScan}
              disabled={progress.status === 'searching' || progress.status === 'analyzing'}
              className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all shadow-xl flex items-center gap-2 border border-transparent ${
                progress.status === 'searching' || progress.status === 'analyzing'
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border-slate-700'
                : 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-900/40 active:scale-95'
              }`}
            >
              {progress.status === 'searching' || progress.status === 'analyzing' ? 'Processing Payload' : 'Engage 500-Lead Scan'}
              {(progress.status === 'searching' || progress.status === 'analyzing') && (
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
            </button>
            
            <button 
              onClick={handleExport}
              disabled={leads.length === 0}
              className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all flex items-center gap-2 border ${
                leads.length === 0
                ? 'border-slate-800 text-slate-600 cursor-not-allowed'
                : 'border-slate-700 hover:bg-slate-800 text-white active:scale-95'
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Intelligence (.csv)
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Progress Bar with Enhanced Status */}
        {(progress.status !== 'idle' && progress.status !== 'completed') && (
          <div className="mb-10 p-8 bg-slate-900/60 rounded-2xl border border-slate-700 backdrop-blur-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-600 via-blue-600 to-emerald-600"></div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-2 h-2 rounded-full animate-ping ${progress.status === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Active Neural Link</span>
                </div>
                <p className="text-xl font-semibold text-white leading-tight min-h-[3rem]">{progress.message}</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-black text-white font-mono leading-none">
                  {progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0}<span className="text-blue-500 text-lg">%</span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono uppercase mt-1">
                  {progress.current} / {progress.total} Assets Indexed
                </p>
              </div>
            </div>
            <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-[2px]">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(37,99,235,0.4)] ${
                  progress.status === 'error' ? 'bg-red-600' : 'bg-gradient-to-r from-blue-600 to-indigo-500'
                }`} 
                style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        )}

        {leads.length > 0 ? (
          <div className="space-y-8 animate-in fade-in duration-700">
            <DashboardStats leads={leads} />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                  Pittsburgh Operations Map
                  <span className="text-xs font-bold bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">
                    Live Data
                  </span>
                </h2>
                <p className="text-sm text-slate-400 mt-1 italic">Displaying active commercial targets for RoofMaxx deployment.</p>
              </div>
            </div>
            <LeadTable leads={leads} />
          </div>
        ) : progress.status === 'idle' && (
          <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-slate-800 rounded-[2.5rem] bg-slate-900/20">
            <div className="relative mb-8">
              <div className="absolute -inset-4 bg-orange-500/10 rounded-full blur-2xl animate-pulse"></div>
              <div className="w-20 h-20 bg-slate-800/50 rounded-3xl flex items-center justify-center border border-slate-700 relative">
                <svg className="w-10 h-10 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Commander Interface Offline</h3>
            <p className="text-slate-500 max-w-md text-center leading-relaxed">
              Initiate a high-resolution scan to deploy AI agents across the Pittsburgh industrial corridors. 
              Targets will be filtered for 100% commercial exclusivity.
            </p>
          </div>
        )}
      </main>

      {/* Enterprise Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/50 px-6 py-4 z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[9px] text-slate-600 font-mono tracking-widest uppercase">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              <span>API Status: Nominal</span>
            </div>
            <span className="text-slate-800">|</span>
            <span>Region: PA-PIT-0412</span>
            <span className="text-slate-800">|</span>
            <span>Intelligence: Gemini-3-Pro (Bridge)</span>
          </div>
          <div className="flex items-center gap-6">
            <span className="text-blue-500/80">Rate-Limit Protection: Enabled</span>
            <span className="text-slate-800">|</span>
            <span className="text-slate-500">© 2024 RoofMaxx Lead Commander Enterprise</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
