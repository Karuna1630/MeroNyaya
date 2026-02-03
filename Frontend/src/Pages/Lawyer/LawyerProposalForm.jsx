import React, { useState } from "react";
import { X, Send, User } from "lucide-react";

const LawyerProposalForm = ({ isOpen, onClose, caseData, onSubmit }) => {
  const [proposal, setProposal] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !caseData) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getUrgencyBadge = (urgency) => {
    const badges = {
      High: { bg: "bg-red-500 text-white", text: "text-white", label: "Urgent" },
      Medium: { bg: "bg-amber-100", text: "text-amber-700", label: "Medium" },
      Low: { bg: "bg-blue-100", text: "text-blue-700", label: "Low" },
    };
    return badges[urgency] || badges.Medium;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!proposal.trim()) return;

    try {
      setIsSubmitting(true);
      await onSubmit({
        caseId: caseData.id,
        proposalText: proposal,
      });
      setProposal("");
      onClose();
    } catch (error) {
      console.error("Error submitting proposal:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const urgencyBadge = getUrgencyBadge(caseData.urgency_level);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all">
        {/* Header with Client Info */}
        <div className="p-8 pb-4 sticky top-0 bg-white z-10 border-b border-gray-50">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Case Details</h2>
              <p className="text-gray-500 text-sm mt-1">Review the case and submit your proposal</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Client Info - Clean and Minimal */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center shrink-0 overflow-hidden">
              {caseData.client_profile_image ? (
                <img src={caseData.client_profile_image} className="w-full h-full object-cover" alt="client" />
              ) : (
                <User size={24} className="text-gray-500" />
              )}
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">{caseData.client_name || "Client"}</p>
              <p className="text-xs text-gray-500 mt-0.5">Case by client</p>
            </div>
          </div>
        </div>

        <div className="p-8 pt-6 space-y-6">
          {/* Case Title & Summary */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {caseData.case_title}
              </h3>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${urgencyBadge.bg}`}>
                {urgencyBadge.label}
              </span>
            </div>
            
            <p className="text-xs text-gray-500">ID: {caseData.case_number || `PUB-${caseData.id}`}</p>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-6">
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Category</p>
              <p className="text-sm text-gray-900">
                {caseData.case_category || 'General'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Posted Date</p>
              <p className="text-sm text-gray-900">
                {formatDate(caseData.created_at)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Documents</p>
              <p className="text-sm text-gray-900">
                {caseData.document_count || caseData.documents?.length || 0} files
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Proposals</p>
              <p className="text-sm text-gray-900">
                {caseData.proposal_count || 0} proposals
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <p className="text-xs text-gray-500 uppercase">Description</p>
            <p className="text-sm text-gray-700 leading-relaxed">
              {caseData.case_description}
            </p>
          </div>

          {/* Proposal Input */}
          <div className="space-y-2 border-t border-gray-200 pt-6">
            <label className="text-sm font-medium text-gray-900">Your Proposal</label>
            <textarea
              value={proposal}
              onChange={(e) => setProposal(e.target.value)}
              placeholder="Introduce yourself, explain your relevant experience, and how you can help with this case..."
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-sm min-h-[120px] resize-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!proposal.trim() || isSubmitting}
              className="px-6 py-2 bg-[#0F1A3D] text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Send size={16} />
              {isSubmitting ? "Submitting..." : "Submit Proposal"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LawyerProposalForm;
