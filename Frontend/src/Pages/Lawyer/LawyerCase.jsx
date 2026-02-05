import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Eye, Calendar, FileText, Clock, AlertCircle, CheckCircle } from "lucide-react";
import Sidebar from "./Sidebar";
import LawyerDashHeader from "./LawyerDashHeader";
import StatCard from "./Statcard";
import { Briefcase } from "lucide-react";
import { fetchCases } from "../slices/caseSlice";

const LawyerCase = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cases, casesLoading, casesError } = useSelector((state) => state.case);
  const [activeTab, setActiveTab] = useState("Active");
  const [searchQuery, setSearchQuery] = useState("");
  const [caseTypeFilter, setCaseTypeFilter] = useState("All Categories");

  useEffect(() => {
    dispatch(fetchCases());
  }, [dispatch]);

  // Filter to show only cases where the lawyer is assigned (accepted cases)
  const myCases = useMemo(() => {
    return Array.isArray(cases) ? cases.filter(caseItem => caseItem.lawyer !== null) : [];
  }, [cases]);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Get relative time (e.g., "2 hours ago")
  const getRelativeTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // difference in seconds

    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  // Filter cases based on active tab and search
  const filteredCases = useMemo(() => {
    let filtered = myCases;

    // Status filter (Tabs)
    if (activeTab === "Active") {
      filtered = filtered.filter(caseItem => caseItem.status !== "completed");
    } else if (activeTab === "Completed") {
      filtered = filtered.filter(caseItem => caseItem.status === "completed");
    }

    // Case type filter
    if (caseTypeFilter !== "All Categories") {
      filtered = filtered.filter(caseItem => caseItem.case_category === caseTypeFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(caseItem =>
        (caseItem.case_title || '').toLowerCase().includes(query) ||
        (caseItem.client_name || '').toLowerCase().includes(query) ||
        (caseItem.case_category || '').toLowerCase().includes(query) ||
        (caseItem.id || '').toString().includes(query)
      );
    }

    return filtered;
  }, [myCases, activeTab, caseTypeFilter, searchQuery]);

  // Calculate stats
  const stats = useMemo(() => {
    const active = myCases.filter(c => c.status !== 'completed').length;
    const completed = myCases.filter(c => c.status === 'completed').length;
    const hearings = active > 0 ? 1 : 0;
    const pendingPayments = active > 1 ? 2 : 0;

    return [
      { icon: <Briefcase size={20} />, title: "Active Cases", value: active, subtitle: "Assigned to you" },
      { icon: <Calendar size={20} />, title: "Hearings Scheduled", value: hearings, subtitle: "Upcoming" },
      { icon: <Clock size={20} />, title: "Pending Payments", value: pendingPayments, subtitle: "Awaiting" },
      { icon: <CheckCircle size={20} />, title: "Completed", value: completed, subtitle: "Closed cases" },
    ];
  }, [myCases]);

  const tabs = ["Active", "Completed"];

  const getDisplayStatus = (status) => {
    const statusMap = {
      'completed': 'Completed',
      'in_progress': 'In Progress',
      'accepted': 'Accepted',
      'sent_to_lawyers': 'Sent to Lawyers',
      'public': 'Public',
    };
    return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getDisplayStatusStyle = (status) => {
    const styles = {
      'completed': 'bg-green-50 text-green-600 border border-green-100',
      'in_progress': 'bg-amber-50 text-amber-600 border border-amber-100',
      'accepted': 'bg-blue-50 text-blue-600 border border-blue-100',
      'sent_to_lawyers': 'bg-purple-50 text-purple-600 border border-purple-100',
      'public': 'bg-gray-50 text-gray-600 border border-gray-100',
    };
    return styles[status] || 'bg-blue-50 text-blue-600 border border-blue-100';
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />

      <div className="flex-1 ml-64">
        <LawyerDashHeader 
          title="Assigned Cases" 
          subtitle="Welcome back, Adv. Ram Kumar" 
          notificationCount={3}
        />

        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <StatCard
                key={index}
                icon={stat.icon}
                title={stat.title}
                value={stat.value}
                subtitle={stat.subtitle}
              />
            ))}
          </div>

          {/* Tabs & Search Header */}
          <div className="space-y-6 mb-6">
            <div className="flex gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 font-semibold text-sm transition rounded-full ${
                    activeTab === tab
                      ? "bg-white text-[#0F1A3D] shadow-sm border border-gray-200"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search cases, clients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                />
              </div>
              <div className="relative min-w-[200px]">
                <select 
                  value={caseTypeFilter}
                  onChange={(e) => setCaseTypeFilter(e.target.value)}
                  className="w-full appearance-none px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm text-sm font-medium text-gray-700 cursor-pointer"
                >
                  <option>All Categories</option>
                  <option>Property Law</option>
                  <option>Corporate Law</option>
                  <option>Family Law</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <Filter size={16} className="text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {casesLoading ? (
              <div className="py-20 flex flex-col items-center justify-center text-gray-500 gap-4">
                <div className="w-12 h-12 border-4 border-[#0F1A3D] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-medium">Loading cases...</p>
              </div>
            ) : casesError ? (
              <div className="py-20 flex flex-col items-center justify-center text-red-500 gap-4">
                <AlertCircle size={48} className="text-red-300" />
                <p className="text-lg font-medium">{casesError}</p>
                <button
                  onClick={() => dispatch(fetchCases())}
                  className="px-6 py-2 bg-[#0F1A3D] text-white rounded-xl text-sm font-semibold hover:bg-black transition-all"
                >
                  Retry
                </button>
              </div>
            ) : filteredCases.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-gray-500 gap-4">
                <AlertCircle size={48} className="text-gray-200" />
                <div className="text-center">
                  <p className="text-lg font-semibold text-gray-900">No cases found</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {myCases.length === 0 
                      ? "You haven't been assigned any cases yet." 
                      : "Try adjusting your search or filters."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Case ID</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Client</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Last Updated</th>
                      <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredCases.map((caseItem) => (
                      <tr key={caseItem.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900">CASE-2024-{caseItem.id.toString().padStart(3, '0')}</span>
                            <span className="text-xs text-gray-500 mt-0.5 line-clamp-1">{caseItem.case_title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {caseItem.client_profile_image ? (
                              <img 
                                src={caseItem.client_profile_image} 
                                alt=""
                                className="w-8 h-8 rounded-full object-cover ring-2 ring-gray-100"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                                {getInitials(caseItem.client_name)}
                              </div>
                            )}
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-gray-900">{caseItem.client_name}</span>
                              <span className="text-xs text-gray-500">+977-{caseItem.contact_number || '9841234567'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600 font-medium">{caseItem.case_category}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold inline-block ${getDisplayStatusStyle(caseItem.status)}`}>
                            {getDisplayStatus(caseItem.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-500 font-medium">{getRelativeTime(caseItem.updated_at || caseItem.created_at)}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => navigate(`/lawyercase/${caseItem.id}`)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-900"
                          >
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


export default LawyerCase;