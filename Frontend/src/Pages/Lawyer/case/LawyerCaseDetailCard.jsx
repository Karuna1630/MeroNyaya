import React from "react";
import { Save, X } from "lucide-react";

const LawyerCaseDetailCard = ({
  caseData,
  statusBadge,
  formatDate,
  formatTime,
  isEditing,
  editFormData,
  onEditChange,
  onSave,
  onCancel,
  isSaving,
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Case Details</h3>
      </div>
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
          <p className="text-sm text-gray-600 leading-relaxed">{caseData.case_description}</p>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Case Type</h4>
            <p className="text-sm text-gray-900 font-medium">{caseData.case_category}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Status</h4>
            {isEditing ? (
              <select
                name="status"
                value={editFormData.status}
                onChange={onEditChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="accepted">Accepted</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
            ) : (
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                {statusBadge.label}
              </span>
            )}
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Filing Date</h4>
            <p className="text-sm text-gray-900 font-medium">{formatDate(caseData.created_at)}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Hearing Time</h4>
            <p className="text-sm text-gray-900 font-medium">{formatTime(caseData.next_hearing_date)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
          <h4 className="font-semibold text-gray-900 mb-4">Court Information</h4>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Case Number</h5>
              {isEditing ? (
                <input
                  type="text"
                  name="case_number"
                  value={editFormData.case_number}
                  onChange={onEditChange}
                  placeholder="e.g., CASE-2024-001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              ) : (
                <p className="text-sm text-gray-900 font-medium">{caseData.case_number || "Not set"}</p>
              )}
            </div>

            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Court Name</h5>
              {isEditing ? (
                <input
                  type="text"
                  name="court_name"
                  value={editFormData.court_name}
                  onChange={onEditChange}
                  placeholder="e.g., District Court, Kathmandu"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              ) : (
                <p className="text-sm text-gray-900 font-medium">{caseData.court_name || "Not assigned"}</p>
              )}
            </div>

            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Opposing Party</h5>
              {isEditing ? (
                <input
                  type="text"
                  name="opposing_party"
                  value={editFormData.opposing_party}
                  onChange={onEditChange}
                  placeholder="e.g., Ram Bahadur Thapa"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              ) : (
                <p className="text-sm text-gray-900 font-medium">{caseData.opposing_party || "Not specified"}</p>
              )}
            </div>

            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">Next Hearing Date</h5>
              {isEditing ? (
                <input
                  type="date"
                  name="next_hearing_date"
                  value={editFormData.next_hearing_date}
                  onChange={onEditChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              ) : (
                <p className="text-sm text-gray-900 font-medium">{formatDate(caseData.next_hearing_date)}</p>
              )}
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="flex gap-2 pt-4">
            <button
              onClick={onSave}
              disabled={isSaving}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition flex items-center justify-center gap-2 font-medium"
            >
              <Save size={16} />
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={onCancel}
              disabled={isSaving}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 transition flex items-center justify-center gap-2 font-medium"
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LawyerCaseDetailCard;
