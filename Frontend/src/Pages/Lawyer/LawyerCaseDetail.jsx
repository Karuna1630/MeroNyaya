import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import LawyerDashHeader from "./LawyerDashHeader";
import {
  FileText,
  ChevronLeft,
  Calendar,
  MapPin,
  User,
  Scale,
  Save,
  Edit,
  X,
  Upload,
  Download,
  CheckCircle2,
  Clock,
  Gavel,
  AlertCircle,
} from "lucide-react";
import { fetchCases, updateCaseDetails } from "../slices/caseSlice";

const LawyerCaseDetail = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("Details");

  const { cases, casesLoading } = useSelector((state) => state.case);
  const caseData = cases?.find((c) => c.id === parseInt(id));

  const [formData, setFormData] = useState({
    caseNumber: "",
    courtName: "",
    opposingParty: "",
    nextHearingDate: "",
    status: "accepted",
  });

  useEffect(() => {
    dispatch(fetchCases());
  }, [dispatch]);

  useEffect(() => {
    if (caseData) {
      setFormData({
        caseNumber: caseData.case_number || "",
        courtName: caseData.court_name || "",
        opposingParty: caseData.opposing_party || "",
        nextHearingDate: caseData.next_hearing_date || "",
        status: caseData.status || "accepted",
      });
    }
  }, [caseData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      await dispatch(updateCaseDetails({ 
        caseId: id, 
        data: formData 
      })).unwrap();
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update case:", error);
      alert("Failed to update case details. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (casesLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#0F1A3D] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <AlertCircle size={48} className="text-gray-400" />
          <p className="text-gray-600">Case not found</p>
          <button
            onClick={() => navigate("/lawyercase")}
            className="px-4 py-2 bg-[#0F1A3D] text-white rounded-lg hover:bg-black transition"
          >
            Back to Cases
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden ml-64">
        <LawyerDashHeader
          title="Case Details"
          subtitle={`CASE-${id}`}
        />

        <div className="flex-1 overflow-y-auto p-8">
          {/* Back Button */}
          <button
            onClick={() => navigate("/lawyercase")}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-6 text-sm font-medium"
          >
            <ChevronLeft size={18} />
            Back to My Cases
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Case Header */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <FileText size={24} className="text-slate-700" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
                          CASE-{id}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                            caseData.status === "completed"
                              ? "bg-green-50 text-green-600"
                              : caseData.status === "in_progress"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-yellow-50 text-yellow-600"
                          }`}
                        >
                          {caseData.status?.replace(/_/g, " ")}
                        </span>
                      </div>
                      <h1 className="text-xl font-bold text-slate-900 leading-tight mb-1">
                        {caseData.case_title}
                      </h1>
                      <p className="text-sm text-slate-500 font-medium">
                        {caseData.case_category}
                      </p>
                    </div>
                  </div>

                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2.5 bg-[#0F1A3D] text-white rounded-lg hover:bg-slate-800 transition-all text-sm font-semibold"
                    >
                      <Edit size={16} />
                      Edit Details
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm font-semibold"
                      >
                        <Save size={16} />
                        Save
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all text-sm font-semibold"
                      >
                        <X size={16} />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    label: "Created Date",
                    value: formatDate(caseData.created_at),
                    icon: Calendar,
                    color: "text-blue-500",
                    bg: "bg-blue-50",
                  },
                  {
                    label: "Accepted Date",
                    value: formatDate(caseData.accepted_at),
                    icon: CheckCircle2,
                    color: "text-green-500",
                    bg: "bg-green-50",
                  },
                  {
                    label: "Documents",
                    value: `${caseData.document_count || 0} Files`,
                    icon: FileText,
                    color: "text-slate-500",
                    bg: "bg-slate-50",
                  },
                  {
                    label: "Urgency",
                    value: caseData.urgency_level || "Medium",
                    icon: AlertCircle,
                    color: "text-amber-500",
                    bg: "bg-amber-50",
                  },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3"
                  >
                    <div
                      className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center`}
                    >
                      <stat.icon size={20} className={stat.color} />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                        {stat.label}
                      </p>
                      <p className="text-sm font-bold text-slate-800 break-words">
                        {stat.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tabs */}
              <div className="space-y-6">
                <div className="bg-slate-100/50 p-1 rounded-xl flex gap-1 w-fit">
                  {["Details", "Documents", "Timeline"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-8 py-2 text-sm font-semibold rounded-lg transition-all ${
                        activeTab === tab
                          ? "bg-white text-slate-900 shadow-sm"
                          : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Details Tab */}
                {activeTab === "Details" && (
                  <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">
                      Case Information
                    </h3>

                    <div className="space-y-6">
                      {/* Editable Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Case Number */}
                        <div>
                          <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                            <Scale size={16} className="text-blue-600" />
                            Case Number
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              name="caseNumber"
                              value={formData.caseNumber}
                              onChange={handleInputChange}
                              placeholder="LC-2025-XXXX"
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                            />
                          ) : (
                            <p className="text-sm font-bold text-slate-900">
                              {formData.caseNumber || "Not set"}
                            </p>
                          )}
                        </div>

                        {/* Court Name */}
                        <div>
                          <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                            <Gavel size={16} className="text-purple-600" />
                            Court Name
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              name="courtName"
                              value={formData.courtName}
                              onChange={handleInputChange}
                              placeholder="District Court, Kathmandu"
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                            />
                          ) : (
                            <p className="text-sm font-bold text-slate-900">
                              {formData.courtName || "Not set"}
                            </p>
                          )}
                        </div>

                        {/* Next Hearing Date */}
                        <div>
                          <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                            <Calendar size={16} className="text-green-600" />
                            Next Hearing Date
                          </label>
                          {isEditing ? (
                            <input
                              type="date"
                              name="nextHearingDate"
                              value={formData.nextHearingDate}
                              onChange={handleInputChange}
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                            />
                          ) : (
                            <p className="text-sm font-bold text-slate-900">
                              {formatDate(formData.nextHearingDate)}
                            </p>
                          )}
                        </div>

                        {/* Opposing Party */}
                        <div>
                          <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                            <User size={16} className="text-red-600" />
                            Opposing Party
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              name="opposingParty"
                              value={formData.opposingParty}
                              onChange={handleInputChange}
                              placeholder="Name of opposing party"
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                            />
                          ) : (
                            <p className="text-sm font-bold text-slate-900">
                              {formData.opposingParty || "Not set"}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Case Description (Read-only) */}
                      <div className="pt-6 border-t border-slate-100">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                          Case Description
                        </p>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {caseData.case_description}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Documents Tab */}
                {activeTab === "Documents" && (
                  <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-slate-900">
                        Case Documents
                      </h3>
                      <button className="flex items-center gap-2 px-4 py-2 bg-[#0F1A3D] text-white rounded-lg hover:bg-slate-800 transition-all text-sm font-semibold">
                        <Upload size={16} />
                        Upload Document
                      </button>
                    </div>
                    <p className="text-sm text-slate-500">
                      No documents available. Upload documents to share with your
                      client.
                    </p>
                  </div>
                )}

                {/* Timeline Tab */}
                {activeTab === "Timeline" && (
                  <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">
                      Case Timeline
                    </h3>
                    <p className="text-sm text-slate-500">
                      Timeline feature coming soon...
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Client Info */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <User size={18} className="text-blue-600" />
                  Client Information
                </h3>

                <div className="flex items-center gap-4 mb-6">
                  {caseData.client_profile_image ? (
                    <img
                      src={caseData.client_profile_image}
                      alt={caseData.client_name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
                      {caseData.client_name?.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-slate-900">
                      {caseData.client_name}
                    </h4>
                    <p className="text-xs font-medium text-slate-500">
                      {caseData.client_email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Update */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Clock size={18} className="text-amber-500" />
                  Update Status
                </h3>

                {isEditing ? (
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                  >
                    <option value="accepted">Accepted</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                ) : (
                  <p
                    className={`px-3 py-2 rounded-lg text-sm font-bold ${
                      formData.status === "completed"
                        ? "bg-green-50 text-green-600"
                        : formData.status === "in_progress"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-yellow-50 text-yellow-600"
                    }`}
                  >
                    {formData.status?.replace(/_/g, " ").toUpperCase()}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LawyerCaseDetail;
