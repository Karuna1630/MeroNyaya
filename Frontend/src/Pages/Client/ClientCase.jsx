import React, { useState } from "react";
import {
  Search,
  ChevronDown,
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

const ClientCase = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All Cases");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [expandedCase, setExpandedCase] = useState(null);

  // Sample case data - replace with actual API data
  const cases = [
    {
      id: 1,
      title: "Property Dispute - Land Registration",
      category: "Property Law",
      status: "In Progress",
      lawyer: "Advocate Priya Sharma",
      createdDate: "Nov 20, 2025",
      proposalCount: 0,
    },
    {
      id: 2,
      title: "Divorce Proceedings",
      category: "Family Law",
      status: "Accepted",
      lawyer: "Advocate Sita Karki",
      createdDate: "Nov 28, 2025",
      proposalCount: 0,
    },
    {
      id: 3,
      title: "Business Contract Review",
      category: "Corporate Law",
      status: "Completed",
      lawyer: "Advocate Rajesh Thapa",
      createdDate: "Nov 1, 2025",
      proposalCount: 0,
    },
    {
      id: 4,
      title: "Employment Dispute - Wrongful Termination",
      category: "Labor Law",
      status: "Sent to Lawyers",
      lawyer: "Not assigned",
      createdDate: "Dec 5, 2025",
      proposalCount: 0,
    },
    {
      id: 5,
      title: "Insurance Claim Dispute",
      category: "Insurance Law",
      status: "Public",
      lawyer: "Not assigned",
      createdDate: "Dec 8, 2025",
      proposalCount: 3,
    },
    {
      id: 6,
      title: "Tenant Eviction Case",
      category: "Property Law",
      status: "Draft",
      lawyer: "Not assigned",
      createdDate: "Dec 10, 2025",
      proposalCount: 0,
    },
    {
      id: 7,
      title: "Partnership Agreement Review",
      category: "Corporate Law",
      status: "Rejected",
      lawyer: "Not assigned",
      createdDate: "Dec 1, 2025",
      proposalCount: 0,
    },
    {
      id: 8,
      title: "Medical Malpractice Claim",
      category: "Tort Law",
      status: "Public",
      lawyer: "Not assigned",
      createdDate: "Dec 15, 2025",
      proposalCount: 5,
    },
  ];

  // Filter tabs (updated)
  const filterTabs = [
    "All Cases",
    "Public Cases",
    "Proposals",
    "Sent to Lawyers",
    "Accepted",
    "In Progress",
    "Completed",
  ];

  // Get status-specific styling
  const getStatusStyles = (status) => {
    switch (status) {
      case "In Progress":
        return "bg-blue-100 text-blue-700";
      case "Accepted":
        return "bg-blue-100 text-blue-700";
      case "Completed":
        return "bg-green-100 text-green-700";
      case "Sent to Lawyers":
        return "bg-yellow-100 text-yellow-700";
      case "Public":
        return "bg-purple-100 text-purple-700";
      case "Draft":
        return "bg-gray-100 text-gray-700";
      case "Rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Get actions based on current tab and case status
  const getActionsForCase = (caseItem) => {
    const actions = [];

    if (activeTab === "All Cases") {
      actions.push({
        icon: Eye,
        label: "View Case",
        color: "text-blue-600",
      });
    } else if (activeTab === "Draft") {
      actions.push({
        icon: Edit,
        label: "Edit",
        color: "text-blue-600",
      });
      actions.push({
        icon: Send,
        label: "Submit",
        color: "text-green-600",
      });
      actions.push({
        icon: Trash2,
        label: "Delete",
        color: "text-red-600",
      });
    } else if (activeTab === "Sent to Lawyers") {
      actions.push({
        icon: Eye,
        label: "View Case",
        color: "text-blue-600",
      });
      actions.push({
        icon: AlertCircle,
        label: "Withdraw",
        color: "text-yellow-600",
      });
    } else if (activeTab === "Public Cases") {
      actions.push({
        icon: Eye,
        label: "View Case",
        color: "text-blue-600",
      });
      actions.push({
        icon: Lock,
        label: "Make Private",
        color: "text-slate-600",
      });
      actions.push({
        icon: XCircle,
        label: "Close Case",
        color: "text-red-600",
      });
    } else if (activeTab === "Proposals") {
      actions.push({
        icon: Eye,
        label: "View Case",
        color: "text-blue-600",
      });
      if (caseItem.proposalCount > 0) {
        actions.push({
          icon: Briefcase,
          label: `${caseItem.proposalCount} Proposal${
            caseItem.proposalCount > 1 ? "s" : ""
          }`,
          color: "text-purple-600",
        });
      }
    } else if (activeTab === "Accepted") {
      actions.push({
        icon: Eye,
        label: "View Case",
        color: "text-blue-600",
      });
    } else if (activeTab === "In Progress") {
      actions.push({
        icon: Eye,
        label: "View Case",
        color: "text-blue-600",
      });
    } else if (activeTab === "Completed") {
      actions.push({
        icon: Eye,
        label: "View Case",
        color: "text-blue-600",
      });
    }

    return actions;
  };

  // Calculate summary stats
  const getTotalCases = () => cases.length;
  const getActiveCases = () =>
    cases.filter((c) => c.status === "In Progress" || c.status === "Accepted")
      .length;
  const getPublicCases = () =>
    cases.filter((c) => c.status === "Public").length;
  const getCompletedCases = () =>
    cases.filter((c) => c.status === "Completed").length;

  // Filter cases based on search and tab
  const filteredCases = cases.filter((caseItem) => {
    const matchesSearch =
      caseItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.id.toString().includes(searchQuery);

    let matchesTab = false;

    if (activeTab === "All Cases") {
      matchesTab = true;
    } else if (activeTab === "Draft") {
      matchesTab = caseItem.status === "Draft";
    } else if (activeTab === "Public Cases") {
      matchesTab = caseItem.status === "Public";
    } else if (activeTab === "Proposals") {
      matchesTab = caseItem.status === "Public" && caseItem.proposalCount > 0;
    } else if (activeTab === "Sent to Lawyers") {
      matchesTab = caseItem.status === "Sent to Lawyers";
    } else if (activeTab === "Accepted") {
      matchesTab = caseItem.status === "Accepted";
    } else if (activeTab === "In Progress") {
      matchesTab = caseItem.status === "In Progress";
    } else if (activeTab === "Completed") {
      matchesTab = caseItem.status === "Completed";
    }

    return matchesSearch && matchesTab;
  });

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* TOP HEADER */}
        <div className="sticky top-0 z-50 bg-white border-b border-slate-200">
          <DashHeader
            title="My Cases"
            subtitle="Manage all your legal cases"
          />
        </div>

        {/* PAGE CONTENT */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-4 gap-6 mb-8">
              {/* Total Cases Card */}
              <div className="bg-white border border-slate-200 rounded-lg p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-2">
                      Total Cases
                    </p>
                    <p className="text-3xl font-bold text-slate-900">
                      {getTotalCases()}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-100 rounded-lg">
                    <FileText size={24} className="text-slate-600" />
                  </div>
                </div>
              </div>

              {/* Active Card */}
              <div className="bg-white border border-slate-200 rounded-lg p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-2">
                      Active
                    </p>
                    <p className="text-3xl font-bold text-blue-700">
                      {getActiveCases()}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Briefcase size={24} className="text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Public Cases Card */}
              <div className="bg-white border border-slate-200 rounded-lg p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-2">
                      Public Cases
                    </p>
                    <p className="text-3xl font-bold text-purple-700">
                      {getPublicCases()}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <AlertCircle size={24} className="text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Completed Card */}
              <div className="bg-white border border-slate-200 rounded-lg p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-2">
                      Completed
                    </p>
                    <p className="text-3xl font-bold text-green-700">
                      {getCompletedCases()}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <CheckCircle size={24} className="text-green-600" />
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
                        ? "border-blue-700 text-blue-700 bg-blue-50"
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
                  placeholder="Search by case title or ID…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Category Dropdown */}
              <div className="relative">
                <button className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50">
                  {categoryFilter}
                  <ChevronDown size={18} />
                </button>
              </div>

              {/* Create Case Button */}
              <button className="px-6 py-3 bg-blue-700 text-white rounded-lg font-medium hover:bg-blue-800 transition-colors">
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
                    {filteredCases.length > 0 ? (
                      filteredCases.map((caseItem, index) => (
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
                            {caseItem.lawyer === "Not assigned" ? (
                              <span className="text-slate-500">
                                Not assigned
                              </span>
                            ) : (
                              caseItem.lawyer
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
                                    className={`p-2 rounded-lg hover:bg-slate-100 transition-colors ${action.color}`}
                                    title={action.label}
                                  >
                                    <action.icon size={20} strokeWidth={1.5} />
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
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientCase;
