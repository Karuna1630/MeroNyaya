import React, { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPublicCases } from "../slices/caseSlice";
import Sidebar from "./Sidebar";
import DashHeader from "./LawyerDashHeader";
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
  const [proposalSent, setProposalSent] = useState(false);

  useEffect(() => {
    dispatch(fetchPublicCases());
  }, [dispatch]);

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
    setProposalSent(false);
  };

  const submitProposal = (e) => {
    e.preventDefault();
    setProposalSent(true);
    // In a real app, this would be an API call to send proposal
    setTimeout(() => {
      setShowProposalModal(false);
      // Optionally refresh the public cases list
      dispatch(fetchPublicCases());
    }, 1500);
  };

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
                    <option>Property Law</option>
                    <option>Insurance Law</option>
                    <option>Labor Law</option>
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
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
              </div>
            </div>
            
            <p className="text-sm font-medium text-gray-500">
              Showing <span className="text-[#0F1A3D] font-bold">{filteredCases.length}</span> public cases
            </p>
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
              filteredCases.map((item) => (
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
                    <div className="flex flex-col gap-3 w-full">
                      <button className="flex items-center justify-center gap-2 w-full py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-xs">
                        <Eye size={18} />
                        View Details
                      </button>
                      <button 
                        onClick={() => handleOpenProposal(item)}
                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#0F1A3D] text-white rounded-xl text-xs font-bold hover:bg-black transition-colors shadow-sm"
                      >
                        <Send size={16} />
                        Send Proposal
                      </button>
                    </div>
                  </div>
                </div>
              ))
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
          </div>
        </main>
      </div>

      {/* Send Proposal Modal */}
      {showProposalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {proposalSent ? (
              <div className="p-12 flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center animate-bounce">
                  <CheckCircle2 size={48} />
                </div>
                <div className="space-y-2">
                    <h2 className="text-3xl font-bold text-[#0F1A3D]">Proposal Sent Successfully!</h2>
                    <p className="text-gray-500">Your proposal for "{selectedCase?.case_title}" has been sent to the client. You'll be notified if they accept.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold text-[#0F1A3D]">Submit Proposal</h2>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Case: {selectedCase?.case_title}</p>
                  </div>
                  <button 
                    onClick={() => setShowProposalModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={24} className="text-gray-400" />
                  </button>
                </div>

                <form onSubmit={submitProposal} className="p-8 space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Proposal Message</label>
                    <textarea 
                      required
                      placeholder="Why should the client hire you? Highlight your relevant experience..."
                      className="w-full h-40 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm resize-none"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Your Fee (NPR)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">Rs.</span>
                        <input 
                          type="number" 
                          required
                          placeholder="e.g. 45000"
                          className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">Consultation Type</label>
                      <div className="relative">
                        <select className="w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-10 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                          <option>Video Call</option>
                          <option>In-Person Meeting</option>
                          <option>Phone Call</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-4">
                    <button 
                      type="button"
                      onClick={() => setShowProposalModal(false)}
                      className="flex-1 py-3.5 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all text-sm"
                    >
                      Discard
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-3.5 bg-[#0F1A3D] text-white rounded-xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2 text-sm shadow-md"
                    >
                      <Send size={18} />
                      Submit Proposal
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LawyerFindCases;
