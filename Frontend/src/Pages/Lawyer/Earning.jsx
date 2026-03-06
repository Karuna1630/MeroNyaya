import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  DollarSign,
  TrendingUp,
  Percent,
  Hash,
  Loader2,
  AlertCircle,
  User,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
} from 'lucide-react';
import Sidebar from './Sidebar';
import DashHeader from './LawyerDashHeader';
import StatCard from './Statcard';
import { fetchLawyerEarnings } from '../slices/paymentSlice';

const Earning = () => {
  const dispatch = useDispatch();
  const { earnings, earningsLoading, earningsError } = useSelector((state) => state.payment);

  useEffect(() => {
    dispatch(fetchLawyerEarnings());
  }, [dispatch]);

  const summary = earnings?.summary;
  const payments = earnings?.payments || [];
  const payouts = earnings?.payouts || [];

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (paymentStatus) => {
    const base = 'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold';
    switch (paymentStatus) {
      case 'completed':
        return <span className={`${base} bg-emerald-50 text-emerald-600 border border-emerald-200`}><CheckCircle size={12} /> Completed</span>;
      case 'initiated':
        return <span className={`${base} bg-blue-50 text-blue-600 border border-blue-200`}>Initiated</span>;
      case 'failed':
        return <span className={`${base} bg-red-50 text-red-600 border border-red-200`}>Failed</span>;
      case 'refunded':
        return <span className={`${base} bg-amber-50 text-amber-600 border border-amber-200`}>Refunded</span>;
      default:
        return <span className={`${base} bg-gray-50 text-gray-600`}>{paymentStatus}</span>;
    }
  };

  const getPayoutBadge = (payoutStatus) => {
    const base = 'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold';
    if (payoutStatus === 'paid') {
      return <span className={`${base} bg-green-50 text-green-600`}><CheckCircle size={12} /> Paid</span>;
    }
    return <span className={`${base} bg-amber-50 text-amber-600`}><Clock size={12} /> Pending</span>;
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 ml-64 flex flex-col overflow-hidden">
        <DashHeader title="Earnings" subtitle="Track your consultation payments and payouts" />

        <div className="flex-1 p-8 overflow-y-auto">
          {/* Loading */}
          {earningsLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={40} className="text-blue-500 animate-spin" />
            </div>
          )}

          {/* Error */}
          {earningsError && !earningsLoading && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <AlertCircle size={20} className="text-red-500" />
              <p className="text-sm text-red-700">{earningsError}</p>
            </div>
          )}

          {!earningsLoading && !earningsError && (
            <>
              {/* Stats Cards - Row 1: Earnings */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <StatCard
                  icon={<DollarSign size={20} />}
                  title="Total Earned"
                  value={`Rs. ${parseFloat(summary?.total_earned || 0).toLocaleString()}`}
                  subtitle="After platform fee"
                />
                <StatCard
                  icon={<TrendingUp size={20} />}
                  title="Total From Clients"
                  value={`Rs. ${parseFloat(summary?.total_received_from_clients || 0).toLocaleString()}`}
                  subtitle="Gross payments received"
                />
                <StatCard
                  icon={<Percent size={20} />}
                  title="Platform Fee"
                  value={`Rs. ${parseFloat(summary?.total_platform_fee || 0).toLocaleString()}`}
                  subtitle={`${summary?.commission_rate || 0}% commission rate`}
                />
                <StatCard
                  icon={<Hash size={20} />}
                  title="Transactions"
                  value={summary?.total_transactions || 0}
                  subtitle="Completed payments"
                />
              </div>

              {/* Stats Cards - Row 2: Payout Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <StatCard
                  icon={<CheckCircle size={20} />}
                  title="Paid Out"
                  value={`Rs. ${parseFloat(summary?.paid_out || 0).toLocaleString()}`}
                  subtitle={`${summary?.paid_out_count || 0} payments settled`}
                  className="border-l-4 border-l-green-500"
                />
                <StatCard
                  icon={<Clock size={20} />}
                  title="Pending Payout"
                  value={`Rs. ${parseFloat(summary?.pending_payout || 0).toLocaleString()}`}
                  subtitle={`${summary?.pending_count || 0} payments awaiting settlement`}
                  className="border-l-4 border-l-amber-500"
                />
              </div>

              {/* Earnings Breakdown Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-8">
                <h3 className="text-sm font-bold text-blue-800 mb-2">How Earnings Work</h3>
                <p className="text-sm text-blue-700">
                  When a client pays for a consultation, the platform deducts a <strong>{summary?.commission_rate || 0}%</strong> service fee.
                  The remaining amount is your earning. Payouts are processed by the admin and you will be notified when your earnings are settled.
                </p>
              </div>

              {/* Payment History Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
                <div className="px-6 py-5 border-b border-slate-100">
                  <h2 className="text-lg font-bold text-slate-900">Payment History</h2>
                  <p className="text-sm text-slate-500 mt-1">All payments from your consultations</p>
                </div>

                {payments.length === 0 ? (
                  <div className="px-6 py-16 text-center">
                    <DollarSign size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 font-medium">No payments yet</p>
                    <p className="text-sm text-slate-400 mt-1">Complete consultations to start earning</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50">
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Client</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Paid</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Platform Fee</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Your Earning</th>
                          <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                          <th className="text-center py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Payout</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {payments.map((payment) => (
                          <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                                  <User size={14} className="text-slate-500" />
                                </div>
                                <span className="text-sm font-medium text-slate-900">{payment.user_name || 'Client'}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                <Calendar size={14} className="text-slate-400" />
                                {formatDate(payment.created_at)}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right text-sm font-medium text-slate-900">
                              Rs. {parseFloat(payment.total_amount).toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-right text-sm text-red-500">
                              - Rs. {parseFloat(payment.platform_fee).toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-right text-sm font-bold text-emerald-600">
                              Rs. {parseFloat(payment.lawyer_earning).toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {getStatusBadge(payment.status)}
                            </td>
                            <td className="py-3 px-4 text-center">
                              {payment.status === 'completed' ? getPayoutBadge(payment.payout_status) : (
                                <span className="text-xs text-slate-400">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Payout History */}
              {payouts.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="px-6 py-5 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-900">Payout History</h2>
                    <p className="text-sm text-slate-500 mt-1">Settlements received from the platform</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50">
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Reference</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Method</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Payments</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {payouts.map((payout, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                <Calendar size={14} className="text-slate-400" />
                                {formatDate(payout.created_at)}
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right text-sm font-bold text-green-600">
                              Rs. {parseFloat(payout.amount || 0).toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-700">{payout.reference_number || '-'}</td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center gap-1 text-sm text-slate-700 capitalize">
                                <CreditCard size={14} className="text-slate-400" />
                                {(payout.payment_method || '-').replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-sm text-slate-700">{(payout.payment_ids || []).length} payments</td>
                            <td className="py-3 px-4 text-sm text-slate-500 max-w-50 truncate">{payout.notes || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Earning;
