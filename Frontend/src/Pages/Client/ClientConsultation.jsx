import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "./sidebar";
import DashHeader from "./ClientDashHeader";
import StatCard from "./statcard";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyConsultations } from "../slices/consultationSlice";
import { 
  Calendar, 
  Video, 
  Phone,
  MessageCircle,
  MapPin, 
  Eye, 
  X, 
  Search,
  Filter,
  MoreVertical,
  ChevronRight,
  Clock,
  AlertCircle
} from "lucide-react";
import axiosInstance from "../../axios/axiosinstance";

const ClientConsultation = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("Pending Requests");
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [consultationToDelete, setConsultationToDelete] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const { consultations = [] } = useSelector(
    (state) => state.consultation || {}
  );

  useEffect(() => {
    dispatch(fetchMyConsultations());
  }, [dispatch]);

  const pendingCount = useMemo(() => {
    return consultations.filter((item) => item.status === "requested" || item.status === "accepted").length;
  }, [consultations]);

  const cancelledCount = useMemo(() => {
    return consultations.filter((item) => item.status === "rejected").length;
  }, [consultations]);

  const displayConsultations = useMemo(() => {
    if (activeTab === "Pending Requests") {
      return consultations.filter((item) => item.status === "requested" || item.status === "accepted");
    }
    return consultations.filter((item) => item.status === "rejected");
  }, [activeTab, consultations]);

  const getModeIcon = (mode) => {
    switch (mode) {
      case "video":
        return <Video size={16} className="text-blue-500" />;
      case "phone":
        return <Phone size={16} className="text-indigo-500" />;
      case "message":
        return <MessageCircle size={16} className="text-slate-500" />;
      case "in_person":
        return <MapPin size={16} className="text-indigo-500" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getModeLabel = (mode) => {
    switch (mode) {
      case "video":
        return "Video Call";
      case "phone":
        return "Phone Call";
      case "message":
        return "Chat";
      case "in_person":
        return "In-Person";
      default:
        return "N/A";
    }
  };

  const getProfileImageUrl = (profileImage, lawyerName = "Lawyer") => {
    return profileImage || `https://ui-avatars.com/api/?name=${lawyerName}&background=0F1A3D&color=fff`;
  };

  const handleDeleteClick = (consultation) => {
    setConsultationToDelete(consultation);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!consultationToDelete) return;
    
    setDeletingId(consultationToDelete.id);
    try {
      await axiosInstance.delete(`/consultations/${consultationToDelete.id}/`);
      dispatch(fetchMyConsultations());
      setShowDeleteConfirm(false);
      setConsultationToDelete(null);
    } catch (error) {
      console.error("Error deleting consultation:", error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        <DashHeader 
          title="Consultations" 
          subtitle="Request and manage consultation requests" 
        />

        <div className="flex-1 p-8 overflow-y-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-bold text-amber-500 mb-1">{pendingCount}</span>
              <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Pending Requests</span>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
              <span className="text-4xl font-bold text-red-500 mb-1">{cancelledCount}</span>
              <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Cancelled</span>
            </div>
          </div>

          {/* Filters and Tabs */}
          <div className="mb-6">
            <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
              {["Pending Requests", "Cancelled"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    activeTab === tab
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Lawyer</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Topic</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Requested Date</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Mode</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayConsultations.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <img 
                            src={getProfileImageUrl(item.lawyer?.profile_image, item.lawyer?.name)} 
                            alt={item.lawyer?.name || "Lawyer"} 
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${item.lawyer?.name || 'Lawyer'}&background=0F1A3D&color=fff`;
                            }}
                          />
                          <span className="font-semibold text-slate-900 text-sm tracking-tight">{item.lawyer?.name || "Lawyer"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-[#0F1A3D] line-clamp-2">{item.title || "Untitled"}</span>
                          {item.case_reference?.title && (
                            <span className="text-xs text-slate-500 font-medium mt-1">Case: {item.case_reference.title}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 text-slate-700">
                            <Calendar size={14} className="text-slate-400" />
                            <span className="text-sm font-medium">{item.requested_day || "N/A"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-500 mt-1">
                            <Clock size={14} className="text-slate-400" />
                            <span className="text-xs">{item.requested_time || "N/A"}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full w-fit border border-slate-100 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]">
                          {getModeIcon(item.mode)}
                          <span className="text-xs font-semibold text-slate-700">{getModeLabel(item.mode)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span 
                          className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-xs ${
                            item.status === "requested" || item.status === "accepted"
                              ? "bg-amber-50 text-amber-600 border border-amber-100" 
                              : "bg-red-50 text-red-600 border border-red-100"
                          }`}
                        >
                          {item.status === "requested" ? "Pending" : item.status === "accepted" ? "Accepted" : "Cancelled"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => setSelectedConsultation(item)}
                            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-all duration-200 border border-transparent hover:border-slate-200"
                          >
                            <Eye size={18} />
                          </button>
                          {item.status !== "rejected" && (
                            <button 
                              onClick={() => handleDeleteClick(item)}
                              className="p-2 hover:bg-red-50 rounded-full text-red-300 hover:text-red-500 transition-all duration-200 border border-transparent hover:border-red-100"
                            >
                              <X size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {displayConsultations.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                        No {activeTab.toLowerCase()} found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Details Modal */}
      {selectedConsultation && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 animate-in scale-in-95 duration-300">
            {/* Header */}
            <div className="bg-linear-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Consultation Details</h2>
              <button
                onClick={() => setSelectedConsultation(null)}
                className="p-1 hover:bg-slate-200 rounded-full text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Lawyer Section */}
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Lawyer</h3>
                <div className="flex items-center gap-3">
                  <img 
                    src={getProfileImageUrl(selectedConsultation.lawyer?.profile_image, selectedConsultation.lawyer?.name)} 
                    alt={selectedConsultation.lawyer?.name || "Lawyer"} 
                    className="w-12 h-12 rounded-full object-cover border-2 border-slate-200"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${selectedConsultation.lawyer?.name || 'Lawyer'}&background=0F1A3D&color=fff`;
                    }}
                  />
                  <p className="font-semibold text-slate-900 text-sm">{selectedConsultation.lawyer?.name || "Lawyer"}</p>
                </div>
              </div>

              {/* Topic */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Topic</label>
                <p className="text-sm text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200">{selectedConsultation.title || "Not specified"}</p>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Date</label>
                  <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 text-sm">
                    <Calendar size={14} className="text-indigo-500" />
                    <span className="font-semibold">{selectedConsultation.requested_day || "N/A"}</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Time</label>
                  <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 text-sm">
                    <Clock size={14} className="text-indigo-500" />
                    <span className="font-semibold">{selectedConsultation.requested_time || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Mode */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Mode</label>
                <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 w-fit text-sm">
                  {getModeIcon(selectedConsultation.mode)}
                  <span className="font-semibold text-slate-700">{getModeLabel(selectedConsultation.mode)}</span>
                </div>
              </div>

              {/* Conditional Fields - Only for In-Person */}
              {selectedConsultation.mode === "in_person" && (
                <>
                  {/* Meeting Location */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Location</label>
                    <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 text-sm">
                      <MapPin size={14} className="text-indigo-500" />
                      <span className="font-semibold">{selectedConsultation.meeting_location || "Not specified"}</span>
                    </div>
                  </div>

                  {/* Contact Phone */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Phone</label>
                    <p className="text-sm text-slate-800 bg-slate-50 p-3 rounded-lg border border-slate-200">{selectedConsultation.phone_number || "Not provided"}</p>
                  </div>
                </>
              )}

              {/* Status */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1">Status</label>
                <span 
                  className={`inline-flex px-3 py-1.5 rounded-full text-xs font-bold tracking-wide border ${
                    selectedConsultation.status === "requested" ? "bg-amber-50 text-amber-600 border-amber-200"
                    : selectedConsultation.status === "accepted" ? "bg-green-50 text-green-600 border-green-200"
                    : "bg-red-50 text-red-600 border-red-200"
                  }`}
                >
                  {selectedConsultation.status === "requested" ? "Pending" : selectedConsultation.status === "accepted" ? "Accepted" : "Cancelled"}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedConsultation(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold text-sm hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full border border-slate-200 animate-in scale-in-95 duration-300">
            <div className="p-6">
              <div className="flex items-center justify-center w-10 h-10 mx-auto mb-3 bg-red-100 rounded-full">
                <AlertCircle className="text-red-600" size={20} />
              </div>
              
              <h3 className="text-lg font-bold text-center text-slate-900 mb-2">Delete Consultation?</h3>
              <p className="text-center text-slate-600 text-sm mb-6">
                Are you sure you want to delete this consultation request with <strong>{consultationToDelete?.lawyer?.name}</strong>?
              </p>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setConsultationToDelete(null);
                  }}
                  className="w-full px-4 py-2 bg-slate-100 text-slate-900 rounded-lg font-semibold text-sm hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deletingId === consultationToDelete?.id}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-semibold text-sm hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {deletingId === consultationToDelete?.id && (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  {deletingId === consultationToDelete?.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientConsultation;
