import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, AlertCircle, Eye } from 'lucide-react';
import Sidebar from './Sidebar';
import AdminDashHeader from './AdminDashHeader';
import { fetchKycList, reviewKyc } from '../slices/adminSlice';

const AdminKYCVerification = () => {
  const dispatch = useDispatch();
  const { kycList, kycLoading, reviewLoading } = useSelector((state) => state.admin);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedKYC, setSelectedKYC] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedDetails, setSelectedDetails] = useState(null);

  // Fetch KYC list when component mounts
  useEffect(() => {
    dispatch(fetchKycList());
  }, [dispatch]);

  // Function to normalize status for consistent comparison
  const normalizeStatus = (status) => (status || '').toLowerCase();

  // Function to render status badge based on KYC status
  const getStatusBadge = (status) => {
    const baseClasses =
      'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-sm';

      // Normalize status to lowercase for consistent comparison
    switch (normalizeStatus(status)) {
      case 'pending':
      case 'under_review':
      case 'in_review':
        return (
          <span className={`${baseClasses} bg-indigo-50 text-indigo-700 border border-indigo-100`}>
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className={`${baseClasses} bg-emerald-50 text-emerald-700 border border-emerald-100`}>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className={`${baseClasses} bg-rose-50 text-rose-700 border border-rose-100`}>
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  // Handle approve action for a KYC request
  const handleApprove = async (kycId) => {
    try {
      await dispatch(reviewKyc({ id: kycId, status: 'approved' })).unwrap();
      alert(`KYC ${kycId} has been approved successfully!`);
    } catch (error) {
      alert('Failed to approve KYC. Please try again.');
    }
  };

  // Handle reject button click, open modal and set selected KYC
  const handleRejectClick = (kyc) => {
    setSelectedKYC(kyc);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  // Handle confirm reject action, dispatch reviewKyc with rejection reason
  const handleRejectConfirm = () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
// Dispatch reviewKyc action with rejection reason
    dispatch(
      reviewKyc({
        id: selectedKYC.id,
        status: 'rejected',
        rejection_reason: rejectionReason.trim(),
      })
    )
      .unwrap()
      .then(() => {
        alert(`KYC ${selectedKYC.id} has been rejected.`);
      })
      .catch(() => {
        alert('Failed to reject KYC. Please try again.');
      });

    // Close modal and reset state
    setShowRejectModal(false);
    setSelectedKYC(null);
    setRejectionReason('');
  };
// Handle cancel reject action, close modal and reset state
  const handleCancelReject = () => {
    setShowRejectModal(false);
    setSelectedKYC(null);
    setRejectionReason('');
  };

  // Utility function to format values for display in the details modal
  const formatValue = (value) => {
    if (Array.isArray(value)) return value.length ? value.join(', ') : 'N/A';
    if (value === true) return 'Yes';
    if (value === false) return 'No';
    if (value === null || value === undefined || value === '') return 'N/A';
    return value;
  };

  // Utility function to format dates for display in the details modal
  const formatDate = (value) => {
    if (!value) return 'N/A';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
  };

  // Function to determine if a KYC request is in a pending state for conditional rendering of action buttons
  const isPending = (status) =>
    ['pending', 'under_review', 'in_review'].includes(normalizeStatus(status));

  const total = Array.isArray(kycList) ? kycList.length : 0;
  const pendingCount = Array.isArray(kycList)
    ? kycList.filter((r) => isPending(r.status)).length
    : 0;
  const approvedCount = Array.isArray(kycList)
    ? kycList.filter((r) => normalizeStatus(r.status) === 'approved').length
    : 0;
  const rejectedCount = Array.isArray(kycList)
    ? kycList.filter((r) => normalizeStatus(r.status) === 'rejected').length
    : 0;

  return (
    <div className="flex min-h-screen bg-slate-950/5">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col">
        <AdminDashHeader
          title="Lawyer KYC Verification"
          subtitle="Review and manage lawyer identity verification requests"
        />

        <main className="flex-1 p-8 bg-gradient-to-b from-slate-50 to-slate-100">
          <div className="mx-auto max-w-6xl space-y-6">
            {/* Stats row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-2xl bg-white shadow-sm border border-slate-100 p-4">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Total Requests
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{total}</p>
              </div>
              <div className="rounded-2xl bg-indigo-50 shadow-sm border border-indigo-100 p-4">
                <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide">
                  Pending
                </p>
                <p className="mt-2 text-2xl font-semibold text-indigo-900">{pendingCount}</p>
              </div>
              <div className="rounded-2xl bg-emerald-50 shadow-sm border border-emerald-100 p-4">
                <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide">
                  Approved
                </p>
                <p className="mt-2 text-2xl font-semibold text-emerald-900">{approvedCount}</p>
              </div>
              <div className="rounded-2xl bg-rose-50 shadow-sm border border-rose-100 p-4">
                <p className="text-xs font-medium text-rose-600 uppercase tracking-wide">
                  Rejected
                </p>
                <p className="mt-2 text-2xl font-semibold text-rose-900">{rejectedCount}</p>
              </div>
            </div>

            {/* KYC Verification Table */}
            <div className="bg-white/90 backdrop-blur rounded-3xl p-6 shadow-lg border border-slate-100">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    KYC Verification Requests
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage all incoming lawyer verification requests from this panel.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                  <span className="px-2.5 py-1 rounded-full bg-slate-50 border border-slate-100">
                    Total: <span className="font-semibold text-slate-700">{total}</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-100">
                    Pending: <span className="font-semibold text-indigo-700">{pendingCount}</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100">
                    Approved: <span className="font-semibold text-emerald-700">{approvedCount}</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-rose-50 border border-rose-100">
                    Rejected: <span className="font-semibold text-rose-700">{rejectedCount}</span>
                  </span>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-100">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50/80 backdrop-blur">
                      <tr className="border-b border-slate-100">
                        <th className="text-left py-3.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          KYC ID
                        </th>
                        <th className="text-left py-3.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          Lawyer Name
                        </th>
                        <th className="text-left py-3.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          Contact
                        </th>
                        <th className="text-left py-3.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          Status
                        </th>
                        <th className="text-left py-3.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          Submitted
                        </th>
                        <th className="text-center py-3.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          View
                        </th>
                        <th className="text-center py-3.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {kycLoading ? (
                        <tr>
                          <td
                            colSpan="7"
                            className="py-6 px-4 text-center text-slate-500 text-sm"
                          >
                            Loading KYC requests…
                          </td>
                        </tr>
                      ) : Array.isArray(kycList) && kycList.length > 0 ? (
                        kycList.map((request, index) => (
                          <tr
                            key={request.id}
                            className={`transition-colors ${
                              index % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'
                            } hover:bg-indigo-50/50`}
                          >
                            <td className="py-3 px-4 text-sm font-semibold text-slate-900">
                              #{request.id}
                            </td>
                            <td className="py-3 px-4 text-sm font-medium text-slate-900">
                              {request.user_name ||
                                request.user?.name ||
                                request.full_name ||
                                'N/A'}
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-600">
                              {request.user_email ||
                                request.user?.email ||
                                request.email ||
                                'N/A'}
                            </td>
                            <td className="py-3 px-4">{getStatusBadge(request.status)}</td>
                            <td className="py-3 px-4 text-sm text-slate-600">
                              {formatDate(
                                request.created_at || request.submitted_at || request.date
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => setSelectedDetails(request)}
                                className="inline-flex items-center justify-center w-9 h-9 text-indigo-600 rounded-full hover:bg-indigo-50 transition-colors border border-transparent hover:border-indigo-100"
                                aria-label="View KYC details"
                              >
                                <Eye size={18} />
                              </button>
                            </td>
                            <td className="py-3 px-4">
                              {isPending(request.status) ? (
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => handleApprove(request.id)}
                                    disabled={reviewLoading}
                                    className="px-3.5 py-1.5 bg-emerald-500 text-white text-xs font-medium rounded-full hover:bg-emerald-600 transition-colors disabled:opacity-60 shadow-sm"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => handleRejectClick(request)}
                                    disabled={reviewLoading}
                                    className="px-3.5 py-1.5 bg-rose-500 text-white text-xs font-medium rounded-full hover:bg-rose-600 transition-colors disabled:opacity-60 shadow-sm"
                                  >
                                    Reject
                                  </button>
                                </div>
                              ) : (
                                <div className="flex justify-center">
                                  <span className="text-xs text-slate-400 italic">
                                    No action
                                  </span>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="7"
                            className="py-6 px-4 text-center text-slate-500 text-sm"
                          >
                            No KYC requests found.
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

      {/* KYC Details Modal */}
      {selectedDetails && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80 backdrop-blur">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">KYC Details</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Review complete identity and professional information for the selected lawyer.
                </p>
              </div>
              <button
                onClick={() => setSelectedDetails(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors rounded-full p-1 hover:bg-slate-100"
              >
                <X size={22} />
              </button>
            </div>

            {/* Scrollable content with proper height */}
            <div className="max-h-[calc(90vh-120px)] overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <h4 className="text-base font-bold text-slate-900 mb-4 uppercase tracking-wide">
                    Basic
                  </h4>
                  <div className="space-y-2 text-sm text-slate-700">
                    <p>
                      <span className="font-semibold">KYC ID:</span> {selectedDetails.id}
                    </p>
                    <p>
                      <span className="font-semibold">Status:</span> {formatValue(selectedDetails.status)}
                    </p>
                    <p>
                      <span className="font-semibold">Submitted:</span>{' '}
                      {formatDate(selectedDetails.created_at || selectedDetails.submitted_at)}
                    </p>
                    <p>
                      <span className="font-semibold">User:</span>{' '}
                      {formatValue(selectedDetails.user_name || selectedDetails.user?.name)}
                    </p>
                    <p>
                      <span className="font-semibold">Email:</span>{' '}
                      {formatValue(selectedDetails.user_email || selectedDetails.user?.email)}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <h4 className="text-base font-bold text-slate-900 mb-4 uppercase tracking-wide">
                    Personal
                  </h4>
                  <div className="space-y-2 text-sm text-slate-700">
                    <p>
                      <span className="font-semibold">Full Name:</span> {formatValue(selectedDetails.full_name)}
                    </p>
                    <p>
                      <span className="font-semibold">Email:</span> {formatValue(selectedDetails.email)}
                    </p>
                    <p>
                      <span className="font-semibold">Phone:</span> {formatValue(selectedDetails.phone)}
                    </p>
                    <p>
                      <span className="font-semibold">DOB:</span> {formatValue(selectedDetails.dob)}
                    </p>
                    <p>
                      <span className="font-semibold">Gender:</span> {formatValue(selectedDetails.gender)}
                    </p>
                  </div>
                </div>

                <div className="md:col-span-2 bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <h4 className="text-base font-bold text-slate-900 mb-4 uppercase tracking-wide">
                    Address
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700">
                    <div>
                      <p>
                        <span className="font-semibold">Permanent:</span>
                      </p>
                      <p className="text-slate-600 mt-1">{formatValue(selectedDetails.permanent_address)}</p>
                    </div>
                    <div>
                      <p>
                        <span className="font-semibold">Current:</span>
                      </p>
                      <p className="text-slate-600 mt-1">{formatValue(selectedDetails.current_address)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <h4 className="text-base font-bold text-slate-900 mb-4 uppercase tracking-wide">
                    Professional
                  </h4>
                  <div className="space-y-2 text-sm text-slate-700">
                    <p>
                      <span className="font-semibold">Bar Council #:</span>{' '}
                      {formatValue(selectedDetails.bar_council_number)}
                    </p>
                    <p>
                      <span className="font-semibold">Law Firm:</span>{' '}
                      {formatValue(selectedDetails.law_firm_name)}
                    </p>
                    <p>
                      <span className="font-semibold">Experience:</span>{' '}
                      {formatValue(selectedDetails.years_of_experience)} years
                    </p>
                    <p>
                      <span className="font-semibold">Fee:</span> {formatValue(selectedDetails.consultation_fee)}
                    </p>
                    <p>
                      <span className="font-semibold">Specializations:</span>{' '}
                      {formatValue(selectedDetails.specializations)}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <h4 className="text-base font-bold text-slate-900 mb-4 uppercase tracking-wide">
                    Availability
                  </h4>
                  <div className="space-y-2 text-sm text-slate-700">
                    <p>
                      <span className="font-semibold">Days:</span> {formatValue(selectedDetails.availability_days)}
                    </p>
                    <p>
                      <span className="font-semibold">From:</span> {formatValue(selectedDetails.available_from)}
                    </p>
                    <p>
                      <span className="font-semibold">Until:</span> {formatValue(selectedDetails.available_until)}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                  <h4 className="text-base font-bold text-slate-900 mb-4 uppercase tracking-wide">
                    Declaration
                  </h4>
                  <div className="space-y-2 text-sm text-slate-700">
                    <p>
                      <span className="font-semibold">Accuracy:</span>{' '}
                      {formatValue(selectedDetails.confirm_accuracy)}
                    </p>
                    <p>
                      <span className="font-semibold">Authorize:</span>{' '}
                      {formatValue(selectedDetails.authorize_verification)}
                    </p>
                    <p>
                      <span className="font-semibold">Agree Terms:</span>{' '}
                      {formatValue(selectedDetails.agree_terms)}
                    </p>
                  </div>
                </div>

                {normalizeStatus(selectedDetails.status) === 'rejected' && selectedDetails.rejection_reason && (
                  <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
                    <h4 className="text-base font-bold text-red-900 mb-4 uppercase tracking-wide">
                      Rejection Review
                    </h4>
                    <p className="text-sm text-red-800">{selectedDetails.rejection_reason}</p>
                  </div>
                )}
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                <h4 className="text-base font-bold text-slate-900 mb-4 uppercase tracking-wide">
                  Documents
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    ['Citizenship Front', selectedDetails.citizenship_front],
                    ['Citizenship Back', selectedDetails.citizenship_back],
                    ['Lawyer License', selectedDetails.lawyer_license],
                    ['Passport Photo', selectedDetails.passport_photo],
                    ['Law Degree', selectedDetails.law_degree],
                    ['Experience Certificate', selectedDetails.experience_certificate],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <div className="font-semibold text-sm text-slate-800 mb-2">{label}</div>
                      {value ? (
                        <img
                          src={value}
                          alt={label}
                          className="w-full max-h-64 object-contain rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow"
                        />
                      ) : (
                        <div className="h-32 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 text-sm">
                          No document
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-rose-50/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="text-rose-600" size={20} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Reject Lawyer Verification
                  </h3>
                  <p className="text-xs text-slate-500">
                    Provide a clear reason so the lawyer understands what to correct.
                  </p>
                </div>
              </div>
              <button
                onClick={handleCancelReject}
                className="text-slate-400 hover:text-slate-600 transition-colors rounded-full p-1 hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-4">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-sm text-slate-700">
                  <span className="font-semibold">KYC ID:</span> {selectedKYC?.id}
                </p>
                <p className="text-sm text-slate-700 mt-1">
                  <span className="font-semibold">Lawyer:</span>{' '}
                  {selectedKYC?.user_name ||
                    selectedKYC?.user?.name ||
                    selectedKYC?.full_name}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">
                  Rejection Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-rose-500 focus:border-transparent text-sm placeholder:text-slate-400 resize-none"
                  rows="4"
                  placeholder="Explain clearly why this KYC cannot be approved (e.g., blurry documents, mismatched details, missing license information)..."
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/60">
              <button
                onClick={handleCancelReject}
                className="px-4 py-2 text-slate-700 bg-white rounded-full text-sm font-medium hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                className="px-4 py-2 text-white bg-rose-500 rounded-full text-sm font-medium hover:bg-rose-600 transition-colors shadow-sm"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminKYCVerification;
