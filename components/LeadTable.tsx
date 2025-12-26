
import React from 'react';
import { Lead } from '../types';

interface Props {
  leads: Lead[];
}

const LeadTable: React.FC<Props> = ({ leads }) => {
  if (leads.length === 0) return null;

  return (
    <div className="bg-slate-800/30 rounded-xl border border-slate-700 overflow-hidden backdrop-blur-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/80 text-slate-300 text-xs font-bold uppercase tracking-wider">
              <th className="px-6 py-4">Business / Property</th>
              <th className="px-6 py-4">Address</th>
              <th className="px-6 py-4">Roof Type</th>
              <th className="px-6 py-4">Size (Est)</th>
              <th className="px-6 py-4">Condition</th>
              <th className="px-6 py-4">Age</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-slate-700/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-semibold text-white">{lead.businessName}</div>
                  <div className="text-xs text-slate-400">{lead.businessType}</div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-300">
                  {lead.address}
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-xs border border-blue-500/20">
                    {lead.roofType}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-300 font-mono">
                  {lead.estimatedSqFt}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    lead.roofCondition === 'Excellent' || lead.roofCondition === 'Good' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : lead.roofCondition === 'Fair'
                      ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                    {lead.roofCondition}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-300">
                  {lead.estimatedAge}
                </td>
                <td className="px-6 py-4 text-right">
                  <a 
                    href={lead.googleMapsUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-white text-xs underline decoration-slate-600 underline-offset-4"
                  >
                    View Map
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeadTable;
