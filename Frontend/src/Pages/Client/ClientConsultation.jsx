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
  Clock
} from "lucide-react";

const ClientConsultation = () => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("Pending Requests");

  const { consultations = [], consultationsLoading } = useSelector(
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
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Case Reference</th>
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
                            src={item.lawyer?.profile_image || "https://ui-avatars.com/api/?name=Lawyer&background=0F1A3D&color=fff"} 
                            alt={item.lawyer?.name || "Lawyer"} 
                            className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm"
                          />
                          <span className="font-semibold text-slate-900 text-sm tracking-tight">{item.lawyer?.name || "Lawyer"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-[#0F1A3D]">{item.case_reference?.id || "N/A"}</span>
                          <span className="text-xs text-slate-500 font-medium">{item.case_reference?.title || "No case linked"}</span>
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
                          <button className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-all duration-200 border border-transparent hover:border-slate-200">
                            <Eye size={18} />
                          </button>
                          {item.status !== "rejected" && (
                            <button className="p-2 hover:bg-red-50 rounded-full text-red-300 hover:text-red-500 transition-all duration-200 border border-transparent hover:border-red-100">
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
    </div>
  );
};

export default ClientConsultation;
