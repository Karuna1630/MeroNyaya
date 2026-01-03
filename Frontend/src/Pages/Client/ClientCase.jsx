import React, { useState } from "react";
import { Search, FileText, ChevronRight, Filter, Calendar, User } from "lucide-react";
import Sidebar from "./sidebar";
import DashHeader from "./ClientDashHeader";

const ClientCase = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");

  // Sample case data - replace with actual API data
  const cases = [
    {
      id: "CASE-2025-001",
      status: "In Progress",
      title: "Property Dispute - Land Registration",
      category: "Property Law",
      lawyer: {
        name: "Advocate Priya Sharma",
        avatar: "",
      },
      createdDate: "Nov 20, 2025",
      nextHearing: "Dec 15, 2025",
    },
    {
      id: "CASE-2025-001",
      status: "In Progress",
      title: "Property Dispute - Land Registration",
      category: "Property Law",
      lawyer: {
        name: "Advocate Priya Sharma",
        avatar: "",
      },
      createdDate: "Nov 20, 2025",
      nextHearing: "Dec 15, 2025",
    },
    {
      id: "CASE-2025-001",
      status: "In Progress",
      title: "Property Dispute - Land Registration",
      category: "Property Law",
      lawyer: {
        name: "Advocate Priya Sharma",
        avatar: "",
      },
      createdDate: "Nov 20, 2025",
      nextHearing: "Dec 15, 2025",
    },
    {
      id: "CASE-2025-001",
      status: "In Progress",
      title: "Property Dispute - Land Registration",
      category: "Property Law",
      lawyer: {
        name: "Advocate Priya Sharma",
        avatar: "",
      },
      createdDate: "Nov 20, 2025",
      nextHearing: "Dec 15, 2025",
    },
    {
      id: "CASE-2025-001",
      status: "In Progress",
      title: "Property Dispute - Land Registration",
      category: "Property Law",
      lawyer: {
        name: "Advocate Priya Sharma",
        avatar: "",
      },
      createdDate: "Nov 20, 2025",
      nextHearing: "Dec 15, 2025",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "In Progress":
        return "bg-blue-100 text-blue-700";
      case "Completed":
        return "bg-green-100 text-green-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Closed":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
      
        {/* TOP HEADER */}
        <div className="sticky top-0 z-50 bg-white">
          <DashHeader
            title="My Cases"
            subtitle="Track and manage all your legal cases"
        />
        </div>

        {/* MAIN BODY CONTENT */}
        <div className="flex-1 p-8 overflow-y-auto">
          {/* Search and Filter */}
          <div className="flex gap-4 mb-8">
            <div className="flex-1 relative">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by case title or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none pl-4 pr-10 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer min-w-[160px]"
              >
                <option>All Status</option>
                <option>In Progress</option>
                <option>Completed</option>
                <option>Pending</option>
                <option>Closed</option>
              </select>
              <Filter
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                size={18}
              />
            </div>
          </div>

          {/* Case Cards */}
          <div className="space-y-4">
          {cases.map((caseItem, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              <div className="flex items-center gap-6">
                {/* Case Icon */}
                <div className="flex-shrink-0">
                  <div className="w-14 h-14 bg-blue-50 rounded-lg flex items-center justify-center">
                    <FileText className="text-blue-600" size={28} />
                  </div>
                </div>

                {/* Case Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-semibold text-yellow-600">
                      {caseItem.id}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        caseItem.status
                      )}`}
                    >
                      {caseItem.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {caseItem.title}
                  </h3>
                  <p className="text-sm text-gray-500">{caseItem.category}</p>
                </div>

                {/* Lawyer Info */}
                <div className="flex-shrink-0 flex items-center gap-3 px-6 border-l border-gray-200">
                  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <User size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {caseItem.lawyer.name}
                    </p>
                    <p className="text-xs text-gray-500">Assigned Lawyer</p>
                  </div>
                </div>

                {/* Dates */}
                <div className="flex-shrink-0 flex items-center gap-8 px-6 border-l border-gray-200">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar size={14} className="text-gray-400" />
                      <p className="text-xs text-gray-500">Created</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {caseItem.createdDate}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar size={14} className="text-gray-400" />
                      <p className="text-xs text-gray-500">Next Hearing</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {caseItem.nextHearing}
                    </p>
                  </div>
                </div>

                {/* Action Button */}
                <button className="flex-shrink-0 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition">
                  <ChevronRight size={20} className="text-gray-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
        </div>
      </main>
    </div>
  );
};

export default ClientCase;
