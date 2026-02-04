import React, { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Sidebar from "../sidebar";
import DashHeader from "../ClientDashHeader";
import { 
  ChevronLeft, 
  User, 
  Star, 
  MapPin, 
  Clock, 
  DollarSign, 
  CheckCircle, 
  XCircle,
  Briefcase
} from 'lucide-react';
import { fetchProposals, acceptProposal, rejectProposal } from '../../slices/proposalSlice';
import { fetchCases } from '../../slices/caseSlice';

const LawyerProposal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { proposals, proposalsLoading, proposalsError, acceptProposalLoading, acceptProposalError, rejectProposalLoading, rejectProposalError } = useSelector((state) => state.proposal);
  const casesData = useSelector((state) => state.case?.cases || []);

  useEffect(() => {
    if (id) {
      dispatch(fetchProposals({ case_id: id }));
      dispatch(fetchCases());
    }
  }, [dispatch, id]);

  // Refresh proposals after accepting to show rejected status for others
  useEffect(() => {
    if (acceptProposalLoading === false && acceptProposalError === null) {
      dispatch(fetchProposals({ case_id: id }));
      dispatch(fetchCases());
    }
  }, [acceptProposalLoading, acceptProposalError, dispatch, id]);

  // Refresh proposals after rejecting
  useEffect(() => {
    if (rejectProposalLoading === false && rejectProposalError === null) {
      dispatch(fetchProposals({ case_id: id }));
      dispatch(fetchCases());
    }
  }, [rejectProposalLoading, rejectProposalError, dispatch, id]);

  const caseData = useMemo(() => {
    const current = (casesData || []).find((item) => String(item.id) === String(id));
    if (!current) return null;
    return {
      id: current.id,
      category: current.case_category || "-",
      title: current.case_title || "Untitled",
      description: current.case_description || "-",
      created_at: current.created_at,
      pending_proposals: current.proposal_count || 0,
    };
  }, [casesData, id]);

  const caseProposals = useMemo(() => {
    if (!proposals || proposals.length === 0) return [];
    return proposals.filter((p) => String(p.case) === String(id));
  }, [proposals, id]);

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-slate-200">
          <DashHeader 
            title="Case Proposals" 
            subtitle="Review and manage lawyer proposals for your case" 
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          {/* Back Button */}
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors mb-6 text-sm font-medium"
          >
            <ChevronLeft size={18} />
            Back to My Cases
          </button>

          {/* Case Summary Card */}
          {caseData ? (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8 relative overflow-hidden">
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg uppercase tracking-wider border border-slate-200">
                      {caseData.id}
                    </span>
                    <span className="text-sm font-bold text-blue-600">
                      {caseData.category}
                    </span>
                  </div>
                  <div className="px-3 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-full border border-amber-100 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
                    {caseData.pending_proposals} Pending Proposals
                  </div>
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-slate-900 mb-4">{caseData.title}</h1>
                  
                  <div className="space-y-3">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Case Description</p>
                    <p className="text-slate-600 leading-relaxed text-sm bg-slate-50/50 p-4 rounded-xl border border-slate-50">
                      {caseData.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-400 text-xs mt-2">
                  <Clock size={14} />
                  <span>Created: {formatDate(caseData.created_at)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8 text-slate-500">
              Loading case details...
            </div>
          )}

          {/* Proposals List */}
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              Proposals ({caseProposals.length})
            </h2>

            {proposalsLoading ? (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-slate-500">
                Loading proposals...
              </div>
            ) : proposalsError ? (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-red-100 text-red-600">
                {proposalsError}
              </div>
            ) : caseProposals.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-slate-500">
                No proposals found for this case.
              </div>
            ) : (
              caseProposals.map((proposal) => (
                <div key={proposal.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:border-blue-200 transition-all group">
                <div className="flex flex-col lg:row-span-1 gap-6">
                  
                  {/* Proposal Header: Lawyer Info & Action Buttons */}
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-full bg-slate-100 overflow-hidden border-2 border-white shadow-md flex-shrink-0">
                        {proposal.lawyer_profile_image ? (
                          <img src={proposal.lawyer_profile_image} alt={proposal.lawyer_name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-600 font-bold text-xl uppercase">
                            {proposal.lawyer_name ? proposal.lawyer_name.split(' ').slice(-1)[0].charAt(0) : "L"}
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">{proposal.lawyer_name}</h3>
                        <p className="text-sm font-medium text-slate-500">{proposal.lawyer_email}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1 text-slate-500 text-xs font-medium">
                            <Briefcase size={14} className="text-slate-400" />
                            Proposal
                          </div>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${proposal.status === 'accepted' ? 'bg-green-100 text-green-700' : proposal.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-50 text-amber-600'}`}>
                            {proposal.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto">
                      <button
                        disabled={proposal.status !== 'pending' || acceptProposalLoading || rejectProposalLoading}
                        onClick={() => dispatch(acceptProposal(proposal.id))}
                        className="flex-1 md:w-[120px] flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0f172a] text-white rounded-lg hover:bg-slate-800 transition-all font-bold text-sm shadow-sm group/btn disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <CheckCircle size={16} />
                        {acceptProposalLoading ? 'Accepting...' : 'Accept'}
                      </button>
                      <button
                        disabled={proposal.status !== 'pending' || acceptProposalLoading || rejectProposalLoading}
                        onClick={() => dispatch(rejectProposal({ proposalId: proposal.id }))}
                        className="flex-1 md:w-[120px] flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all font-bold text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <XCircle size={16} />
                        {rejectProposalLoading ? 'Rejecting...' : 'Reject'}
                      </button>
                    </div>
                  </div>

                  {/* Proposal Message */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Proposal Message</p>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {proposal.proposal_text}
                    </p>
                  </div>

                  {/* Proposal Footer: Details */}
                  <div className="pt-6 border-t border-slate-50 flex flex-wrap items-center gap-x-8 gap-y-4">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Lawyer Email:</p>
                      <span className="text-sm font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">{proposal.lawyer_email || '-'}</span>
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                      <Clock size={14} className="text-slate-400" />
                      <span className="text-xs font-medium text-slate-400">Submitted: {formatDate(proposal.created_at)}</span>
                    </div>
                  </div>

                </div>
              </div>
              ))
            )}
            {(acceptProposalError || rejectProposalError) && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-red-100 text-red-600 text-sm">
                {acceptProposalError || rejectProposalError}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default LawyerProposal;