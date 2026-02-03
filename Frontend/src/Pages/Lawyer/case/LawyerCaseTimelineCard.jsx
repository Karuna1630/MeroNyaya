import React from "react";
import { Plus } from "lucide-react";

const LawyerCaseTimelineCard = ({ newNote, onNoteChange, timeline }) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Case Timeline</h3>

      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <textarea
          value={newNote}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="Add a note or update..."
          className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
        <button className="mt-2 px-4 py-2 bg-[#0F1A3D] text-white rounded-lg text-sm font-medium hover:bg-slate-800 flex items-center gap-2">
          <Plus size={16} />
          Add Note
        </button>
      </div>

      <div className="space-y-4">
        {timeline.map((item) => (
          <div key={item.id} className="flex gap-4">
            <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center shrink-0`}>
              <item.icon size={20} className={item.color} />
            </div>
            <div className="flex-1 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-semibold text-gray-900">{item.title}</h4>
                <span className="text-xs text-gray-500">{item.date}</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{item.description}</p>
              <span className="text-xs text-gray-500">By: {item.by}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LawyerCaseTimelineCard;
