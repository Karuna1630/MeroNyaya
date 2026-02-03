import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import LawyerDashHeader from "./LawyerDashHeader";
import {
  FileText,
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  Mail,
  Phone,
  MessageSquare,
  Download,
  Upload,
  CheckCircle,
  Circle,
  Plus,
} from "lucide-react";
import { fetchCases, updateCaseDetails } from "../slices/caseSlice";

const LawyerCaseDetail = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("Details");
  const [isEditing, setIsEditing] = useState(false);
  const [noteText, setNoteText] = useState("");

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
      await dispatch(
        updateCaseDetails({
          caseId: id,
          data: formData,
        })
      ).unwrap();
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update case:", error);
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

  const getStatusBadge = (status) => {
    const styles = {
      accepted: "bg-blue-50 text-blue-600",
      in_progress: "bg-amber-50 text-amber-600",
      completed: "bg-green-50 text-green-600",
      public: "bg-gray-50 text-gray-600",
    };
    return styles[status] || "bg-gray-50 text-gray-600";
  };

  const getUrgencyBadge = (urgency) => {
    const styles = {
      High: "bg-red-50 text-red-600",
      Medium: "bg-amber-50 text-amber-600",
      Low: "bg-blue-50 text-blue-600",
    };
    return styles[urgency] || "bg-gray-50 text-gray-600";
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
          <FileText size={48} className="text-gray-400" />
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
        <LawyerDashHeader title="Dashboard" subtitle={`Welcome back, Adv. Ram Kumar`} />

        <div className="flex-1 overflow-y-auto p-6">
          {/* Back Button */}
          <button
            onClick={() => navigate("/lawyercase")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6 text-sm font-medium"
          >
            <ChevronLeft size={18} />
            Back
          </button>

          {/* Case Header */}
          <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                  {caseData.case_title}
                </h1>
                <p className="text-sm text-gray-500">
                  Case ID: CASE-{String(caseData.id).padStart(4, "0")}-{new Date().getFullYear().toString().slice(-3)}
                </p>
              </div>
              <div className="flex gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getUrgencyBadge(
                    caseData.urgency_level
                  )}`}
                >
                  {caseData.urgency_level} priority
                </span>
                <button
                  onClick={() => navigate(`/lawyermessage`)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0F1A3D] text-white rounded-lg hover:bg-black transition text-sm font-medium"
                >
                  <MessageSquare size={16} />
                  Message Client
                </button>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                >
                  {isEditing ? "Cancel" : "Update Status"}
                </button>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Calendar size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Created Date</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatDate(caseData.created_at)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <Clock size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Next Hearing</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatDate(caseData.next_hearing_date)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <FileText size={20} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Documents</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {caseData.document_count || 0} files
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                  <MapPin size={20} className="text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Court</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {caseData.court_name || "Not assigned"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="col-span-2 space-y-6">
              {/* Tabs */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="border-b border-gray-200">
                  <div className="flex gap-1 p-1">
                    {["Timeline", "Documents", "Details"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 text-sm font-medium rounded transition ${
                          activeTab === tab
                            ? "bg-gray-100 text-gray-900"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Timeline Tab */}
                {activeTab === "Timeline" && (
                  <div className="p-6">
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Case Timeline</h3>
                      <div className="flex gap-2">
                        <textarea
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder="Add a note or update..."
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          rows={3}
                        />
                      </div>
                      <button className="mt-2 px-4 py-2 bg-[#0F1A3D] text-white rounded-lg hover:bg-black transition text-sm font-medium">
                        <Plus size={16} className="inline mr-1" />
                        Add Note
                      </button>
                    </div>

                    <div className="space-y-4">
                      {/* Timeline items would go here */}
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle size={16} className="text-green-600" />
                          </div>
                          <div className="w-px h-full bg-gray-200"></div>
                        </div>
                        <div className="flex-1 pb-8">
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-medium text-gray-900">Document Review Completed</p>
                            <span className="text-xs text-gray-500">Dec 17, 2024</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Reviewed all submitted property documents and verified authenticity.
                          </p>
                          <p className="text-xs text-gray-500 mt-1">By: You</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Documents Tab */}
                {activeTab === "Documents" && (
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Case Documents</h3>
                      <button className="flex items-center gap-2 px-4 py-2 bg-[#0F1A3D] text-white rounded-lg hover:bg-black transition text-sm font-medium">
                        <Upload size={16} />
                        Upload
                      </button>
                    </div>
                    <p className="text-sm text-gray-500">
                      No documents uploaded yet. Upload documents to share with your client.
                    </p>
                  </div>
                )}

                {/* Details Tab */}
                {activeTab === "Details" && (
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Case Details</h3>

                    <div className="space-y-6">
                      {/* Description */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {caseData.case_description}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Case Type */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Case Type
                          </label>
                          <p className="text-sm text-gray-900">{caseData.case_category}</p>
                        </div>

                        {/* Status */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                          </label>
                          {isEditing ? (
                            <select
                              name="status"
                              value={formData.status}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            >
                              <option value="accepted">Accepted</option>
                              <option value="in_progress">In Progress</option>
                              <option value="completed">Completed</option>
                            </select>
                          ) : (
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                                caseData.status
                              )}`}
                            >
                              {caseData.status?.replace(/_/g, " ")}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {/* Filing Date */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Filing Date
                          </label>
                          <p className="text-sm text-gray-900">
                            {formatDate(caseData.created_at)}
                          </p>
                        </div>

                        {/* Hearing Time */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Next Hearing
                          </label>
                          {isEditing ? (
                            <input
                              type="date"
                              name="nextHearingDate"
                              value={formData.nextHearingDate}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          ) : (
                            <p className="text-sm text-gray-900">
                              {formatDate(caseData.next_hearing_date)}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Court Address */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Court Address
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="courtName"
                            value={formData.courtName}
                            onChange={handleInputChange}
                            placeholder="Enter court name"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          />
                        ) : (
                          <p className="text-sm text-gray-900">
                            {caseData.court_name || "Not assigned"}
                          </p>
                        )}
                      </div>

                      {isEditing && (
                        <div className="flex gap-2 pt-4">
                          <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-[#0F1A3D] text-white rounded-lg hover:bg-black transition text-sm font-medium"
                          >
                            Save Changes
                          </button>
                          <button
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Client Information */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Client Information
                </h3>

                <div className="flex items-center gap-3 mb-4">
                  {caseData.client_profile_image ? (
                    <img
                      src={caseData.client_profile_image}
                      alt={caseData.client_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-700 font-semibold">
                        {caseData.client_name?.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{caseData.client_name}</p>
                    <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-medium rounded">
                      Client
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={16} />
                    <span>+977-9841234567</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail size={16} />
                    <span>{caseData.client_email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={16} />
                    <span>Kathmandu, Ward 10</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
                    <MessageSquare size={16} />
                    Message
                  </button>
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium">
                    <Calendar size={16} />
                    Schedule
                  </button>
                </div>
              </div>

              {/* Tasks */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Tasks</h3>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Plus size={20} />
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        Prepare court arguments for hearing
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Due: Dec 16, 2024</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">Submit additional evidence</p>
                      <p className="text-xs text-gray-500 mt-1">Due: Dec 17, 2024</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <input
                      type="checkbox"
                      checked
                      readOnly
                      className="mt-1 w-4 h-4 text-green-600 border-green-300 rounded focus:ring-green-500"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 line-through">
                        Review opposing party's claims
                      </p>
                      <p className="text-xs text-gray-500 mt-1">Due: Dec 15, 2024</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LawyerCaseDetail;
