import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "./../Sidebar";
import LawyerDashHeader from "../LawyerDashHeader.jsx";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  FileText,
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  AlertCircle,
  MessageSquare,
  Mail,
  Phone,
  Building2,
  Edit2,
  CheckCircle,
} from "lucide-react";
import { fetchCases, updateCaseDetails, updateCaseStatus } from "../../slices/caseSlice.js";
import { getCasePaymentRequests } from "../../../axios/casePaymentAPI";
import LawyerCaseTimlineCard from "./LawyerCaseTimelineCard.jsx";
import LawyerCaseDocumentCard from "./LawyerCaseDocumentCard.jsx";
import LawyerCaseDetailCard from "./LawyerCaseDetailCard.jsx";
import CreatePaymentRequestForm from "../../../components/CasePayment/CreatePaymentRequestForm.jsx";
import PaymentRequestCard from "../../../components/CasePayment/PaymentRequestCard.jsx";

const LawyerCaseDetail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("Details");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editFormData, setEditFormData] = useState({
    case_number: "",
    court_name: "",
    opposing_party: "",
    next_hearing_date: "",
    status: "",
  });
  const [paymentRequests, setPaymentRequests] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  // Select necessary state from Redux store
  const { cases, casesLoading } = useSelector((state) => state.case);
  const { user } = useSelector((state) => state.auth);
  const caseData = cases?.find((c) => c.id === parseInt(id));
  
  // Check if the current lawyer is assigned to this case
  const isAssignedLawyer = caseData?.lawyer === user?.id || caseData?.lawyer_id === user?.id;
  const canScheduleCaseMeeting = Boolean(
    isAssignedLawyer && (caseData?.status === "accepted" || caseData?.status === "in_progress")
  );

  // Fetch cases when component mounts
  useEffect(() => {
    dispatch(fetchCases());
  }, [dispatch]);

  // Fetch payment requests
  const fetchPayments = async () => {
    if (!id) {
      console.log("No case ID, skipping payment fetch");
      return;
    }
    try {
      console.log("Fetching payment requests for case ID:", parseInt(id));
      setLoadingPayments(true);
      const response = await getCasePaymentRequests(parseInt(id));
      console.log("Full payment response:", response.data);
      
      if (response.data.IsSuccess) {
        const payments = response.data.Result.payment_requests || [];
        console.log("Extracted payment requests:", payments);
        setPaymentRequests(payments);
      } else {
        console.warn("API returned IsSuccess: false");
        console.warn("Error message:", response.data.ErrorMessage);
        console.warn("Status code:", response.data["Status Code"] || response.status);
      }
    } catch (error) {
      console.error("Error fetching payment requests:", error);
      console.error("Error response data:", error.response?.data);
      console.error("Error status:", error.response?.status);
      console.error("Error message:", error.response?.data?.ErrorMessage || error.message);
    } finally {
      setLoadingPayments(false);
    }
  };

  // Handle marking case as complete after payment
  const handleMarkCaseComplete = async () => {
    try {
      const resultAction = await dispatch(
        updateCaseStatus({ caseId: parseInt(id), status: 'completed' })
      );
      if (updateCaseStatus.fulfilled.match(resultAction)) {
        await dispatch(fetchCases());
        toast.success(t('casePayment.caseMarkedComplete') || 'Case marked as completed successfully');
      } else {
        toast.error(t('casePayment.failedToComplete') || 'Failed to complete case');
      }
    } catch (error) {
      console.error('Error marking case as complete:', error);
      toast.error('Error marking case as complete');
    }
  };

  useEffect(() => {
    if (activeTab === "Payment") {
      fetchPayments();
    }
  }, [activeTab, id]);

  // Initialize edit form data when caseData changes
  useEffect(() => {
    if (caseData) {
      setEditFormData({
        case_number: caseData.case_number || "",
        court_name: caseData.court_name || "",
        opposing_party: caseData.opposing_party || "",
        next_hearing_date: caseData.next_hearing_date || "",
        status: caseData.status || "",
      });
    }
  }, [caseData]);

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form data to original values
    if (caseData) {
      setEditFormData({
        case_number: caseData.case_number || "",
        court_name: caseData.court_name || "",
        opposing_party: caseData.opposing_party || "",
        next_hearing_date: caseData.next_hearing_date || "",
        status: caseData.status || "",
      });
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      await dispatch(
        updateCaseDetails({
          caseId: caseData.id,
          data: editFormData,
        })
      ).unwrap();
      setIsEditing(false);
      // Refresh cases to get updated data
      dispatch(fetchCases());
    } catch (error) {
      console.error("Error updating case details:", error);
      alert("Failed to update case details. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleScheduleClick = () => {
    if (!canScheduleCaseMeeting) {
      toast.error("Only accepted cases assigned to you can create appointments.");
      return;
    }
    navigate("/lawyerappointment");
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

  const formatTime = (dateString) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      in_progress: { bg: "bg-blue-100", text: "text-blue-700", label: "In Progress" },
      completed: { bg: "bg-green-100", text: "text-green-700", label: "Completed" },
      accepted: { bg: "bg-amber-100", text: "text-amber-700", label: "Accepted" },
      pending: { bg: "bg-gray-100", text: "text-gray-700", label: "Pending" },
    };
    return statusMap[status] || statusMap.pending;
  };

  const getPriorityBadge = (urgency) => {
    const priorityMap = {
      High: { bg: "bg-red-100", text: "text-red-700", label: "high priority" },
      Medium: { bg: "bg-amber-100", text: "text-amber-700", label: "medium priority" },
      Low: { bg: "bg-blue-100", text: "text-blue-700", label: "low priority" },
    };
    return priorityMap[urgency] || priorityMap.Medium;
  };

  if (casesLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center ml-64">
          <div className="w-12 h-12 border-4 border-[#0F1A3D] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 ml-64">
          <AlertCircle size={48} className="text-gray-400" />
          <p className="text-gray-600">Case not found</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-[#0F1A3D] text-white rounded-lg hover:bg-black transition"
          >
            Back to Cases
          </button>
        </div>
      </div>
    );
  }

  const statusBadge = getStatusBadge(caseData.status);
  const priorityBadge = getPriorityBadge(caseData.urgency_level);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <LawyerDashHeader title="Dashboard" subtitle={`Welcome back, Adv. Ram Kumar`} />

        <div className="flex-1 overflow-y-auto p-6">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 text-sm font-medium"
          >
            <ChevronLeft size={18} />
          </button>

          {/* Header Section */}
          <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{caseData.case_title}</h1>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${priorityBadge.bg} ${priorityBadge.text}`}>
                    {priorityBadge.label}
                  </span>
                </div>
                <p className="text-sm text-gray-600">Case ID: CASE-2024-{String(id).padStart(3, "0")}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    if (caseData?.status === 'pending') {
                      toast.error('Chat is available once you accept this case');
                      return;
                    }
                    navigate('/lawyermessage', { state: { caseId: caseData.id } });
                  }}
                  disabled={caseData?.status === 'pending'}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  title={caseData?.status === 'pending' ? 'Chat available once you accept the case' : 'Message the client'}
                >
                  <MessageSquare size={16} />
                  Message Client
                </button>
                {isAssignedLawyer && (
                  <button
                    onClick={() => {
                      setActiveTab("Details");
                      setIsEditing(true);
                    }}
                    className="px-4 py-2 bg-[#0F1A3D] text-white rounded-lg text-sm font-medium hover:bg-slate-800 flex items-center gap-2"
                  >
                    <Edit2 size={16} />
                    Edit Details
                  </button>
                )}
                {!isAssignedLawyer && (
                  <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold flex items-center gap-2">
                    <AlertCircle size={16} />
                    View Only - Not Assigned
                  </div>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={16} className="text-gray-600" />
                  <span className="text-xs text-gray-600 font-medium">Created Date</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{formatDate(caseData.created_at)}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Clock size={16} className="text-green-600" />
                  <span className="text-xs text-green-700 font-medium">Next Hearing</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{formatDate(caseData.next_hearing_date)}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <FileText size={16} className="text-purple-600" />
                  <span className="text-xs text-purple-700 font-medium">Documents</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{caseData?.documents?.length || 0} files</p>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin size={16} className="text-amber-600" />
                  <span className="text-xs text-amber-700 font-medium">Court</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{caseData.court_name || "Not assigned"}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="col-span-2">
              {/* Tabs */}
              <div className="bg-white rounded-lg shadow-sm mb-6">
                <div className="border-b border-gray-200">
                  <nav className="flex">
                    {["Timeline", `Documents (${caseData?.documents?.length || 0})`, "Details", ...(caseData?.status === 'in_progress' || caseData?.status === 'completed' || paymentRequests.length > 0 ? ["Payment"] : [])].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => {
                          if (tab.includes('Documents')) setActiveTab('Documents');
                          else setActiveTab(tab);
                        }}
                        className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                          (activeTab === 'Documents' && tab.includes('Documents')) || activeTab === tab
                            ? "border-[#0F1A3D] text-[#0F1A3D]"
                            : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="p-6">
                  {/* Timeline Tab */}
                  {activeTab === "Timeline" && (
                    <LawyerCaseTimlineCard
                      caseId={parseInt(id)}
                      timeline={caseData?.timeline || []}
                      onTimelineUpdate={() => dispatch(fetchCases())}
                      isAssignedLawyer={isAssignedLawyer}
                    />
                  )}

                  {/* Documents Tab */}
                  {activeTab === "Documents" && (
                    <LawyerCaseDocumentCard 
                      caseId={parseInt(id)} 
                      documents={caseData?.documents || []} 
                      isAssignedLawyer={isAssignedLawyer}
                    />
                  )}

                  {/* Details Tab */}
                  {activeTab === "Details" && (
                    <LawyerCaseDetailCard
                      caseData={caseData}
                      statusBadge={statusBadge}
                      formatDate={formatDate}
                      formatTime={formatTime}
                      isEditing={isEditing && isAssignedLawyer}
                      editFormData={editFormData}
                      onEditChange={handleEditChange}
                      onSave={handleSaveChanges}
                      onCancel={handleCancelEdit}
                      isSaving={isSaving}
                      paymentRequest={paymentRequests[0]}
                    />
                  )}

                  {/* Payment Tab */}
                  {activeTab === "Payment" && (
                    <div className="space-y-6">
                      {console.log("Payment tab - Loading:", loadingPayments, "Requests count:", paymentRequests?.length, "Requests:", paymentRequests)}
                      {loadingPayments ? (
                        <div className="flex justify-center py-12">
                          <div className="w-8 h-8 border-4 border-[#0F1A3D] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      ) : paymentRequests && paymentRequests.length > 0 ? (
                        <>
                          {console.log("Rendering payment request card with:", paymentRequests[0])}
                          <PaymentRequestCard
                            paymentRequest={paymentRequests[0]}
                            currentUser={user}
                            onResponseSuccess={fetchPayments}
                          />

                          {/* Mark Case as Complete button - shown when payment is paid */}
                          {isAssignedLawyer && paymentRequests.some(p => p.status === 'paid') && caseData?.status !== 'completed' && (
                            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                              <p className="text-green-800 mb-4 font-medium">
                                {t('casePayment.paymentReceivedMarkComplete') || 'Payment received! You can now mark this case as completed.'}
                              </p>
                              <button
                                onClick={handleMarkCaseComplete}
                                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center gap-2"
                              >
                                <CheckCircle size={18} />
                                {t('casePayment.markCaseComplete') || 'Mark Case as Complete'}
                              </button>
                            </div>
                          )}
                        </>
                      ) : isAssignedLawyer && caseData?.status === 'in_progress' ? (
                        <CreatePaymentRequestForm
                          caseId={parseInt(id)}
                          onSuccess={fetchPayments}
                        />
                      ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                          <p className="text-gray-600">No payment requests found for this case.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Client Information */}
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Client Information</h3>
                
                <div className="flex items-center gap-3 mb-4">
                  {caseData.client_profile_image ? (
                    <img
                      src={caseData.client_profile_image}
                      alt={caseData.client_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center">
                      <span className="text-pink-700 font-semibold text-lg">
                        {caseData.client_name?.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-900">{caseData.client_name}</h4>
                    <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
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

                <div className="flex gap-2 mt-4">
                  <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center justify-center gap-2">
                    <MessageSquare size={16} />
                    Message
                  </button>
                  <button
                    type="button"
                    onClick={handleScheduleClick}
                    className={`flex-1 px-4 py-2 border rounded-lg text-sm font-medium flex items-center justify-center gap-2 ${
                      canScheduleCaseMeeting
                        ? "border-gray-300 hover:bg-gray-50"
                        : "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
                    }`}
                    disabled={!canScheduleCaseMeeting}
                  >
                    <Calendar size={16} />
                    Schedule
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <ToastContainer />
    </div>
  );
};

export default LawyerCaseDetail;
