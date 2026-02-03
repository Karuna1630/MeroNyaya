import React from "react";
import { CheckCircle2 } from "lucide-react";

const ClientCaseTimelineCard = ({ timeline = [] }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
      <div className="space-y-6">
        {timeline.length > 0 ? (
          timeline.map((event) => (
            <div key={event.id} className="flex gap-4">
              {/* Timeline Icon */}
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <CheckCircle2 size={18} className="text-emerald-500" />
                </div>
              </div>
              
              {/* Content */}
              <div className="flex-1 pb-6 border-b border-slate-100 last:border-b-0">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <h3 className="font-semibold text-slate-900">{event.title}</h3>
                  <span className="text-xs text-slate-400 whitespace-nowrap">{formatDate(event.created_at)}</span>
                </div>
                <p className="text-sm text-slate-600 mb-2">{event.description}</p>
                {event.created_by_name && (
                  <p className="text-xs text-slate-400">By: {event.created_by_name}</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-slate-500">No timeline events yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientCaseTimelineCard;
