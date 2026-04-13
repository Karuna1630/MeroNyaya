import React, { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { fetchPublicCases } from "../slices/caseSlice";
import { fetchProposals, submitProposal, clearSubmitProposalStatus } from "../slices/proposalSlice";
import Sidebar from "./Sidebar";
import DashHeader from "./LawyerDashHeader";
import LawyerProposalForm from "./LawyerProposalForm";
import { LAW_CATEGORIES, URGENCY_LEVELS } from "../../utils/lawCategories";
import Pagination from "../../components/Pagination";
import { 
  Search, 
  MapPin, 
  Calendar, 
  FileText, 
  Star, 
  ChevronDown, 
  Send, 
  Eye, 
  X,
  Filter,
  CheckCircle2
} from "lucide-react";

const LawyerFindCases = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { publicCases, publicCasesLoading, publicCasesError } = useSelector((state) => state.case);
  const { proposals, submitProposalLoading, submitProposalSuccess, submitProposalError } = useSelector((state) => state.proposal);
  
  // Debug: Check authentication
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    console.log('Access Token:', token ? 'EXISTS' : 'MISSING');
    if (!token) {
      console.warn('⚠️ No access token found. User needs to login.');
    }
  }, []);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [showProposedViewModal, setShowProposedViewModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [selectedProposedCase, setSelectedProposedCase] = useState(null);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [activeTab, setActiveTab] = useState("public");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Handlers for search and filter changes, which also reset pagination to the first page when filters change
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (value) => {
    setCategoryFilter(value);
    setCurrentPage(1);
  };

  const handlePriorityChange = (value) => {
    setPriorityFilter(value);
    setCurrentPage(1);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  useEffect(() => {
    dispatch(fetchPublicCases());
    dispatch(fetchProposals());
  }, [dispatch]);

  // Handle successful proposal submission
  useEffect(() => {
    if (submitProposalSuccess) {
      dispatch(fetchPublicCases());
      dispatch(fetchProposals());
      dispatch(clearSubmitProposalStatus());
      setShowProposalModal(false);
    }
  }, [submitProposalSuccess, dispatch]);

  // Debug: Log the state
  useEffect(() => {
    console.log('Public Cases Data:', publicCases);
    console.log('Loading:', publicCasesLoading);
    console.log('Error:', publicCasesError);
  }, [publicCases, publicCasesLoading, publicCasesError]);

  // Filtering cases based on search term, category, and priority
  const filteredCases = useMemo(() => {
    if (!publicCases || publicCases.length === 0) return [];
    
    console.log('Filtering cases. Total:', publicCases.length);
    return publicCases.filter((item) => {
      // Robust status check: only exclude cases we are CERTAIN shouldn't be here
      const status = (item.status || "").toLowerCase();
      const isClosed = ["accepted", "closed", "rejected", "removed"].includes(status);
      
      if (isClosed) return false;

      const title = (item.case_title || "").toLowerCase();
      const desc = (item.case_description || "").toLowerCase();
      const search = searchTerm.toLowerCase();
      const matchesSearch = title.includes(search) || desc.includes(search);
      
      const categoryLabel = t('lawyerFindCases.filterByCategory');
      const matchesCategory = categoryFilter === categoryLabel || 
                             categoryFilter === "All Categories" || 
                             item.case_category === categoryFilter;
                             
      const matchesPriority = priorityFilter === "All" || item.urgency_level === priorityFilter;
      
      return matchesSearch && matchesCategory && matchesPriority;
    });
  }, [publicCases, searchTerm, categoryFilter, priorityFilter]);

  // handling proposal model open and close, and setting selected case for proposal submission
  const handleOpenProposal = (item) => {
    setSelectedCase(item);
    setShowProposedViewModal(false);
    setShowProposalModal(true);
  };

  // handliing viewing proposed cases, which can come from either the public case list or the proposals list
  const handleViewProposed = ({ caseData, proposal }) => {
    const fallbackCase = caseData || {
      case_title: proposal.case_title,
      case_category: proposal.case_category,
      case_description: "Case details are not available.",
      urgency_level: "Medium",
      created_at: proposal.created_at,
    };
    
    setSelectedProposedCase(fallbackCase);
    setSelectedProposal(proposal || null);
    setShowProposalModal(false);
    setShowProposedViewModal(true);
  };

  const submittedCaseIds = useMemo(() => {
    if (!proposals || proposals.length === 0) return new Set();
    return new Set(proposals.map((p) => p.case));
  }, [proposals]);

  const availableCases = useMemo(() => {
    return filteredCases.filter((item) => !submittedCaseIds.has(item.id));
  }, [filteredCases, submittedCaseIds]);

  const caseById = useMemo(() => {
    const map = new Map();
    (publicCases || []).forEach((item) => {
      if (item?.id !== undefined && item?.id !== null) {
        map.set(item.id, item);
      }
    });
    return map;
  }, [publicCases]);

  // cmbining proposal data with case data for proposed cases tab, 
  const proposedItems = useMemo(() => {
    const list = proposals || [];
    return list
      .map((proposal) => {
        const caseData = caseById.get(proposal.case) || null;
        return { proposal, caseData };
      })
      // filtering poposed cases based on category, priority and search term
      .filter(({ proposal, caseData }) => {
        const title = (caseData?.case_title || proposal.case_title || "").toLowerCase();
        const description = (caseData?.case_description || "").toLowerCase();
        const matchesSearch = title.includes(searchTerm.toLowerCase()) || description.includes(searchTerm.toLowerCase());
        const categoryValue = caseData?.case_category || proposal.case_category;
        const matchesCategory = categoryFilter === "All Categories" || categoryValue === categoryFilter;
        const urgencyValue = caseData?.urgency_level || null;
        const matchesPriority = priorityFilter === "All" || (urgencyValue && urgencyValue === priorityFilter);

        return matchesSearch && matchesCategory && matchesPriority;
      });
  }, [proposals, caseById, searchTerm, categoryFilter, priorityFilter]);

  // pagination logic for public cases tab, which calculates total pages and the cases to show on the current page based on the filtered and available cases
  const totalPublicPages = Math.ceil(availableCases.length / itemsPerPage) || 1;
  const pagedPublicCases = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return availableCases.slice(start, end);
  }, [availableCases, currentPage]);

  const showingCount = activeTab === "proposed" ? proposedItems.length : availableCases.length;

// function to get css classes for priority badge based on urgency level
  const getPriorityClasses = (priority) => {
    const upperPriority = (priority || "").toUpperCase();
    switch (upperPriority) {
      case "URGENT": return "bg-red-500 text-white shadow-sm";
      case "HIGH": return "bg-red-500 text-white shadow-sm";
      case "MEDIUM": return "bg-amber-100 text-amber-700 border border-amber-200";
      case "LOW": return "bg-[#0F1A3D]/10 text-[#0F1A3D] border border-[#0F1A3D]/20";
      default: return "bg-gray-100 text-gray-700";
    }
  };
// function to format date in a more readable format, used for displaying case posting date and proposal submission date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };  return (
    <div className="flex min-h-screen bg-gray-50/50 text-[#1A202C]">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        <DashHeader 
          title={t('lawyerFindCases.title')}
          subtitle={t('lawyerFindCases.subtitle')}
        />

        <main className="p-6 md:p-8 space-y-6">
          {/* Search & Filters Section */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder={t('lawyerFindCases.search')}
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0F1A3D]/20 focus:border-[#0F1A3D] outline-none transition-all text-sm"
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="relative">
                  <select 
                    className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 pr-10 text-sm font-medium outline-none focus:ring-2 focus:ring-[#0F1A3D]/20 focus:border-[#0F1A3D] cursor-pointer"
                    value={categoryFilter}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                  >
                    <option>{t('lawyerFindCases.filterByCategory')}</option>
                    {LAW_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>

                <div className="relative">
                  <select 
                    className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 pr-10 text-sm font-medium outline-none focus:ring-2 focus:ring-[#0F1A3D]/20 focus:border-[#0F1A3D] cursor-pointer"
                    value={priorityFilter}
                    onChange={(e) => handlePriorityChange(e.target.value)}
                  >
                    <option value="All">{t('lawyerFindCases.filterByPriority')}</option>
                    {URGENCY_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>
            </div>
            
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider px-1">
              {t('lawyerFindCases.showing')} <span className="text-[#0F1A3D]">{showingCount}</span> {showingCount === 1 ? "case" : t('lawyerFindCases.cases')}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex items-center">
            <div className="bg-gray-100 rounded-lg p-1 flex gap-1">
              <button
                onClick={() => handleTabChange("public")}
                className={`px-6 py-2 rounded-md text-sm font-semibold transition-all ${
                  activeTab === "public"
                    ? "bg-white text-[#0F1A3D] shadow-sm"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                }`}
              >
                {t('lawyerFindCases.publicTab')}
              </button>
              <button
                onClick={() => handleTabChange("proposed")}
                className={`px-6 py-2 rounded-md text-sm font-semibold transition-all ${
                  activeTab === "proposed"
                    ? "bg-white text-[#0F1A3D] shadow-sm"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                }`}
              >
                {t('lawyerFindCases.proposedTab')}
              </button>
            </div>
          </div>

          {/* Case List */}
          <div className="space-y-4 pb-12">
            {publicCasesLoading ? (
              <div className="bg-white py-24 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-gray-400 gap-4">
                <div className="w-10 h-10 border-2 border-[#0F1A3D] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-medium">{t('lawyerFindCases.loadingCases')}</p>
              </div>
            ) : publicCasesError ? (
              <div className="bg-white py-16 rounded-xl border border-red-50 flex flex-col items-center justify-center text-red-500 gap-4">
                <div className="text-center space-y-2">
                  <p className="font-bold">{t('lawyerFindCases.errorLoadingCases')}</p>
                  <p className="text-xs text-gray-500 max-w-xs mx-auto">{publicCasesError}</p>
                  <button 
                    onClick={() => dispatch(fetchPublicCases())}
                    className="mt-4 px-6 py-2 bg-[#0F1A3D] text-white rounded-lg text-sm font-bold hover:bg-[#0B1430] transition-all"
                  >
                    {t('lawyerFindCases.retry')}
                  </button>
                </div>
              </div>
            ) : activeTab === "public" ? (
              availableCases.length > 0 ? (
                pagedPublicCases.length > 0 ? (
                  pagedPublicCases.map((item) => (
                    <div key={item.id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row overflow-hidden group">
                      <div className="flex-1 p-6 space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 
                            onClick={() => navigate(`/lawyercase/${item.id}`)}
                            className="text-lg font-bold text-slate-800 group-hover:text-[#0F1A3D] cursor-pointer transition-colors"
                          >
                            {item.case_title}
                          </h2>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getPriorityClasses(item.urgency_level)}`}>
                            {item.urgency_level}
                          </span>
                          <span className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded text-[10px] font-bold uppercase tracking-wider border border-gray-100">
                             {item.case_category}
                          </span>
                        </div>

                        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
                          {item.case_description}
                        </p>

                        <div className="flex flex-wrap items-center gap-6 pt-2">
                          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                            <Calendar size={14} />
                            {formatDate(item.created_at)}
                          </div>
                          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                            <MapPin size={14} />
                            {item.location || t('cases.notSpecified')}
                          </div>
                          <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
                            <FileText size={14} />
                            {item.document_count || 0} {t('lawyerCaseDetail.files')}
                          </div>
                        </div>
                      </div>

                      <div className="w-full md:w-52 bg-slate-50/50 border-l border-gray-100 p-6 flex flex-col justify-center gap-2.5">
                        <button 
                          onClick={() => navigate(`/lawyercase/${item.id}`)}
                          className="w-full py-2.5 bg-white text-slate-700 border border-gray-200 rounded-lg text-xs font-bold hover:bg-white hover:border-[#0F1A3D] hover:text-[#0F1A3D] transition-all shadow-sm"
                        >
                          {t('lawyerFindCases.viewDetails')}
                        </button>
                        <button 
                          onClick={() => handleOpenProposal(item)}
                          className="w-full py-2.5 bg-[#0F1A3D] text-white rounded-lg text-xs font-bold hover:bg-[#0B1430] transition-all shadow-sm"
                        >
                          {t('lawyerFindCases.submitProposal')}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white py-20 rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 gap-3">
                    <FileText size={40} className="opacity-20" />
                    <p className="text-sm font-medium">{t('lawyerFindCases.noCasesFound')}</p>
                  </div>
                )
              ) : (
                <div className="bg-white py-24 rounded-xl border border-gray-100 flex flex-col items-center justify-center text-gray-400 gap-4">
                  <Search size={40} className="opacity-20" />
                  <div className="text-center">
                      <p className="text-lg font-bold text-slate-900">{t('lawyerFindCases.noCasesFound')}</p>
                      <p className="text-sm">Try adjusting your filters or search terms</p>
                  </div>
                </div>
              )
            ) : proposedItems.length > 0 ? (
              proposedItems.map(({ caseData, proposal }) => (
                    <div key={`proposal-${proposal.id}`} className="bg-white rounded-2xl border-2 border-gray-100 shadow-md hover:shadow-2xl hover:border-[#0F1A3D]/30 transition-all duration-300 overflow-hidden">
                      {/* Card Header with Status Badge */}
                      <div className="bg-gradient-to-r from-emerald-50 to-emerald-50/50 border-b-2 border-emerald-100 p-6">
                        <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                          <h2 
                            onClick={() => handleViewProposed({ caseData, proposal })}
                            className="text-xl font-bold text-[#0F1A3D] hover:text-emerald-600 cursor-pointer transition-colors line-clamp-2"
                          >
                            {caseData?.case_title || proposal.case_title}
                          </h2>
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-200">
                            <CheckCircle2 size={12} />
                            {t('lawyerFindCases.proposed')}
                          </div>
                        </div>
                        <span className="inline-block px-3 py-1 bg-[#0F1A3D]/10 text-[#0F1A3D] rounded-full text-[10px] font-bold uppercase tracking-wider border border-[#0F1A3D]/20">
                          {caseData?.case_category || proposal.case_category}
                        </span>
                      </div>

                      {/* Card Body */}
                      <div className="p-6 space-y-4">
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                          {caseData?.case_description || "Case details are not available."}
                        </p>

                        {/* Card Info */}
                        <div className="flex items-center gap-2 py-4 border-y border-gray-100">
                          <div className="p-2 rounded-lg bg-[#0F1A3D]/10">
                            <Calendar size={16} className="text-[#0F1A3D]" />
                          </div>
                          <div className="text-xs">
                            <p className="text-gray-400 font-semibold">Posted</p>
                            <p className="font-bold text-[#0F1A3D]">{formatDate(caseData?.created_at || proposal.created_at)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer with Actions */}
                      <div className="bg-gradient-to-r from-[#0F1A3D]/2 to-transparent p-6 flex flex-col sm:flex-row gap-3">
                        <button 
                          onClick={() => handleViewProposed({ caseData, proposal })}
                          className="flex-1 py-3 bg-white text-[#0F1A3D] border-2 border-[#0F1A3D] rounded-lg text-sm font-bold hover:bg-[#0F1A3D]/5 transition-all duration-200 flex items-center justify-center gap-2"
                        >
                          <Eye size={16} />
                          {t('lawyerFindCases.viewDetails')}
                        </button>
                        
                        {proposal.status === "rejected" ? (
                          <div className="flex-1 py-3 bg-red-50 text-red-600 rounded-lg text-sm font-bold text-center border-2 border-red-200 uppercase tracking-wider">
                            {t('lawyerFindCases.rejected')}
                          </div>
                        ) : proposal.status === "accepted" ? (
                          <div className="flex-1 py-3 bg-emerald-600 text-white rounded-lg text-sm font-bold text-center border-2 border-emerald-600 uppercase tracking-wider shadow-md">
                            {t('lawyerFindCases.accepted')}
                          </div>
                        ) : (
                          <div className="flex-1 py-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-bold text-center border-2 border-emerald-200 uppercase tracking-wider">
                            {t('lawyerFindCases.proposalSuccess')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
            ) : (
              <div className="bg-white py-20 rounded-xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 gap-3">
                <FileText size={40} className="opacity-20" />
                <p className="text-sm font-medium">{t('lawyerFindCases.noProposalsFound')}</p>
              </div>
            )}
            {activeTab === "public" && availableCases.length > 0 && (
              <div className="pt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPublicPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={availableCases.length}
                />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Proposal Form Modal */}
      <LawyerProposalForm
        isOpen={showProposalModal}
        onClose={() => setShowProposalModal(false)}
        caseData={selectedCase}
        onSubmit={(data) => {
          dispatch(submitProposal(data));
        }}
        isSubmitting={submitProposalLoading}
        error={submitProposalError}
      />

      {/* Proposed Case View Modal */}
      {showProposedViewModal && selectedProposedCase && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setShowProposedViewModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all">
            <div className="p-6 border-b border-gray-100 sticky top-0 bg-white z-10 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Case Details</h2>
                <p className="text-xs text-gray-500">Your proposal for this case</p>
              </div>
              <button
                onClick={() => setShowProposedViewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-bold text-gray-900">
                    {selectedProposedCase.case_title}
                  </h3>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${getPriorityClasses(selectedProposedCase.urgency_level)}`}>
                    {selectedProposedCase.urgency_level}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-6 bg-gray-50 p-4 rounded-xl">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Category</p>
                    <p className="text-sm font-semibold text-gray-700">
                      {selectedProposedCase.case_category || "General"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Posted Date</p>
                    <p className="text-sm font-semibold text-gray-700">
                      {formatDate(selectedProposedCase.created_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Files</p>
                    <p className="text-sm font-semibold text-gray-700">
                      {selectedProposedCase.document_count || selectedProposedCase.documents?.length || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-1">Status</p>
                    <p className="text-sm font-semibold text-gray-700 capitalize">
                      {selectedProposal?.status || "pending"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Description</p>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {selectedProposedCase.case_description}
                  </p>
                </div>

                <div className="space-y-2 pt-4 border-t border-gray-100">
                  <label className="text-sm font-bold text-gray-900">Your Proposal</label>
                  <div className="w-full p-4 bg-[#0F1A3D]/10 border border-[#0F1A3D]/20 rounded-xl text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                    {selectedProposal?.proposal_text || "No proposal text available."}
                  </div>
                </div>

                {selectedProposal?.client_feedback && (
                  <div className="space-y-2 pt-4 border-t border-gray-100">
                    <label className="text-sm font-bold text-gray-900">Client Feedback</label>
                    <div className="w-full p-4 bg-amber-50/50 border border-amber-100 rounded-xl text-sm text-amber-900 whitespace-pre-wrap leading-relaxed italic">
                      {selectedProposal.client_feedback}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => setShowProposedViewModal(false)}
                  className="px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-bold hover:bg-black transition-all shadow-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LawyerFindCases;
