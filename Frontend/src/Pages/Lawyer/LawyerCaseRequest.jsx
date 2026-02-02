import React, { useState } from "react";
import Sidebar from "./Sidebar";
import DashHeader from "./LawyerDashHeader";
import { 
  Eye, 
  Check, 
  X, 
  Clock, 
  MapPin, 
  Video, 
  FileText, 
  Calendar, 
  Phone,
  AlertCircle,
  TrendingDown,
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
  const [activeTab, setActiveTab] = useState("Pending");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);

  // Mock Data - Representing the structure of case requests
  const [caseRequests, setCaseRequests] = useState([
    {
      id: 1,
      clientName: "Sita Sharma",
      clientPhone: "+977-9841234567",
      receivedDate: "Dec 10, 2025",
      title: "Property Dispute – Land Registration",
      category: "Property Law",
      priority: "High",
      description: "Need legal assistance for a land registration dispute in Kathmandu. The property was inherited but facing claims from relatives.",
      budget: "Rs. 50,000 - 75,000",
      deadline: "Dec 20, 2025",
      documentsCount: 4,
      consultationType: "In-Person",
      status: "Pending",
      image: "https://i.pravatar.cc/150?u=sita"
    },
    {
      id: 2,
      clientName: "Hari Prasad",
      clientPhone: "+977-9851234567",
      receivedDate: "Dec 11, 2025",
      title: "Contract Breach – Business Partner",
      category: "Corporate Law",
      priority: "Medium",
      description: "My business partner has breached our partnership agreement. Need to recover damages and protect my business interests.",
      budget: "Rs. 30,000 - 50,000",
      deadline: "Dec 25, 2025",
      documentsCount: 2,
      consultationType: "Video Call",
      status: "Pending",
      image: "https://i.pravatar.cc/150?u=hari"
    },
    {
      id: 3,
      clientName: "Ram Bahadur",
      clientPhone: "+977-9801234567",
      receivedDate: "Dec 08, 2025",
      title: "Unfair Dismissal – Labor Court",
      category: "Labor Law",
      priority: "Low",
      description: "I was dismissed from my job without proper notice or cause. Seeking legal advice on filing a case in the labor court.",
      budget: "Rs. 20,000 - 35,000",
      deadline: "Dec 15, 2025",
      documentsCount: 1,
      consultationType: "In-Person",
      status: "Accepted",
      image: "https://i.pravatar.cc/150?u=ram"
    },
    {
      id: 4,
      clientName: "Gita Devi",
      clientPhone: "+977-9811234567",
      receivedDate: "Dec 05, 2025",
      title: "Divorce & Child Custody",
      category: "Family Law",
      priority: "High",
      description: "Seeking legal representation for divorce and child custody proceedings. Urgent attention required for safety concerns.",
      budget: "Rs. 100,000 - 150,000",
      deadline: "Dec 12, 2025",
      documentsCount: 6,
      consultationType: "Video Call",
      status: "Rejected",
      image: "https://i.pravatar.cc/150?u=gita"
    }
  ]);

  // Summary statistics for the top cards
  const stats = [
    { label: "Pending", count: caseRequests.filter(c => c.status === "Pending").length, color: "text-orange-500", bg: "bg-orange-50" },
    { label: "Urgent", count: caseRequests.filter(c => c.priority === "High" && c.status === "Pending").length, color: "text-red-500", bg: "bg-red-50" },
    { label: "Accepted", count: caseRequests.filter(c => c.status === "Accepted").length, color: "text-green-500", bg: "bg-green-50" },
    { label: "Rejected", count: caseRequests.filter(c => c.status === "Rejected").length, color: "text-gray-500", bg: "bg-gray-50" }
  ];

  const handleAccept = (id) => {
    setCaseRequests(caseRequests.map(c => c.id === id ? { ...c, status: "Accepted" } : c));
  };

  const handleReject = (id) => {
    setSelectedCase(id);
    setShowRejectModal(true);
  };

  const confirmReject = () => {
    setCaseRequests(caseRequests.map(c => c.id === selectedCase ? { ...c, status: "Rejected" } : c));
    setShowRejectModal(false);
  };

  const filteredCases = caseRequests.filter(c => c.status === activeTab);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High": return "bg-red-100 text-red-600 border border-red-200";
      case "Medium": return "bg-yellow-100 text-yellow-600 border border-yellow-200";
      case "Low": return "bg-blue-100 text-blue-600 border border-blue-200";
      default: return "bg-gray-100 text-gray-600";
    }
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
            {filteredCases.length > 0 ? (
              filteredCases.map((item) => (
                <div key={item.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col xl:flex-row gap-6 hover:shadow-md transition-shadow">
                  {/* Client Information Column */}
                  <div className="w-full xl:w-48 flex flex-row xl:flex-col items-center gap-4 xl:gap-3 xl:border-r border-gray-100 xl:pr-6">
                    <img 
                      src={item.image} 
                      alt={item.clientName} 
                      className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-50"
                    />
                    <div className="text-left xl:text-center flex-1">
                      <h3 className="font-bold text-gray-900 leading-tight">{item.clientName}</h3>
                      <p className="text-xs text-gray-500 mt-1 flex items-center xl:justify-center gap-1">
                        <Phone size={12} />
                        {item.clientPhone}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-2">Received: {item.receivedDate}</p>
                    </div>
                  </div>

                  {/* Case Details Middle Column */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-xl font-bold text-[#0F1A3D]">{item.title}</h2>
                          <div className="flex gap-2">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getPriorityColor(item.priority)}`}>
                              {item.priority} priority
                            </span>
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                              {activeTab}
                            </span>
                          </div>
                        </div>
                        <span className="inline-block bg-[#0F1A3D] text-white px-3 py-1 rounded text-[11px] font-semibold mt-1">
                          {item.category}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed max-w-3xl">
                      {item.description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="font-bold text-gray-900">Rs.</span>
                        {item.budget}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={18} className="text-gray-400" />
                        <span className="font-medium whitespace-nowrap">Deadline: {item.deadline}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FileText size={18} className="text-gray-400" />
                        {item.documentsCount} documents
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        {item.consultationType === "In-Person" ? <MapPin size={18} className="text-gray-400" /> : <Video size={18} className="text-gray-400" />}
                        {item.consultationType}
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