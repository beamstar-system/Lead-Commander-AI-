
import React from 'react';
import { Lead } from '../types';

interface Props {
  leads: Lead[];
}

const DashboardStats: React.FC<Props> = ({ leads }) => {
  const totalLeads = leads.length;
  const avgSqFt = leads.length > 0 
    ? Math.round(leads.reduce((acc, curr) => acc + parseInt(curr.estimatedSqFt.replace(/[^0-9]/g, '') || '0'), 0) / leads.length)
    : 0;
  
  const conditionBreakdown = leads.reduce((acc, lead) => {
    acc[lead.roofCondition] = (acc[lead.roofCondition] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 backdrop-blur-sm">
        <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Total Scanned Leads</h3>
        <p className="text-3xl font-bold text-blue-400">{totalLeads}</p>
      </div>
      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 backdrop-blur-sm">
        <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Avg. Roof Size</h3>
        <p className="text-3xl font-bold text-emerald-400">{avgSqFt.toLocaleString()} sqft</p>
      </div>
      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 backdrop-blur-sm">
        <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">High Priority (Poor/Fair)</h3>
        <p className="text-3xl font-bold text-orange-400">
          {(conditionBreakdown['Poor'] || 0) + (conditionBreakdown['Fair'] || 0)}
        </p>
      </div>
      <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 backdrop-blur-sm">
        <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Pittsburgh Region</h3>
        <p className="text-3xl font-bold text-white">PA-01</p>
      </div>
    </div>
  );
};

export default DashboardStats;
