import React, { useState } from "react";
import { Search, Filter, MoreVertical, Calendar, FileText, Clock } from "lucide-react";
import Sidebar from "./Sidebar";
import LawyerDashHeader from "./LawyerDashHeader";
import StatCard from "./Statcard";
import { Briefcase } from "lucide-react";

const LawyerCase = () => {
  const [activeTab, setActiveTab] = useState("All Status");
  const [searchQuery, setSearchQuery] = useState("");
  const [caseTypeFilter, setCaseTypeFilter] = useState("All Types");

  // Mock case data
  const allCases = [
    {
      id: "CASE-2024-001",
      clientName: "Sita Sharma",
      clientPhone: "+977-9841234567",
      caseTitle: "Property Dispute - Kathmandu",
      lawType: "Property Law",
      nextDate: "Dec 18, 2024",
      documents: 12,
      timeAgo: "2 hours ago",
      location: "Kathmandu District Court",
      status: "In Progress",
      avatar: "S",
    },
    {
      id: "CASE-2024-002",
      clientName: "Hari Prasad",
      clientPhone: "+977-9851234567",
      caseTitle: "Contract Breach Case",
      lawType: "Corporate Law",
      nextDate: "Dec 20, 2024",
      documents: 8,
      timeAgo: "1 day ago",
      location: "Commercial Court, Kathmandu",
      status: "In Progress",
      avatar: "H",
    },
    {
      id: "CASE-2024-003",
      clientName: "Maya Devi",
      clientPhone: "+977-9861234567",
      caseTitle: "Family Settlement",
      priority: "low",
      lawType: "Family Law",
      nextDate: "Dec 25, 2024",
      documents: 5,
      timeAgo: "3 days ago",
      location: "Family Court, Lalitpur",
      status: "Pending",
      avatar: "M",
    },
    {
      id: "CASE-2024-004",
      clientName: "Ram Sharma",
      clientPhone: "+977-9841234568",
      caseTitle: "Land Dispute Case",
      priority: "medium",
      lawType: "Property Law",
      nextDate: "Dec 22, 2024",
      documents: 6,
      timeAgo: "5 hours ago",
      location: "District Court, Pokhara",
      status: "Pending",
      avatar: "R",
    },
    {
      id: "CASE-2024-005",
      clientName: "Binod Kumar",
      clientPhone: "+977-9841234570",
      caseTitle: "Business Contract Review",
      priority: "high",
      lawType: "Corporate Law",
      nextDate: "Dec 19, 2024",
      documents: 10,
      timeAgo: "4 hours ago",
      location: "Commercial Court, Kathmandu",
      status: "In Progress",
      avatar: "B",
    },
    {
      id: "CASE-2024-006",
      clientName: "Lakshmi Adhikari",
      clientPhone: "+977-9841234571",
      caseTitle: "Property Transfer Case",
      priority: "medium",
      lawType: "Property Law",
      nextDate: "Dec 21, 2024",
      documents: 8,
      timeAgo: "1 day ago",
      location: "District Court, Lalitpur",
      status: "In Progress",
      avatar: "L",
    },
    {
      id: "CASE-2024-007",
      clientName: "Sunita Thapa",
      clientPhone: "+977-9841234569",
      caseTitle: "Divorce Settlement",
      priority: "high",
      lawType: "Family Law",
      nextDate: "Jan 5, 2025",
      documents: 15,
      timeAgo: "1 month ago",
      location: "Family Court, Kathmandu",
      status: "Closed",
      avatar: "S",
    },
  ];

  // Filter cases based on active tab and case type
  let filteredCases = activeTab === "All Status" ? allCases : allCases.filter(caseItem => caseItem.status === activeTab);
  
  // Apply case type filter
  if (caseTypeFilter !== "All Types") {
    filteredCases = filteredCases.filter(caseItem => caseItem.lawType === caseTypeFilter);
  }
  
  const cases = filteredCases;

  const stats = [
    { title: "All Cases", value: "7", subtitle: null },
    { title: "In Progress", value: "4", subtitle: null },
    { title: "Pending", value: "2", subtitle: null },
    { title: "Closed", value: "1", subtitle: null },
  ];

  const tabs = ["All Status", "In Progress", "Pending", "Closed"];

 

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 ml-64">
        <LawyerDashHeader 
          title="My Cases" 
          subtitle="Welcome back, Adv. Ram Kumar" 
          notificationCount={3}
        />

        <div className="p-8">
          {/* Header with New Case Button */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-[#0F1A3D]">Case Management</h3>
              <p className="text-sm text-gray-500">Manage all your client cases</p>
            </div>
            <button className="bg-[#0F1A3D] text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-blue-950 transition flex items-center gap-2">
              <span className="text-lg">+</span>
              New Case
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl p-5 shadow-md">
                <h4 className="text-3xl font-bold text-center text-[#0F1A3D] mb-1">
                  {stat.value}
                </h4>
                <p className="text-sm text-gray-500 text-center">{stat.title}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 font-medium text-sm transition rounded-lg ${
                  activeTab === tab
                    ? "bg-white text-[#0F1A3D] shadow-md"
                    : "bg-white text-gray-600 hover:shadow-sm"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search & Filters */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search cases, clients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F1A3D] focus:border-transparent"
                />
              </div>
              <select 
                value={caseTypeFilter}
                onChange={(e) => setCaseTypeFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F1A3D] text-sm"
              >
                <option>All Types</option>
                <option>Property Law</option>
                <option>Corporate Law</option>
                <option>Family Law</option>
              </select>
            </div>
          </div>

          {/* Case List */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="divide-y">
              {cases.map((caseItem) => (
                <div key={caseItem.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-[#0F1A3D] text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                      {caseItem.avatar}
                    </div>

                    {/* Case Details */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            {caseItem.clientName}
                          </h4>
                          <p className="text-sm text-gray-500">{caseItem.clientPhone}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <h5 className="font-semibold text-[#0F1A3D]">{caseItem.caseTitle}</h5>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#0F1A3D] text-white">
                          {caseItem.lawType}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <span className="flex items-center gap-1">
                          <Briefcase size={14} />
                          {caseItem.id}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          Next: {caseItem.nextDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText size={14} />
                          {caseItem.documents} docs
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {caseItem.timeAgo}
                        </span>
                      </div>

                      <p className="text-sm text-gray-500">{caseItem.location}</p>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        caseItem.status === "In Progress" ? "bg-blue-100 text-blue-700" :
                        caseItem.status === "Pending" ? "bg-yellow-100 text-yellow-700" :
                        caseItem.status === "Closed" ? "bg-red-100 text-red-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {caseItem.status.toLowerCase()}
                      </span>
                      <button className="p-2 hover:bg-gray-200 rounded-lg transition">
                        <MoreVertical size={18} className="text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LawyerCase;