import React from "react";
import { CheckCircle2 } from "lucide-react";

const ClientCaseTimelineCard = ({ milestones }) => {
  return (
    <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm relative">
      <div className="absolute left-[47px] top-12 bottom-12 w-[1px] bg-slate-100" />
      
      <div className="space-y-10">
        {milestones.map((milestone, i) => (
          <div key={i} className="relative flex gap-6">
            <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-sm transition-transform hover:scale-110 ${
              milestone.status === 'completed' ? 'bg-emerald-500' : 'bg-slate-200'
            }`}>
              <CheckCircle2 size={16} className="text-white" />
            </div>
            <div className="flex-1 p-5 rounded-xl border border-slate-50 bg-slate-50/30 hover:bg-slate-50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-slate-900">{milestone.title}</h3>
                <span className="text-xs font-semibold text-slate-400">{milestone.date}</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                {milestone.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientCaseTimelineCard;
