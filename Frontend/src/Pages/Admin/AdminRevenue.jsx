import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  DollarSign,
  TrendingUp,
  Users,
  Loader2,
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  X,
  Send,
} from 'lucide-react';
import Sidebar from './Sidebar';
import AdminDashHeader from './AdminDashHeader';
import Statcard from './Statcard';
import { getImageUrl } from '../../utils/imageUrl';
import {
  fetchAdminRevenue,
  fetchLawyerPendingPayments,
  createPayout,
} from '../slices/paymentSlice';

const AdminRevenue = () => {
  const dispatch = useDispatch();
  const {
    revenue,
    revenueLoading,
    revenueError,
    pendingPayments,
    pendingPaymentsLoading,
    payoutCreating,
    payoutError,
  } = useSelector((state) => state.payment);

  // Payout modal state
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [selectedPaymentIds, setSelectedPaymentIds] = useState([]);

  const [paymentMethod, setPaymentMethod] = useState('esewa');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    dispatch(fetchAdminRevenue());
  }, [dispatch]);

  const summary = revenue?.summary;
  const lawyerBreakdown = revenue?.lawyer_breakdown || [];
  const payments = revenue?.payments || [];
  const recentPayouts = revenue?.payouts || [];

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleOpenPayoutModal = (lawyer) => {
    setSelectedLawyer(lawyer);
    setSelectedPaymentIds([]);
    setPaymentMethod('esewa');
    setNotes('');
    setShowPayoutModal(true);
    dispatch(fetchLawyerPendingPayments(lawyer.lawyer__id));
  };

  const handleCloseModal = () => {
    setShowPayoutModal(false);
    setSelectedLawyer(null);
    setSelectedPaymentIds([]);
  };

  const handleTogglePayment = (paymentId) => {
    setSelectedPaymentIds((prev) =>
      prev.includes(paymentId) ? prev.filter((id) => id !== paymentId) : [...prev, paymentId]
    );
  };

  const handleSelectAll = () => {
    const allIds = (pendingPayments?.payments || []).map((p) => p.id);
    if (selectedPaymentIds.length === allIds.length) {
      setSelectedPaymentIds([]);
    } else {
      setSelectedPaymentIds(allIds);
    }
  };

  const getSelectedTotal = () => {
    const paymentsList = pendingPayments?.payments || [];
    return paymentsList
      .filter((p) => selectedPaymentIds.includes(p.id))
      .reduce((sum, p) => sum + parseFloat(p.lawyer_earning || 0), 0);
  };

  const handleSubmitPayout = async () => {
    if (selectedPaymentIds.length === 0 || !selectedLawyer) return;

    const result = await dispatch(
      createPayout({
        lawyer_id: selectedLawyer.lawyer__id,
        payment_ids: selectedPaymentIds,
        payment_method: paymentMethod,
        notes,
      })
    );

    if (!result.error) {
      handleCloseModal();
      dispatch(fetchAdminRevenue());
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 ml-64">
        <AdminDashHeader title="Platform Revenue" subtitle="Financial overview and payout management" />

        <div className="p-8">
          {/* Loading */}
          {revenueLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={40} className="text-blue-500 animate-spin" />
            </div>
          )}

          {/* Error */}
          {revenueError && !revenueLoading && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <AlertCircle size={20} className="text-red-500" />
              <p className="text-sm text-red-700">{revenueError}</p>
            </div>
          )}

          {!revenueLoading && !revenueError && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Statcard
                  icon={<DollarSign size={20} />}
                  title="Platform Revenue"
                  value={`Rs. ${parseFloat(summary?.total_platform_revenue || 0).toLocaleString()}`}
                  subtitle={`${summary?.commission_rate || 0}% commission`}
                  color="emerald"
                />
                <Statcard
                  icon={<TrendingUp size={20} />}
                  title="Total Collected"
                  value={`Rs. ${parseFloat(summary?.total_collected || 0).toLocaleString()}`}
                  subtitle="From all client payments"
                  color="blue"
                />
                <Statcard
                  icon={<CheckCircle size={20} />}
                  title="Paid to Lawyers"
                  value={`Rs. ${parseFloat(summary?.total_paid_out || 0).toLocaleString()}`}
                  subtitle="Settled payouts"
                  color="green"
                />
                <Statcard
                  icon={<Clock size={20} />}
                  title="Pending Payouts"
                  value={`Rs. ${parseFloat(summary?.total_pending_payout || 0).toLocaleString()}`}
                  subtitle={`${summary?.total_transactions || 0} total transactions`}
                  color="amber"
                />
              </div>

              {/* Lawyer Breakdown with Payout Actions */}
              <div className="bg-white rounded-2xl p-8 shadow-sm mb-8">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Revenue Per Lawyer</h2>
                    <p className="text-sm text-gray-500 mt-1">Breakdown of earnings and payout status</p>
                  </div>
                </div>

                {lawyerBreakdown.length === 0 ? (
                  <div className="py-12 text-center">
                    <Users size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 font-medium">No transactions yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-100">
                          <th className="text-left py-4 px-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Lawyer</th>
                          <th className="text-right py-4 px-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Transactions</th>
                          <th className="text-right py-4 px-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Platform Fee</th>
                          <th className="text-right py-4 px-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Lawyer Earned</th>
                          <th className="text-right py-4 px-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Pending</th>
                          <th className="text-right py-4 px-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Paid Out</th>
                          <th className="text-center py-4 px-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lawyerBreakdown.map((lawyer, idx) => (
                          <tr key={lawyer.lawyer__id || idx} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-3">
                              <div className="flex items-center gap-2">
                                <img
                                  src={getImageUrl(lawyer.lawyer__profile_image, lawyer.lawyer__name)}
                                  alt={lawyer.lawyer__name}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">{lawyer.lawyer__name || 'Unknown'}</p>
                                  <p className="text-xs text-gray-400">{lawyer.lawyer__email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-3 text-right">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600">
                                {lawyer.transaction_count}
                              </span>
                            </td>
                            <td className="py-4 px-3 text-right text-sm font-semibold text-emerald-600">
                              Rs. {parseFloat(lawyer.platform_fee || 0).toLocaleString()}
                            </td>
                            <td className="py-4 px-3 text-right text-sm font-medium text-gray-900">
                              Rs. {parseFloat(lawyer.lawyer_earned || 0).toLocaleString()}
                            </td>
                            <td className="py-4 px-3 text-right">
                              {parseFloat(lawyer.pending_payout || 0) > 0 ? (
                                <span className="text-sm font-semibold text-amber-600">
                                  Rs. {parseFloat(lawyer.pending_payout).toLocaleString()}
                                </span>
                              ) : (
                                <span className="text-sm text-gray-400">Rs. 0</span>
                              )}
                            </td>
                            <td className="py-4 px-3 text-right">
                              <span className="text-sm font-medium text-green-600">
                                Rs. {parseFloat(lawyer.paid_out || 0).toLocaleString()}
                              </span>
                            </td>
                            <td className="py-4 px-3 text-center">
                              {parseFloat(lawyer.pending_payout || 0) > 0 ? (
                                <button
                                  onClick={() => handleOpenPayoutModal(lawyer)}
                                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                                >
                                  <Send size={13} />
                                  Pay Lawyer
                                </button>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-50 text-green-600 text-xs font-semibold rounded-lg">
                                  <CheckCircle size={13} />
                                  Settled
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Recent Payouts */}
              {recentPayouts.length > 0 && (
                <div className="bg-white rounded-2xl p-8 shadow-sm mb-8">
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Payout History</h2>
                    <p className="text-sm text-gray-500 mt-1">Record of all payouts made to lawyers</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-100">
                          <th className="text-left py-4 px-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Lawyer</th>
                          <th className="text-left py-4 px-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                          <th className="text-right py-4 px-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                          <th className="text-left py-4 px-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Method</th>
                          <th className="text-left py-4 px-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Payments</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentPayouts.map((payout, idx) => (
                          <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-3">
                              <p className="text-sm font-semibold text-gray-900">{payout.lawyer_name}</p>
                              <p className="text-xs text-gray-400">{payout.lawyer_email}</p>
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Calendar size={14} className="text-gray-400" />
                                {formatDate(payout.created_at)}
                              </div>
                            </td>
                            <td className="py-3 px-3 text-right text-sm font-bold text-green-600">
                              Rs. {parseFloat(payout.amount || 0).toLocaleString()}
                            </td>
                            <td className="py-3 px-3 text-sm text-gray-700 capitalize">{(payout.payment_method || '-').replace('_', ' ')}</td>
                            <td className="py-3 px-3 text-sm text-gray-700">{(payout.payment_ids || []).length} payments</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* All Transactions */}
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900">All Transactions</h2>
                  <p className="text-sm text-gray-500 mt-1">Complete history of completed payments</p>
                </div>

                {payments.length === 0 ? (
                  <div className="py-12 text-center">
                    <DollarSign size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 font-medium">No transactions yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-100">
                          <th className="text-left py-4 px-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Client</th>
                          <th className="text-left py-4 px-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Lawyer</th>
                          <th className="text-left py-4 px-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                          <th className="text-right py-4 px-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                          <th className="text-right py-4 px-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Platform Fee</th>
                          <th className="text-right py-4 px-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Lawyer Gets</th>
                          <th className="text-center py-4 px-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Payout</th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((payment) => (
                          <tr key={payment.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-3 text-sm font-medium text-gray-900">{payment.user_name || 'Client'}</td>
                            <td className="py-3 px-3 text-sm text-gray-700">{payment.lawyer_name || 'Lawyer'}</td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Calendar size={14} className="text-gray-400" />
                                {formatDate(payment.created_at)}
                              </div>
                            </td>
                            <td className="py-3 px-3 text-right text-sm font-medium text-gray-900">
                              Rs. {parseFloat(payment.total_amount).toLocaleString()}
                            </td>
                            <td className="py-3 px-3 text-right text-sm font-semibold text-emerald-600">
                              Rs. {parseFloat(payment.platform_fee).toLocaleString()}
                            </td>
                            <td className="py-3 px-3 text-right text-sm text-gray-700">
                              Rs. {parseFloat(payment.lawyer_earning).toLocaleString()}
                            </td>
                            <td className="py-3 px-3 text-center">
                              {payment.payout_status === 'paid' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-600">
                                  <CheckCircle size={12} />
                                  Paid
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600">
                                  <Clock size={12} />
                                  Pending
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Payout Modal */}
      {showPayoutModal && selectedLawyer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleCloseModal} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Pay Lawyer</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {selectedLawyer.lawyer__name} — {selectedLawyer.lawyer__email}
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Lawyer Contact Info */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Send Payment To</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{pendingPayments?.lawyer_name || selectedLawyer.lawyer__name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{pendingPayments?.lawyer_email || selectedLawyer.lawyer__email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-gray-500">
                      {paymentMethod === 'esewa' ? 'eSewa Number' : 'Khalti Number'}
                    </p>
                    <p className="text-sm font-bold text-indigo-600">
                      {paymentMethod === 'esewa'
                        ? (pendingPayments?.esewa_number || 'Not available')
                        : (pendingPayments?.khalti_number || 'Not available')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payout Error */}
              {payoutError && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-3">
                  <AlertCircle size={16} className="text-red-500 shrink-0" />
                  <p className="text-sm text-red-700">
                    {typeof payoutError === 'object' ? JSON.stringify(payoutError) : payoutError}
                  </p>
                </div>
              )}

              {/* Pending Payments List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-800">Select Payments to Settle</h4>
                  {!pendingPaymentsLoading && (pendingPayments?.payments || []).length > 0 && (
                    <button
                      onClick={handleSelectAll}
                      className="text-xs text-blue-600 font-semibold hover:text-blue-700 cursor-pointer"
                    >
                      {selectedPaymentIds.length === (pendingPayments?.payments || []).length
                        ? 'Deselect All'
                        : 'Select All'}
                    </button>
                  )}
                </div>

                {pendingPaymentsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 size={24} className="text-blue-500 animate-spin" />
                  </div>
                ) : (pendingPayments?.payments || []).length === 0 ? (
                  <p className="text-sm text-gray-500 py-4 text-center">No pending payments found.</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {(pendingPayments?.payments || []).map((payment) => (
                      <label
                        key={payment.id}
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                          selectedPaymentIds.includes(payment.id)
                            ? 'border-blue-300 bg-blue-50'
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedPaymentIds.includes(payment.id)}
                          onChange={() => handleTogglePayment(payment.id)}
                          className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {payment.user_name || 'Client'} — #{payment.id}
                            </p>
                            <p className="text-sm font-bold text-gray-900 ml-2">
                              Rs. {parseFloat(payment.lawyer_earning || 0).toLocaleString()}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {formatDate(payment.created_at)} • Total: Rs. {parseFloat(payment.total_amount || 0).toLocaleString()}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}

                {selectedPaymentIds.length > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-xl flex justify-between items-center">
                    <span className="text-sm text-blue-700">
                      {selectedPaymentIds.length} payment{selectedPaymentIds.length > 1 ? 's' : ''} selected
                    </span>
                    <span className="text-sm font-bold text-blue-800">
                      Total: Rs. {getSelectedTotal().toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Payout Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="esewa">eSewa</option>
                    <option value="khalti">Khalti</option>
                  </select>
                </div>

                {/* Auto-display wallet number based on selected payment method */}
                <div className={`p-3 rounded-xl border flex items-center justify-between ${
                  paymentMethod === 'esewa' ? 'bg-green-50 border-green-200' : 'bg-purple-50 border-purple-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                      paymentMethod === 'esewa' ? 'bg-green-500' : 'bg-purple-500'
                    }`}>
                      {paymentMethod === 'esewa' ? 'eS' : 'K'}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">
                        {paymentMethod === 'esewa' ? 'eSewa' : 'Khalti'} Wallet Number
                      </p>
                      <p className={`text-sm font-bold ${
                        paymentMethod === 'esewa' ? 'text-green-700' : 'text-purple-700'
                      }`}>
                        {paymentMethod === 'esewa'
                          ? (pendingPayments?.esewa_number || 'Not provided')
                          : (pendingPayments?.khalti_number || 'Not provided')}
                      </p>
                    </div>
                  </div>
                  {((paymentMethod === 'esewa' && !pendingPayments?.esewa_number) ||
                    (paymentMethod === 'khalti' && !pendingPayments?.khalti_number)) && (
                    <span className="text-xs text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded-md">Not set by lawyer</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Settlement notes..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitPayout}
                disabled={payoutCreating || selectedPaymentIds.length === 0}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {payoutCreating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                {payoutCreating ? 'Processing...' : `Pay Rs. ${getSelectedTotal().toLocaleString()}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRevenue;
