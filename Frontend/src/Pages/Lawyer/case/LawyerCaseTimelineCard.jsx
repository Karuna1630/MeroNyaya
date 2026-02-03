import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, CheckCircle2 } from "lucide-react";
import { addTimelineEvent } from "../../slices/caseSlice";

const LawyerCaseTimelineCard = ({ caseId, timeline = [], onTimelineUpdate }) => {
  const dispatch = useDispatch();
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const { addTimelineEventLoading } = useSelector((state) => state.case);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const handleAddNote = async () => {
    if (!topic.trim() || !description.trim()) return;

    try {
      await dispatch(addTimelineEvent({
        caseId,
        eventData: {
          event_type: 'note_added',
          title: topic,
          description: description,
        }
      })).unwrap();

      setTopic("");
      setDescription("");
      
      // Call parent callback to refresh timeline if needed
      if (onTimelineUpdate) {
        onTimelineUpdate();
      }
    } catch (error) {
      console.error("Error adding note:", error);
      alert("Failed to add note. Please try again.");
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Case Timeline</h3>

      {/* Add Note Section */}
      <div className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-100">
        <h4 className="font-semibold text-gray-900 mb-4">Add Timeline Event</h4>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Topic</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Document Review Completed"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={addTimelineEventLoading}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details about this event..."
              className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              disabled={addTimelineEventLoading}
            />
          </div>
          <button
            onClick={handleAddNote}
            disabled={!topic.trim() || !description.trim() || addTimelineEventLoading}
            className="w-full px-4 py-2 bg-[#0F1A3D] text-white rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition"
          >
            <Plus size={16} />
            {addTimelineEventLoading ? 'Adding...' : 'Add Event'}
          </button>
        </div>
      </div>

      {/* Timeline List */}
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
                    <h4 className="font-semibold text-slate-900">{event.title}</h4>
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
              <p className="text-gray-500">No timeline events yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LawyerCaseTimelineCard;
