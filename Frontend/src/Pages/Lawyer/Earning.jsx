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
} from 'lucide-react';
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
    initiated: {
      label: 'Initiated',
      icon: <Clock size={12} />,
      classes: 'bg-blue-50 text-blue-700 ring-1 ring-blue-600/20',
    },
    failed: {
      label: 'Failed',
      icon: <XCircle size={12} />,
      classes: 'bg-red-50 text-red-700 ring-1 ring-red-600/20',
    },
    refunded: {
      label: 'Refunded',
      icon: <RotateCcw size={12} />,
      classes: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20',
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

      <main className="flex-1 ml-64 flex flex-col overflow-hidden">
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
                  {payments.length > 0 && (
                    <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
                      {payments.length} payment{payments.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {payments.length === 0 ? (
                  <div className="px-6 py-20 text-center">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <DollarSign size={28} className="text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-semibold">No payments yet</p>
                    <p className="text-sm text-gray-400 mt-1">Complete consultations to start earning</p>
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
                        {payments.map((payment, idx) => (
                          <tr
                            key={payment.id}
                            className={`group transition-colors hover:bg-emerald-50/40 ${
                              idx !== payments.length - 1 ? 'border-b border-gray-100' : ''
                            }`}
                          >
                            <td className="py-4 px-5">
                              <div className="flex items-center gap-3">
                                <img
                                  src={getImageUrl(payment.user_profile_image, payment.user_name)}
                                  alt={payment.user_name || 'Client'}
                                  className="w-9 h-9 rounded-full object-cover shrink-0 shadow-sm"
                                />
                                <span className="text-sm font-semibold text-gray-800">{payment.user_name || 'Client'}</span>
                              </div>
                            </td>
                            <td className="py-4 px-5">
                              <span className="flex items-center gap-1.5 text-sm text-gray-500">
                                <Calendar size={13} className="text-gray-400" />
                                {formatDate(payment.created_at)}
                              </span>
                            </td>
                            <td className="py-4 px-5 text-right text-sm font-medium text-gray-700">
                              Rs. {parseFloat(payment.total_amount).toLocaleString()}
                            </td>
                            <td className="py-4 px-5 text-right">
                              <span className="text-sm font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-md">
                                -Rs. {parseFloat(payment.platform_fee).toLocaleString()}
                              </span>
                            </td>
                            <td className="py-4 px-5 text-right">
                              <span className="inline-flex items-center gap-1 text-sm font-bold text-emerald-600">
                                <ArrowUpRight size={14} className="text-emerald-500" />
                                Rs. {parseFloat(payment.lawyer_earning).toLocaleString()}
                              </span>
                            </td>
                            <td className="py-4 px-5 text-center">
                              {getStatusBadge(payment.status)}
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
