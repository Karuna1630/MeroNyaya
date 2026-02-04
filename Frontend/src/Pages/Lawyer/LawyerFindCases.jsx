import React, { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
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
  const dispatch = useDispatch();
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
  const [selectedCase, setSelectedCase] = useState(null);
  const [activeTab, setActiveTab] = useState("public");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
    }
  }, [submitProposalSuccess, dispatch]);

  // Debug: Log the state
  useEffect(() => {
    console.log('Public Cases Data:', publicCases);
    console.log('Loading:', publicCasesLoading);
    console.log('Error:', publicCasesError);
  }, [publicCases, publicCasesLoading, publicCasesError]);

  // Filtering Logic
  const filteredCases = useMemo(() => {
    if (!publicCases || publicCases.length === 0) return [];
    
    return publicCases.filter((item) => {
      const matchesSearch = (item.case_title || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (item.case_description || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "All Categories" || item.case_category === categoryFilter;
      const matchesPriority = priorityFilter === "All" || item.urgency_level === priorityFilter;
      
      return matchesSearch && matchesCategory && matchesPriority;
    });
  }, [publicCases, searchTerm, categoryFilter, priorityFilter]);

  const handleOpenProposal = (item) => {
    setSelectedCase(item);
    setShowProposalModal(true);
  };

  const submittedCaseIds = useMemo(() => {
    if (!proposals || proposals.length === 0) return new Set();
    return new Set(proposals.map((p) => p.case));
  }, [proposals]);

  const availableCases = useMemo(() => {
    return filteredCases.filter((item) => !submittedCaseIds.has(item.id));
  }, [filteredCases, submittedCaseIds]);

  const proposedCases = useMemo(() => {
    return filteredCases.filter((item) => submittedCaseIds.has(item.id));
  }, [filteredCases, submittedCaseIds]);

  const totalPublicPages = Math.ceil(availableCases.length / itemsPerPage) || 1;
  const pagedPublicCases = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return availableCases.slice(start, end);
  }, [availableCases, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, priorityFilter, activeTab]);

  const getPriorityClasses = (priority) => {
    const upperPriority = (priority || "").toUpperCase();
    switch (upperPriority) {
      case "URGENT": return "bg-red-500 text-white shadow-sm";
      case "HIGH": return "bg-red-500 text-white shadow-sm";
      case "MEDIUM": return "bg-amber-100 text-amber-700 border border-amber-200";
      case "LOW": return "bg-blue-100 text-blue-700 border border-blue-200";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="flex min-h-screen bg-gray-50/50 text-[#0F1A3D]">
      <Sidebar />
      
      <div className="flex-1 ml-64">
        <DashHeader 
          title="Find Cases" 
          subtitle="Browse publicly posted cases and submit your proposals" 
        />

        <main className="p-8 space-y-6">
          {/* Search & Filters Section */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-75 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text" 
                  placeholder="Search cases by title, description, keywords..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="relative group">
                  <select 
                    className="appearance-none bg-gray-50 border border-gray-200 rounded-xl px-5 py-3 pr-10 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option>All Categories</option>
                    {LAW_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>

                <div className="relative group">
                  <select 
                    className="appearance-none bg-gray-50 border border-gray-200 rounded-xl px-5 py-3 pr-10 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                  >
                    <option value="All">All Priorities</option>
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
            
            <p className="text-sm font-medium text-gray-500">
              Showing <span className="text-[#0F1A3D] font-bold">{filteredCases.length}</span> cases
              <span className="mx-2 text-gray-300">•</span>
              <span className="text-[#0F1A3D] font-bold">{availableCases.length}</span> public
              <span className="mx-2 text-gray-300">•</span>
              <span className="text-[#0F1A3D] font-bold">{proposedCases.length}</span> proposed
            </p>
          </div>

          {/* Tabs */}
          <div className="flex items-center justify-center">
            <div className="bg-gray-100 rounded-full p-1 inline-flex gap-1">
              <button
                onClick={() => setActiveTab("public")}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeTab === "public"
                    ? "bg-white text-[#0F1A3D] shadow"
                    : "text-gray-500 hover:text-[#0F1A3D]"
                }`}
              >
                Public
              </button>
              <button
                onClick={() => setActiveTab("proposed")}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeTab === "proposed"
                    ? "bg-white text-[#0F1A3D] shadow"
                    : "text-gray-500 hover:text-[#0F1A3D]"
                }`}
              >
                Proposed
              </button>
            </div>
          </div>

          {/* Case List */}
          <div className="space-y-6 pb-8">
            {publicCasesLoading ? (
              <div className="bg-white py-24 rounded-3xl border border-gray-100 flex flex-col items-center justify-center text-gray-500 gap-4">
                <div className="w-12 h-12 border-4 border-[#0F1A3D] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-medium">Loading public cases...</p>
              </div>
            ) : publicCasesError ? (
              <div className="bg-white py-24 rounded-3xl border border-red-200 flex flex-col items-center justify-center text-red-500 gap-4">
                <div className="text-center space-y-2">
                  <p className="text-xl font-bold">Error Loading Cases</p>
                  <p className="text-sm">{publicCasesError}</p>
                  <button 
                    onClick={() => dispatch(fetchPublicCases())}
                    className="mt-4 px-6 py-2 bg-[#0F1A3D] text-white rounded-xl text-sm font-bold hover:bg-black transition-colors"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : filteredCases.length > 0 ? (
              activeTab === "public" ? (
                pagedPublicCases.length > 0 ? (
                  pagedPublicCases.map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-gray-200 transition-all duration-200 flex flex-col md:flex-row overflow-hidden">
                      <div className="flex-1 p-6 space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-xl font-bold text-[#0F1A3D] uppercase tracking-tight">{item.case_title}</h2>
                          <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase ${getPriorityClasses(item.urgency_level)}`}>
                            {item.urgency_level}
                          </span>
                          <div className="flex gap-2">
                            <span className="px-3 py-1 bg-[#0F1A3D] text-white rounded text-[10px] font-semibold uppercase tracking-wider">{item.case_category}</span>
                            {item.location && (
                              <span className="flex items-center gap-1 text-[11px] font-bold text-gray-500 uppercase">
                                <MapPin size={14} />
                                {item.location}
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 max-w-4xl">
                          {item.case_description}
                        </p>

                        <div className="flex flex-wrap items-center gap-6 pt-2">
                          <div className="flex items-center gap-2 text-[12px] font-bold text-gray-500 uppercase">
                            <Calendar size={16} className="text-gray-400" />
                            Posted: {formatDate(item.created_at)}
                          </div>
                          <div className="flex items-center gap-2 text-[12px] font-bold text-gray-500 uppercase">
                            <FileText size={16} className="text-gray-400" />
                            {item.document_count || 0} documents
                          </div>
                        </div>
                      </div>

                      <div className="w-full md:w-64 bg-gray-50/50 border-l border-gray-100 p-6 flex flex-col justify-center items-center gap-3">
                        <button 
                          onClick={() => handleOpenProposal(item)}
                          className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#0F1A3D] text-white rounded-xl text-xs font-bold hover:bg-black transition-colors shadow-sm"
                        >
                          <Send size={16} />
                          Send Proposal
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white py-10 rounded-2xl border border-dashed border-gray-200 text-center text-sm text-gray-500">
                    No public cases available with current filters.
                  </div>
                )
              ) : (
                proposedCases.length > 0 ? (
                  proposedCases.map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-gray-200 transition-all duration-200 flex flex-col md:flex-row overflow-hidden">
                      <div className="flex-1 p-6 space-y-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-xl font-bold text-[#0F1A3D] uppercase tracking-tight">{item.case_title}</h2>
                          <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold uppercase ${getPriorityClasses(item.urgency_level)}`}>
                            {item.urgency_level}
                          </span>
                          <div className="flex gap-2">
                            <span className="px-3 py-1 bg-[#0F1A3D] text-white rounded text-[10px] font-semibold uppercase tracking-wider">{item.case_category}</span>
                            {item.location && (
                              <span className="flex items-center gap-1 text-[11px] font-bold text-gray-500 uppercase">
                                <MapPin size={14} />
                                {item.location}
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 max-w-4xl">
                          {item.case_description}
                        </p>

                        <div className="flex flex-wrap items-center gap-6 pt-2">
                          <div className="flex items-center gap-2 text-[12px] font-bold text-gray-500 uppercase">
                            <Calendar size={16} className="text-gray-400" />
                            Posted: {formatDate(item.created_at)}
                          </div>
                          <div className="flex items-center gap-2 text-[12px] font-bold text-gray-500 uppercase">
                            <FileText size={16} className="text-gray-400" />
                            {item.document_count || 0} documents
                          </div>
                        </div>
                      </div>

                      <div className="w-full md:w-64 bg-gray-50/50 border-l border-gray-100 p-6 flex flex-col justify-center items-center gap-3">
                        <div className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-50 text-green-700 rounded-xl text-xs font-bold border border-green-200">
                          <CheckCircle2 size={16} />
                          Proposal Sent
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white py-10 rounded-2xl border border-dashed border-gray-200 text-center text-sm text-gray-500">
                    No proposed cases yet.
                  </div>
                )
              )
            ) : (
              <div className="bg-white py-24 rounded-3xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-500 gap-4">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
                    <Search size={40} className="text-gray-200" />
                </div>
                <div className="text-center space-y-1">
                    <p className="text-xl font-bold text-[#0F1A3D]">No cases found</p>
                    <p className="text-sm">Try adjusting your filters or search terms</p>
                </div>
              </div>
            )}
            {activeTab === "public" && availableCases.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPublicPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={availableCases.length}
              />
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
          setShowProposalModal(false);
        }}
        isSubmitting={submitProposalLoading}
        error={submitProposalError}
      />
    </div>
  );
};

export default LawyerFindCases;
