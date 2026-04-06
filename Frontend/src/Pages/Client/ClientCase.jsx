import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Send,
  Trash2,
  MessageCircle,
  CheckCircle,
  XCircle,
  MessageSquare,
  Calendar,
  Lock,
  AlertCircle,
  RefreshCw,
  FileText,
  Star,
  Download,
  FileArchive,
  DollarSign,
  Briefcase,
} from "lucide-react";
import Sidebar from "./sidebar";
import DashHeader from "./ClientDashHeader";
import { fetchCases, deleteCase, updateCase } from "../slices/caseSlice";
import Pagination from "../../components/Pagination";
import RatingModal from "../../components/RatingModal";
import { createReview } from "../../axios/reviewAPI";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ClientCase = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState(() => {
    return sessionStorage.getItem('clientCaseActiveTab') || t('cases.allCases');
  });
  const [categoryFilter, setCategoryFilter] = useState(t('cases.allCategories'));
  const [withdrawModal, setWithdrawModal] = useState({ isOpen: false, caseId: null, caseTitle: null });
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, caseId: null, caseTitle: null });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const casesPerPage = 5;

  // Rating State
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingContext, setRatingContext] = useState(null);

  // Save active tab to session storage so we can navigate 'Back' properly
  useEffect(() => {
    sessionStorage.setItem('clientCaseActiveTab', activeTab);
  }, [activeTab]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab, categoryFilter]);

  const casesData = useSelector((state) => state.case?.cases || []);
  const casesLoading = useSelector((state) => state.case?.casesLoading);
  const casesError = useSelector((state) => state.case?.casesError);

  useEffect(() => {
    dispatch(fetchCases());
  }, [dispatch]);

  // Function to format case status for display purposes
  // Function to format case status for display purposes - moved inside useMemo to avoid dependency issues
  
  // Memoize the cases data to avoid unnecessary re-computations when the component re-renders
  const cases = useMemo(() => {
    // Function to format case status for display purposes
    const formatStatusMemo = (status) => {
      const map = {
        draft: t('cases.draft'),
        public: t('cases.public'),
        sent_to_lawyers: t('cases.sentToLawyers'),
        proposals_received: t('cases.proposalsReceived'),
        accepted: t('cases.accepted'),
        in_progress: t('cases.inProgress'),
        completed: t('cases.completed'),
        cancelled: t('cases.cancelled'),
        rejected: t('cases.rejected'),
      };
      return map[status] || status;
    };

    return (casesData || []).map((item) => {
      const createdDate = item.created_at
        ? new Date(item.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "-";

        // Normalize and format the case data for easier rendering in the UI
      return {
        id: item.id,
        title: item.case_title || t('dashboard.untitledCase'),
        category: item.case_category || t('cases.notSpecified'),
        status: formatStatusMemo(item.status),
        rawStatus: item.status, // Original status for logic
        lawyerName: item.lawyer_name || t('dashboard.noLawyerAssigned'),
        lawyerId: item.lawyer, // Raw lawyer ID from backend
        is_rated: item.is_rated, // Pre-calculated rating status
        createdDate,
        proposalCount: item.proposal_count || 0,
      };
    });
  }, [casesData, t]);

  //generating category options for dropdown filter based on unique categories present in cases data
  const categoryOptions = useMemo(() => {
    const categories = cases.map((item) => item.category).filter(Boolean);
    return [t('cases.allCategories'), ...Array.from(new Set(categories))];
  }, [cases, t]);

  // Filter tabs (updated)
  const filterTabs = useMemo(() => [
    t('cases.allCases'),
    t('cases.publicCases'),
    t('cases.proposals'),
    t('cases.sentToLawyers'),
    t('cases.accepted'),
    t('cases.inProgress'),
    t('cases.completed'),
  ], [t]);

  // Get status-specific styling
  const getStatusStyles = (status) => {
    const inProgress = t('cases.inProgress');
    const accepted = t('cases.accepted');
    const proposalsReceived = t('cases.proposalsReceived');
    const completed = t('cases.completed');
    const sentToLawyers = t('cases.sentToLawyers');
    const publicStatus = t('cases.public');
    const cancelled = t('cases.cancelled');
    const draft = t('cases.draft');
    const rejected = t('cases.rejected');
    
    switch (status) {
      case inProgress:
      case accepted:
        return "bg-blue-100 text-blue-700";
      case proposalsReceived:
      case publicStatus:
        return "bg-purple-100 text-purple-700";
      case completed:
        return "bg-green-100 text-green-700";
      case sentToLawyers:
        return "bg-yellow-100 text-yellow-700";
      case cancelled:
      case draft:
        return "bg-gray-100 text-gray-700";
      case rejected:
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Get actions based on current tab and case status
  const getActionsForCase = (caseItem) => {
    const actions = [];

    if (activeTab === t('cases.allCases')) {
      actions.push({
        icon: Eye,
        label: t('cases.viewCase'),
        color: "text-blue-600",
      });
    } else if (activeTab === t('cases.draft')) {
      actions.push({
        icon: Edit,
        label: t('common.edit'),
        color: "text-blue-600",
      });
      actions.push({
        icon: Send,
        label: t('cases.submit'),
        color: "text-green-600",
      });
      actions.push({
        icon: Trash2,
        label: t('cases.deleteCase'),
        color: "text-red-600",
      });
    } else if (activeTab === t('cases.sentToLawyers')) {
      actions.push({
        icon: Eye,
        label: t('cases.viewCase'),
        color: "text-blue-600",
      });
      actions.push({
        icon: AlertCircle,
        label: t('cases.withdraw'),
        color: "text-yellow-600",
      });
    } else if (activeTab === t('cases.publicCases')) {
      actions.push({
        icon: Eye,
        label: t('cases.viewCase'),
        color: "text-blue-600",
      });
      actions.push({
        icon: Edit,
        label: t('common.edit'),
        color: "text-green-600",
      });
      actions.push({
        icon: Trash2,
        label: t('cases.deleteCase'),
        color: "text-red-600",
      });
    } else if (activeTab === t('cases.proposals')) {
      actions.push({
        icon: Eye,
        label: t('cases.viewCase'),
        color: "text-blue-600",
      });
      if (caseItem.proposalCount > 0) {
        actions.push({
          icon: Briefcase,
          label: `${caseItem.proposalCount} ${caseItem.proposalCount > 1 ? t('cases.proposals') : t('cases.proposal')}`,
          color: "text-purple-600",
        });
      }
    } else if (activeTab === t('cases.accepted')) {
      actions.push({
        icon: Eye,
        label: t('cases.viewCase'),
        color: "text-blue-600",
      });
    } else if (activeTab === t('cases.inProgress')) {
      actions.push({
        icon: Eye,
        label: t('cases.viewCase'),
        color: "text-blue-600",
      });
    } else if (activeTab === t('cases.completed')) {
      actions.push({
        icon: Eye,
        label: t('cases.viewCase'),
        color: "text-blue-600",
      });
      if (caseItem.lawyerId) {
        actions.push({
          icon: Star,
          label: caseItem.is_rated ? "Rated" : "Rate Lawyer",
          color: caseItem.is_rated ? "text-amber-400" : "text-slate-300",
          isRated: caseItem.is_rated
        });
      }
    }

    return actions;
  };

  // Calculate summary stats
  const getTotalCases = () => cases.length;
  const getActiveCases = () =>
    cases.filter((c) => c.status === t('cases.inProgress') || c.status === t('cases.accepted'))
      .length;
  const getPublicCases = () =>
    cases.filter((c) => c.status === t('cases.public')).length;
  const getCompletedCases = () =>
    cases.filter((c) => c.status === t('cases.completed')).length;

  // Filter cases based on search and tab  
  const filteredCases = useMemo(() => {
    return cases.filter((caseItem) => {
      const matchesSearch =
        caseItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        caseItem.id.toString().includes(searchQuery);

      let matchesTab = false;

      if (activeTab === t('cases.allCases')) {
        matchesTab = true;
      } else if (activeTab === t('cases.draft')) {
        matchesTab = caseItem.status === t('cases.draft');
      } else if (activeTab === t('cases.publicCases')) {
        matchesTab = caseItem.status === t('cases.public');
      } else if (activeTab === t('cases.proposals')) {
        matchesTab =
          (caseItem.status === t('cases.public') || caseItem.status === t('cases.proposalsReceived')) &&
          caseItem.proposalCount > 0;
      } else if (activeTab === t('cases.sentToLawyers')) {
        matchesTab = caseItem.status === t('cases.sentToLawyers');
      } else if (activeTab === t('cases.accepted')) {
        matchesTab = caseItem.status === t('cases.accepted');
      } else if (activeTab === t('cases.inProgress')) {
        matchesTab = caseItem.status === t('cases.inProgress');
      } else if (activeTab === t('cases.completed')) {
        matchesTab = caseItem.status === t('cases.completed');
      }

      const matchesCategory =
        categoryFilter === t('cases.allCategories') ||
        caseItem.category === categoryFilter;

      return matchesSearch && matchesTab && matchesCategory;
    });
  }, [cases, searchQuery, activeTab, categoryFilter, t]);

  const totalPages = Math.ceil(filteredCases.length / casesPerPage);
  const paginatedCases = filteredCases.slice(
    (currentPage - 1) * casesPerPage,
    currentPage * casesPerPage
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* TOP HEADER */}
        <div className="sticky top-0 z-50 bg-white border-b border-slate-200">
          <DashHeader
            title={t('cases.myCases')}
            subtitle="Manage all your legal cases"
          />
        </div>

        {/* PAGE CONTENT */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-4 gap-6 mb-8">
              {/* Total Cases Card */}
              <div className="relative overflow-hidden rounded-2xl p-6 text-white shadow-lg bg-linear-to-br from-blue-500 to-blue-600 ring-1 ring-blue-500/20">
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
                <div className="absolute -right-2 -bottom-6 h-20 w-20 rounded-full bg-white/5" />
                <div className="relative z-10 flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-white/80">Total Cases</p>
                    <h3 className="text-2xl font-extrabold tracking-tight">{getTotalCases()}</h3>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-400/20">
                    <FileText size={20} />
                  </div>
                </div>
              </div>

              {/* Active Card */}
              <div className="relative overflow-hidden rounded-2xl p-6 text-white shadow-lg bg-linear-to-br from-violet-500 to-purple-600 ring-1 ring-violet-500/20">
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
                <div className="absolute -right-2 -bottom-6 h-20 w-20 rounded-full bg-white/5" />
                <div className="relative z-10 flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-white/80">Active</p>
                    <h3 className="text-2xl font-extrabold tracking-tight">{getActiveCases()}</h3>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-400/20">
                    <Briefcase size={20} />
                  </div>
                </div>
              </div>

              {/* Public Cases Card */}
              <div className="relative overflow-hidden rounded-2xl p-6 text-white shadow-lg bg-linear-to-br from-amber-500 to-orange-500 ring-1 ring-amber-500/20">
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
                <div className="absolute -right-2 -bottom-6 h-20 w-20 rounded-full bg-white/5" />
                <div className="relative z-10 flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-white/80">Public Cases</p>
                    <h3 className="text-2xl font-extrabold tracking-tight">{getPublicCases()}</h3>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/20">
                    <AlertCircle size={20} />
                  </div>
                </div>
              </div>

              {/* Completed Card */}
              <div className="relative overflow-hidden rounded-2xl p-6 text-white shadow-lg bg-linear-to-br from-emerald-500 to-emerald-600 ring-1 ring-emerald-500/20">
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
                <div className="absolute -right-2 -bottom-6 h-20 w-20 rounded-full bg-white/5" />
                <div className="relative z-10 flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-white/80">Completed</p>
                    <h3 className="text-2xl font-extrabold tracking-tight">{getCompletedCases()}</h3>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/20">
                    <CheckCircle size={20} />
                  </div>
                </div>
              </div>
            </div>

            {/* FILTER TABS */}
            <div className="bg-white border-b border-slate-200 mb-6 rounded-t-lg">
              <div className="flex overflow-x-auto">
                {filterTabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                      activeTab === tab
                        ? "border-[#0F1A3D] text-[#0F1A3D] bg-[#0F1A3D]/5"
                        : "border-transparent text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* SEARCH AND ACTIONS */}
            <div className="flex gap-4 mb-6">
              {/* Search Input */}
              <div className="flex-1 relative">
                <Search
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder={t('cases.searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 hover:border-[#0F1A3D] focus:outline-none focus:ring-2 focus:ring-[#0F1A3D]/20 focus:border-[#0F1A3D] transition-colors"
                />
              </div>

              {/* Category Dropdown */}
              <div className="relative min-w-[200px]">
                <div
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className={`flex items-center justify-between gap-2 px-4 py-3 bg-white border rounded-lg text-slate-700 hover:border-[#0F1A3D] focus:outline-none transition-colors cursor-pointer ${
                    isCategoryOpen ? 'border-[#0F1A3D] ring-2 ring-[#0F1A3D]/20' : 'border-slate-300'
                  }`}
                >
                  <span className="truncate">{categoryFilter}</span>
                  <ChevronDown size={18} className={`text-slate-500 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
                </div>
                
                {isCategoryOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsCategoryOpen(false)}
                    />
                    <div className="absolute top-full left-0 mt-2 w-full bg-white border border-slate-200 rounded-lg shadow-xl z-50 py-1 max-h-60 overflow-y-auto">
                      {categoryOptions.map((option) => (
                        <div
                          key={option}
                          onClick={() => {
                            setCategoryFilter(option);
                            setIsCategoryOpen(false);
                          }}
                          className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                            categoryFilter === option
                              ? 'bg-[#0F1A3D] text-white font-medium'
                              : 'text-slate-700 hover:bg-[#0F1A3D] hover:text-white'
                          }`}
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Create Case Button */}
              <button 
                onClick={() => navigate('/client/create-case')}
                className="px-6 py-3 bg-[#0F1A3D] text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
              >
                + Create Case
              </button>
            </div>

            {/* CASES TABLE */}
            <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">
                        ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">
                        Title
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">
                        Category
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">
                        Assigned Lawyer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">
                        Created
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wide">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {casesLoading ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center">
                          <p className="text-slate-500">Loading cases...</p>
                        </td>
                      </tr>
                    ) : casesError ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center">
                          <p className="text-red-600">{casesError}</p>
                        </td>
                      </tr>
                    ) : paginatedCases.length > 0 ? (
                      paginatedCases.map((caseItem, index) => (
                        <tr
                          key={index}
                          className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                            {caseItem.id}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-900 max-w-xs">
                            <div className="line-clamp-2">{caseItem.title}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-700">
                            {caseItem.category}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 inline-flex text-xs font-medium rounded ${getStatusStyles(
                                caseItem.status
                              )}`}
                            >
                              {caseItem.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-900">
                            {caseItem.lawyerName === "Not assigned" ? (
                              <span className="text-slate-500">
                                Not assigned
                              </span>
                            ) : (
                              caseItem.lawyerName
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-700">
                            {caseItem.createdDate}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {getActionsForCase(caseItem).map(
                                (action, actionIdx) => (
                                  <button
                                    key={actionIdx}
                                    onClick={() => {
                                      if (action.label === t('cases.viewCase') || action.label === "View Case") {
                                        navigate(`/client/case/${caseItem.id}`);
                                      } else if (action.label.includes(t('cases.proposals')) || action.label.includes(t('cases.proposal')) || action.label.includes("Proposal")) {
                                        navigate(`/client/case/${caseItem.id}/proposals`);
                                      } else if (action.label === t('cases.withdraw') || action.label === "Withdraw") {
                                        setWithdrawModal({ isOpen: true, caseId: caseItem.id, caseTitle: caseItem.title });
                                      } else if (action.label === t('common.edit') || action.label === "Edit") {
                                        navigate(`/client/edit-case/${caseItem.id}`);
                                      } else if (action.label === t('cases.deleteCase') || action.label === "Delete") {
                                        setDeleteConfirm({ isOpen: true, caseId: caseItem.id, caseTitle: caseItem.title });
                                      } else if (action.label === "Rate Lawyer" || action.label === "Rated") {
                                        if (caseItem.is_rated) return;
                                        setRatingContext({
                                          caseId: caseItem.id,
                                          lawyerId: caseItem.lawyerId,
                                          lawyerName: caseItem.lawyerName
                                        });
                                        setShowRatingModal(true);
                                      }
                                    }}
                                    className={
                                      action.icon === Eye 
                                        ? "px-4 py-1.5 bg-[#0F1A3D] text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition shadow-sm whitespace-nowrap" 
                                        : action.icon === Briefcase
                                        ? "px-4 py-1.5 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition shadow-sm whitespace-nowrap"
                                        : action.icon === Star 
                                        ? `p-2 rounded-lg transition-colors ${action.color} ${action.isRated ? 'cursor-default' : 'hover:bg-amber-50 hover:text-amber-400'}`
                                        : `p-2 rounded-lg hover:bg-slate-100 transition-colors ${action.color}`
                                    }
                                    title={action.label}
                                  >
                                    {action.icon === Eye ? (
                                      "View Case"
                                    ) : action.icon === Briefcase ? (
                                      `View Proposal (${caseItem.proposalCount})`
                                    ) : action.icon === Star ? (
                                      <Star size={20} fill={action.isRated ? "currentColor" : "none"} strokeWidth={1.5} />
                                    ) : (
                                      <action.icon size={20} strokeWidth={1.5} />
                                    )}
                                  </button>
                                )
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center">
                          <p className="text-slate-500">
                            No cases found matching your search.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={setCurrentPage} 
                itemsPerPage={casesPerPage} 
                totalItems={filteredCases.length} 
              />
            </div>
          </div>
        </div>

        {/* Withdraw Modal */}
        {withdrawModal.isOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Withdraw Case</h2>
                <p className="text-sm text-slate-600 mt-2">
                  <strong>{withdrawModal.caseTitle}</strong>
                </p>
              </div>

              <p className="text-sm text-slate-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                You can either delete this case or make it public for all lawyers to see. Which would you prefer?
              </p>

              <div className="space-y-3">
                <button
                  disabled={withdrawLoading}
                  onClick={() => handleWithdrawAction('public')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Lock size={16} />
                  {withdrawLoading ? 'Processing...' : 'Make Public'}
                </button>

                <button
                  disabled={withdrawLoading}
                  onClick={() => handleWithdrawAction('delete')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Trash2 size={16} />
                  {withdrawLoading ? 'Processing...' : 'Delete Case'}
                </button>
              </div>

              <button
                disabled={withdrawLoading}
                onClick={() => setWithdrawModal({ isOpen: false, caseId: null, caseTitle: null })}
                className="w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        {/* Delete Confirmation Modal */}
        {deleteConfirm.isOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Delete Case</h2>
                <p className="text-sm text-slate-600 mt-2">
                  Are you sure you want to delete <strong>{deleteConfirm.caseTitle}</strong>? This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  disabled={deleteLoading}
                  onClick={() => handleDeleteCase()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <Trash2 size={16} />
                  {deleteLoading ? 'Deleting...' : 'Delete'}
                </button>

                <button
                  disabled={deleteLoading}
                  onClick={() => setDeleteConfirm({ isOpen: false, caseId: null, caseTitle: null })}
                  className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors font-medium text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        <ToastContainer position="bottom-right" />
        
        {showRatingModal && ratingContext && (
          <RatingModal
            isOpen={showRatingModal}
            lawyerName={ratingContext.lawyerName}
            lawyerId={ratingContext.lawyerId}
            onClose={() => setShowRatingModal(false)}
            onSubmit={handleRatingSubmit}
          />
        )}
      </main>
    </div>
  );

  async function handleRatingSubmit(ratingData) {
    try {
      await createReview(
        ratingContext.lawyerId,
        ratingData.rating,
        ratingData.comment,
        null, // No title
        null, // consultationId
        ratingContext.caseId
      );
      
      toast.success("Thank you for your rating!");
      setShowRatingModal(false);
      setRatingContext(null);
      
      // Refresh case list to show the star as yellow
      dispatch(fetchCases());
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || "Failed to submit rating";
      toast.error(errorMessage);
      throw error;
    }
  }

  async function handleWithdrawAction(action) {
    setWithdrawLoading(true);
    try {
      if (action === 'delete') {
        await dispatch(deleteCase(withdrawModal.caseId));
      } else if (action === 'public') {
        await dispatch(updateCase({
          caseId: withdrawModal.caseId,
          data: { status: 'public' }
        }));
      }
      setWithdrawModal({ isOpen: false, caseId: null, caseTitle: null });
      dispatch(fetchCases());
    } catch (error) {
      alert('Error: ' + (error.message || 'Something went wrong'));
    } finally {
      setWithdrawLoading(false);
    }
  }

  async function handleDeleteCase() {
    setDeleteLoading(true);
    try {
      await dispatch(deleteCase(deleteConfirm.caseId));
      setDeleteConfirm({ isOpen: false, caseId: null, caseTitle: null });
      dispatch(fetchCases());
    } catch (error) {
      alert('Error: ' + (error.message || 'Something went wrong'));
    } finally {
      setDeleteLoading(false);
    }
  }
};

export default ClientCase;
