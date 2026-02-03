import React from "react";
import { Scale, Calendar, Gavel } from "lucide-react";

const ClientCaseDetailCard = ({ caseData }) => {
  return (
    <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900 mb-6">Case Information</h3>
      
      <div className="space-y-6">
        {/* Case Number */}
        <div className="grid grid-cols-3 gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Scale size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Case Number</p>
              <p className="text-sm font-semibold text-slate-900">{caseData?.case_number || 'Not assigned yet'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <Calendar size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Filing Date</p>
              <p className="text-sm font-semibold text-slate-900">{caseData?.created_at ? new Date(caseData.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Gavel size={18} className="text-purple-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Court Name</p>
              <p className="text-sm font-semibold text-slate-900">{caseData?.court_name || 'Not assigned yet'}</p>
            </div>
          </div>
        </div>

        {/* Opposing Party */}
        <div className="pb-6 border-b border-slate-100">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Opposing Party</p>
          <p className="text-sm font-semibold text-slate-900">{caseData?.opposing_party || 'Not specified'}</p>
        </div>

        {/* Case Description */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Case Description</p>
          <p className="text-sm text-slate-600 leading-relaxed">{caseData?.case_description || 'No description available'}</p>
        </div>
      </div>
    </div>
  );
};

export default ClientCaseDetailCard;
