import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import {
  DollarSign,
  TrendingUp,
  Percent,
  Hash,
  Loader2,
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  RotateCcw,
  Wallet,
  ArrowUpRight,
  Briefcase,
} from 'lucide-react';
import { useMemo } from 'react';
import Sidebar from './Sidebar';
import DashHeader from './LawyerDashHeader';
import StatCard from './Statcard';
import { getImageUrl } from '../../utils/imageUrl';
import { fetchLawyerEarnings } from '../slices/paymentSlice';

const Earning = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { earnings, earningsLoading, earningsError } = useSelector((state) => state.payment);

  useEffect(() => {
    dispatch(fetchLawyerEarnings());
  }, [dispatch]);

  const summary = earnings?.summary;
  const payments = earnings?.payments || [];
  const caseRequests = earnings?.case_payment_requests || [];

  const allHistory = useMemo(() => {
    const historicalPayments = payments.map(p => ({
      ...p,
      type: 'appointment',
      display_amount: p.total_amount,
      display_earning: p.lawyer_earning,
      display_fee: p.platform_fee,
      display_status: p.status,
      display_client: p.user_name,
      display_image: p.user_profile_image,
      date: p.created_at,
      title: `Appt #${p.appointment_id}`
    }));

    const historicalCaseRequests = caseRequests.map(r => ({
      ...r,
      type: 'case',
      display_amount: r.current_agreed_amount || r.proposed_amount,
      display_earning: r.status === 'paid' ? (parseFloat(r.current_agreed_amount || r.proposed_amount) * 0.9).toFixed(2) : '—',
      display_fee: r.status === 'paid' ? (parseFloat(r.current_agreed_amount || r.proposed_amount) * 0.1).toFixed(2) : '—',
      display_status: r.status,
      display_client: r.client_name,
      display_image: r.client_profile_image,
      date: r.created_at,
      title: `Case: ${r.case_title}`
    }));

    return [...historicalPayments, ...historicalCaseRequests].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );
  }, [payments, caseRequests]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const statusConfig = {
    completed: {
      label: 'Completed',
      icon: <CheckCircle size={12} />,
      classes: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
    },
    paid: {
      label: 'Paid',
      icon: <CheckCircle size={12} />,
      classes: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
    },
    initiated: {
      label: 'Initiated',
      icon: <Clock size={12} />,
      classes: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20',
    },
    pending: {
      label: 'Requested',
      icon: <Clock size={12} />,
      classes: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20',
    },
    negotiating: {
      label: 'Negotiating',
      icon: <Clock size={12} />,
      classes: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/20',
    },
    agreed: {
      label: 'Agreed',
      icon: <DollarSign size={12} />,
      classes: 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-600/20',
    },
    failed: {
      label: 'Failed',
      icon: <XCircle size={12} />,
      classes: 'bg-red-50 text-red-700 ring-1 ring-red-600/20',
    },
    rejected: {
      label: 'Rejected',
      icon: <XCircle size={12} />,
      classes: 'bg-red-50 text-red-700 ring-1 ring-red-600/20',
    },
    expired: {
      label: 'Expired',
      icon: <XCircle size={12} />,
      classes: 'bg-gray-100 text-gray-600 ring-1 ring-gray-400/20',
    },
    refunded: {
      label: 'Refunded',
      icon: <RotateCcw size={12} />,
      classes: 'bg-purple-50 text-purple-700 ring-1 ring-purple-600/20',
    },
  };

  const getStatusBadge = (value) => {
    const cfg = statusConfig[value] || { label: value, icon: null, classes: 'bg-gray-50 text-gray-600' };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.classes}`}>
        {cfg.icon}
        {cfg.label}
      </span>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <DashHeader title={t('navigation.earnings')} subtitle={t('lawyerEarnings.subtitle')} />

        <div className="flex-1 p-8 overflow-y-auto">
          {earningsLoading && (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 size={40} className="text-emerald-500 animate-spin" />
              <p className="text-sm text-gray-400 mt-3">{t('lawyerEarnings.loading')}</p>
            </div>
          )}

          {earningsError && !earningsLoading && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <AlertCircle size={18} className="text-red-500 shrink-0" />
              <p className="text-sm text-red-700">{earningsError}</p>
            </div>
          )}

          {!earningsLoading && !earningsError && (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                <StatCard
                  icon={<Wallet size={20} />}
                  title={t('lawyerEarnings.totalEarned')}
                  value={`Rs. ${parseFloat(summary?.total_earned || 0).toLocaleString()}`}
                  subtitle={t('lawyerEarnings.netEarnings')}
                  color="emerald"
                />
                <StatCard
                  icon={<TrendingUp size={20} />}
                  title={t('lawyerEarnings.fromClients')}
                  value={`Rs. ${parseFloat(summary?.total_received_from_clients || 0).toLocaleString()}`}
                  subtitle={t('lawyerEarnings.grossAmount')}
                  color="blue"
                />
                <StatCard
                  icon={<Percent size={20} />}
                  title={t('lawyerEarnings.platformFee')}
                  value={`Rs. ${parseFloat(summary?.total_platform_fee || 0).toLocaleString()}`}
                  subtitle={`${summary?.commission_rate || 0}% ${t('lawyerEarnings.commission')}`}
                  color="amber"
                />
                <StatCard
                  icon={<Hash size={20} />}
                  title={t('lawyerEarnings.totalTransactions')}
                  value={summary?.total_transactions || 0}
                  subtitle={t('lawyerEarnings.completedPayments')}
                  color="violet"
                />
              </div>

              {/* Payment History */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{t('lawyerEarnings.paymentHistory')}</h2>
                    <p className="text-sm text-gray-400 mt-0.5">{t('lawyerEarnings.allPayments')}</p>
                  </div>
                  {allHistory.length > 0 && (
                    <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
                      {allHistory.length} transaction{allHistory.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {payments.length === 0 ? (
                  <div className="px-6 py-20 text-center">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <DollarSign size={28} className="text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-semibold">No transactions yet</p>
                    <p className="text-sm text-gray-400 mt-1">Payments and requests will appear here</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50/80">
                          <th className="text-left py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                          <th className="text-left py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                          <th className="text-right py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                          <th className="text-right py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fee</th>
                          <th className="text-right py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Earning</th>
                          <th className="text-center py-3.5 px-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allHistory.map((item, idx) => (
                          <tr
                            key={`${item.type}-${item.id}`}
                            className={`group transition-colors hover:bg-emerald-50/40 ${
                              idx !== allHistory.length - 1 ? 'border-b border-gray-100' : ''
                            }`}
                          >
                            <td className="py-4 px-5">
                              <div className="flex items-center gap-3">
                                <img
                                  src={getImageUrl(item.display_image, item.display_client)}
                                  alt={item.display_client || 'Client'}
                                  className="w-9 h-9 rounded-full object-cover shrink-0 shadow-sm"
                                />
                                <div className="flex flex-col">
                                  <span className="text-sm font-semibold text-gray-800">{item.display_client || 'Client'}</span>
                                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">{item.title}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-5">
                              <span className="flex items-center gap-1.5 text-sm text-gray-500">
                                <Calendar size={13} className="text-gray-400" />
                                {formatDate(item.date)}
                              </span>
                            </td>
                            <td className="py-4 px-5 text-right text-sm font-medium text-gray-700">
                              Rs. {parseFloat(item.display_amount).toLocaleString()}
                            </td>
                            <td className="py-4 px-5 text-right">
                              {item.display_fee !== '—' ? (
                                <span className="text-sm font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-md">
                                  -Rs. {parseFloat(item.display_fee).toLocaleString()}
                                </span>
                              ) : (
                                <span className="text-xs text-gray-300 italic">Pending</span>
                              )}
                            </td>
                            <td className="py-4 px-5 text-right">
                              {item.display_earning !== '—' ? (
                                <span className="inline-flex items-center gap-1 text-sm font-bold text-emerald-600">
                                  <ArrowUpRight size={14} className="text-emerald-500" />
                                  Rs. {parseFloat(item.display_earning).toLocaleString()}
                                </span>
                              ) : (
                                <span className="text-xs text-gray-300 italic">Pending</span>
                              )}
                            </td>
                            <td className="py-4 px-5 text-center">
                              {getStatusBadge(item.display_status)}
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
      </main>
    </div>
  );
};

export default Earning;
