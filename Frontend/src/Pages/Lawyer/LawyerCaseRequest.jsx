import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import DashHeader from "./LawyerDashHeader";
import { fetchCases, updateCaseStatus } from "../slices/caseSlice";
import { 
  Eye, 
  Check, 
  X, 
  FileText, 
  Calendar, 
  Phone,
  AlertCircle,
  TrendingUp,
  Filter
} from "lucide-react";

/**
 * LawyerCaseRequest Component
 * 
 * This page allows lawyers to review, accept, or reject incoming client case requests.
 * It features status summary cards, filterable tabs, and detailed case request cards.
 */
const LawyerCaseRequest = () => {
  const dispatch = useDispatch();
  const { cases, casesLoading, casesError } = useSelector((state) => state.case);
  const [activeTab, setActiveTab] = useState("Pending");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const statusMap = {
    Pending: "sent_to_lawyers",
    Accepted: "accepted",
    Rejected: "rejected",
  };

  useEffect(() => {
    dispatch(fetchCases());
  }, [dispatch]);

  const specificCases = useMemo(() => {
    const list = Array.isArray(cases) ? cases : [];
    return list.filter((item) => item.lawyer_selection === "specific");
  }, [cases]);

  const filteredCases = useMemo(() => {
    const status = statusMap[activeTab];
    return specificCases.filter((item) => item.status === status);
  }, [specificCases, activeTab]);

  // Summary statistics for the top cards
  const stats = [
    { label: "Pending", count: specificCases.filter(c => c.status === "sent_to_lawyers").length, color: "text-orange-500", bg: "bg-orange-50" },
    { label: "Urgent", count: specificCases.filter(c => c.urgency_level === "High" && c.status === "sent_to_lawyers").length, color: "text-red-500", bg: "bg-red-50" },
    { label: "Accepted", count: specificCases.filter(c => c.status === "accepted").length, color: "text-green-500", bg: "bg-green-50" },
    { label: "Rejected", count: specificCases.filter(c => c.status === "rejected").length, color: "text-gray-500", bg: "bg-gray-50" }
  ];

  const handleAccept = async (id) => {
    try {
      await dispatch(updateCaseStatus({ caseId: id, status: "accepted" })).unwrap();
      await dispatch(fetchCases()).unwrap();
    } catch (error) {
      console.error('Failed to accept case:', error);
    }
  };

  const handleReject = (id) => {
    setSelectedCase(id);
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    try {
      await dispatch(updateCaseStatus({ caseId: selectedCase, status: "rejected" })).unwrap();
      await dispatch(fetchCases()).unwrap();
      setShowRejectModal(false);
    } catch (error) {
      console.error('Failed to reject case:', error);
      setShowRejectModal(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High": return "bg-red-100 text-red-600 border border-red-200";
      case "Medium": return "bg-yellow-100 text-yellow-600 border border-yellow-200";
      case "Low": return "bg-blue-100 text-blue-600 border border-blue-200";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const getInitials = (name = "") => {
    const parts = name.trim().split(" ");
    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
  };

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      {/* Sidebar - Integrated from existing components */}
      <Sidebar />
      
      <div className="flex-1 ml-64">
        {/* Header - Integrated from existing components */}
        <DashHeader 
          title="Case Requests" 
          subtitle="Review and respond to client case requests" 
        />
        
        <main className="p-8 space-y-8">
          {/* Section 1: Status Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <button 
                key={index}
                onClick={() => setActiveTab(stat.label === "Urgent" ? "Pending" : stat.label)}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2 hover:shadow-md transition-all group"
              >
                <span className={`text-4xl font-bold ${stat.color}`}>{stat.count}</span>
                <span className="text-gray-500 font-medium group-hover:text-gray-700">{stat.label}</span>
              </button>
            ))}
          </div>

          {/* Section 2: Filter Tabs & Category Filter */}
          <div className="flex items-center justify-between">
            <div className="flex p-1 bg-gray-100 rounded-xl w-fit">
              {["Pending", "Accepted", "Rejected"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-8 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    activeTab === tab 
                      ? "bg-white text-[#0F1A3D] shadow-sm" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold bg-white hover:bg-gray-50 transition-colors">
              <Filter size={18} />
              All Categories
              <span className="border-l border-gray-200 ml-2 pl-2">▼</span>
            </button>
          </div>

          {/* Section 3: Case Request List */}
          <div className="space-y-6">
            {casesLoading ? (
              <div className="bg-white py-20 rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-gray-500 gap-4">
                <div className="w-12 h-12 border-4 border-[#0F1A3D] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-medium">Loading case requests...</p>
              </div>
            ) : casesError ? (
              <div className="bg-white py-20 rounded-2xl border border-red-200 flex flex-col items-center justify-center text-red-500 gap-4">
                <p className="text-lg font-medium">{casesError}</p>
                <button
                  onClick={() => dispatch(fetchCases())}
                  className="px-4 py-2 bg-[#0F1A3D] text-white rounded-lg text-sm font-semibold hover:bg-black transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : filteredCases.length > 0 ? (
              filteredCases.map((item) => (
                <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col xl:flex-row gap-6 hover:shadow-md transition-shadow">
                  {/* Client Information Column */}
                  <div className="w-full xl:w-48 flex flex-row xl:flex-col items-center gap-4 xl:gap-3 xl:border-r border-gray-100 xl:pr-6">
                    {item.client_profile_image ? (
                      <img 
                        src={item.client_profile_image} 
                        alt={item.client_name}
                        className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-50"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-blue-50 text-[#0F1A3D] flex items-center justify-center font-bold ring-2 ring-gray-50 text-xl">
                        {getInitials(item.client_name)}
                      </div>
                    )}
                    <div className="text-left xl:text-center flex-1">
                      <h3 className="font-bold text-gray-900 leading-tight">{item.client_name}</h3>
                      <p className="text-xs text-gray-500 mt-1 flex items-center xl:justify-center gap-1">
                        <Phone size={12} />
                        {item.client_email}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-2">Received: {formatDate(item.created_at)}</p>
                    </div>
                  </div>

                  {/* Case Details Middle Column */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-xl font-bold text-[#0F1A3D]">{item.case_title}</h2>
                          <div className="flex gap-2">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getPriorityColor(item.urgency_level)}`}>
                              {item.urgency_level} priority
                            </span>
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                              {item.status.replace(/_/g, " ")}
                            </span>
                          </div>
                        </div>
                        <span className="inline-block bg-[#0F1A3D] text-white px-3 py-1 rounded text-[11px] font-semibold mt-1">
                          {item.case_category}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed max-w-3xl line-clamp-2">
                      {item.case_description}
                    </p>

                    {/* Display accepted lawyer info for accepted cases */}
                    {activeTab === "Accepted" && item.lawyer_name && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm font-semibold text-green-900 flex items-center gap-2">
                          <Check size={16} className="text-green-600" />
                          Case Accepted by You
                        </p>
                        {item.accepted_at && (
                          <p className="text-xs text-green-700 mt-1">
                            Accepted on: {formatDate(item.accepted_at)}
                          </p>
                        )}
                        {item.lawyer_email && (
                          <p className="text-xs text-green-700">
                            Contact: {item.lawyer_email}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={18} className="text-gray-400" />
                        <span className="font-medium whitespace-nowrap">Created: {formatDate(item.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FileText size={18} className="text-gray-400" />
                        {item.document_count} documents
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <AlertCircle size={18} className="text-gray-400" />
                        {item.request_consultation ? "Consultation requested" : "No consultation"}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <TrendingUp size={18} className="text-gray-400" />
                        {item.proposal_count} proposals
                      </div>
                    </div>
                  </div>

                  {/* Right Actions Column */}
                  <div className="flex flex-row xl:flex-col gap-3 justify-center xl:pl-6 xl:border-l border-gray-100 w-full xl:w-44">
                    <button className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                      <Eye size={18} />
                      View
                    </button>
                    {activeTab === "Pending" && (
                      <>
                        <button 
                          onClick={() => handleAccept(item.id)}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-colors"
                        >
                          <Check size={18} />
                          Accept
                        </button>
                        <button 
                          onClick={() => handleReject(item.id)}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-colors"
                        >
                          <X size={18} />
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white py-20 rounded-2xl border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 gap-4">
                <AlertCircle size={48} className="text-gray-300" />
                <p className="text-lg font-medium">No {activeTab} case requests found.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Reject Confirmation Modal pop-up */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                <X size={32} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Are you sure?</h2>
              <p className="text-gray-500">Do you really want to reject this case request? This action cannot be undone.</p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowRejectModal(false)}
                className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmReject}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors"
              >
                Yes, Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LawyerCaseRequest;