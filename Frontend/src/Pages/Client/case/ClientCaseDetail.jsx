import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "../sidebar";
import DashHeader from "../ClientDashHeader";
import { 
  FileText, 
  MessageSquare, 
  Calendar, 
  Clock, 
  ChevronLeft, 
  MapPin,
  User,
  CheckCircle2
} from "lucide-react";
import { fetchCases } from "../../slices/caseSlice";
import ClientCaseTimelineCard from "./ClientCaseTimelineCard";
import ClientCaseDocumentCard from "./ClientCaseDocumentCard";
import ClientCaseDetailCard from "./ClientCaseDetailCard";

const ClientCaseDetail = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("Timeline");

  const { cases } = useSelector((state) => state.case);
  const caseData = cases?.find((c) => c.id === parseInt(id));

  useEffect(() => {
    dispatch(fetchCases());
  }, [dispatch]);

  const milestones = [
    {
      title: "Documents Uploaded",
      description: "Lawyer uploaded court submission documents",
      date: "Dec 8, 2024",
      status: "completed"
    },
    {
      title: "Court Hearing",
      description: "First hearing completed. Next date scheduled for Dec 15.",
      date: "Dec 5, 2024",
      status: "completed"
    },
    {
      title: "Evidence Submitted",
      description: "Land survey report and ownership documents submitted",
      date: "Nov 28, 2024",
      status: "completed"
    },
    {
      title: "Case Filed",
      description: "Official case filing at District Court",
      date: "Nov 20, 2024",
      status: "completed"
    }
  ];

  const pendingTasks = [
    {
      title: "Review court submission documents",
      due: "Due: Dec 10, 2024",
      status: "pending"
    },
    {
      title: "Prepare witness statements",
      due: "Due: Dec 12, 2024",
      status: "pending"
    },
    {
      title: "Submit additional property photos",
      due: "Due: Dec 5, 2024",
      status: "completed"
    }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <DashHeader 
            title="Case Details" 
            subtitle={`CASE-${id}`}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          {/* Back Button */}
          <button 
            onClick={() => navigate('/clientcase')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-6 text-sm font-medium"
          >
            <ChevronLeft size={18} />
            Back to Cases
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column (Main Content) */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Case Header Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <FileText size={24} className="text-slate-700" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">{`CASE-${id}`}</span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                          caseData?.status === 'completed' ? 'bg-green-50 text-green-600' :
                          caseData?.status === 'in_progress' ? 'bg-blue-50 text-blue-600' :
                          caseData?.status === 'accepted' ? 'bg-amber-50 text-amber-600' :
                          'bg-gray-50 text-gray-600'
                        }`}>{caseData?.status?.replace(/_/g, ' ') || 'Pending'}</span>
                      </div>
                      <h1 className="text-xl font-semibold text-slate-900 leading-tight mb-1">{caseData?.case_title || 'Case Title'}</h1>
                      <p className="text-sm text-slate-500 font-medium">{caseData?.case_category || 'Category'}</p>
                    </div>
                  </div>
                  <button className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0f172a] text-white rounded-lg hover:bg-slate-800 transition-all font-medium text-sm shadow-sm group">
                    <MessageSquare size={16} className="group-hover:scale-110 transition-transform" />
                    Message Lawyer
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { 
                    label: "Created Date", 
                    value: caseData?.created_at ? new Date(caseData.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
                    icon: Calendar, 
                    color: "text-blue-500", 
                    bg: "bg-blue-50" 
                  },
                  { 
                    label: "Next Hearing", 
                    value: caseData?.next_hearing_date ? new Date(caseData.next_hearing_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not scheduled',
                    icon: Clock, 
                    color: "text-amber-500", 
                    bg: "bg-amber-50" 
                  },
                  { 
                    label: "Documents", 
                    value: `${caseData?.documents?.length || 0} Files`,
                    icon: FileText, 
                    color: "text-slate-500", 
                    bg: "bg-slate-50" 
                  },
                  { 
                    label: "Court", 
                    value: caseData?.court_name || 'District Court, Kathmandu',
                    icon: MapPin, 
                    color: "text-emerald-500", 
                    bg: "bg-emerald-50" 
                  }
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3">
                    <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center`}>
                      <stat.icon size={20} className={stat.color} />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">{stat.label}</p>
                      <p className="text-sm font-semibold text-slate-800 wrap-break-word">{stat.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tabs & Content */}
              <div className="space-y-6">
                <div className="bg-slate-100/50 p-1 rounded-xl flex gap-1 w-fit">
                  {["Timeline", `Documents (${caseData?.documents?.length || 0})`, "Details"].map((tab) => (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab.includes('Documents') ? 'Documents' : tab)}
                      className={`px-8 py-2 text-sm font-semibold rounded-lg transition-all ${
                        (activeTab === 'Documents' && tab.includes('Documents')) || activeTab === tab ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Timeline Tab */}
                {activeTab === "Timeline" && (
                  <ClientCaseTimelineCard milestones={milestones} />
                )}

                {/* Documents Tab */}
                {activeTab === "Documents" && (
                  <ClientCaseDocumentCard 
                    caseId={parseInt(id)} 
                    documents={caseData?.documents || []} 
                  />
                )}

                {/* Details Tab */}
                {activeTab === "Details" && (
                  <ClientCaseDetailCard caseData={caseData} />
                )}
              </div>
            </div>

            {/* Right Column (Sidebar) */}
            <div className="space-y-8">
              
              {/* Lawyer Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <User size={18} className="text-blue-600" />
                  Your Lawyer
                </h3>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    {caseData?.lawyer_name ? (
                      <div className="w-14 h-14 rounded-full bg-slate-100 overflow-hidden border-2 border-white shadow-md">
                        {caseData?.lawyer_profile_image ? (
                          <img src={caseData.lawyer_profile_image} alt={caseData.lawyer_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-700 font-bold text-lg">
                            {caseData.lawyer_name.charAt(0)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center border-2 border-white shadow-md">
                        <User size={24} className="text-gray-400" />
                      </div>
                    )}
                    {caseData?.lawyer_name && <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{caseData?.lawyer_name || 'No lawyer assigned yet'}</h4>
                    <p className="text-xs font-medium text-slate-500">{caseData?.case_category || ''}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <button className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-slate-200 rounded-xl hover:bg-slate-50 hover:shadow-md transition-all text-sm font-semibold text-slate-700">
                    <MessageSquare size={16} />
                    Send Message
                  </button>
                  <button className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-slate-200 rounded-xl hover:bg-slate-50 hover:shadow-md transition-all text-sm font-semibold text-slate-700">
                    <Calendar size={16} />
                    Schedule Meeting
                  </button>
                </div>
              </div>

              {/* Pending Tasks */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Clock size={18} className="text-amber-500" />
                    Pending Tasks
                  </h3>
                    <span className="text-xs font-semibold text-slate-400">2</span>
                </div>

                <div className="space-y-4">
                  {pendingTasks.map((task, i) => (
                    <div key={i} className={`p-4 rounded-xl border transition-all ${
                      task.status === 'completed' 
                      ? 'bg-emerald-50/50 border-emerald-100 hover:bg-emerald-50' 
                      : 'bg-amber-50/50 border-amber-100 hover:bg-amber-50'
                    }`}>
                      <div className="flex gap-3">
                        <div className={`mt-0.5 ${task.status === 'completed' ? 'text-emerald-500' : 'text-amber-500'}`}>
                          {task.status === 'completed' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-800 leading-tight mb-1">{task.title}</p>
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{task.due}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientCaseDetail;
