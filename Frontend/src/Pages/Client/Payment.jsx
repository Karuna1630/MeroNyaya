import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  Filter,
  Receipt,
  TrendingUp,
  AlertTriangle,
  Search,
  ChevronDown,
} from 'lucide-react';
import DashHeader from './ClientDashHeader';
import Sidebar from './sidebar';
import { fetchPaymentHistory } from '../slices/paymentSlice';

const Payment = () => {
  const dispatch = useDispatch();
  const { payments, paymentsLoading, paymentsError } = useSelector(
    (state) => state.payment
  );

  const [filterStatus, setFilterStatus] = useState('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    dispatch(fetchPaymentHistory());
  }, [dispatch]);

  // Compute stats
  const stats = useMemo(() => {
    const total = payments.length;
    const completed = payments.filter((p) => p.status === 'completed').length;
    const pending = payments.filter((p) => p.status === 'initiated').length;
    const failed = payments.filter((p) => p.status === 'failed').length;
    const totalAmount = payments
      .filter((p) => p.status === 'completed')
      .reduce((sum, p) => sum + parseFloat(p.total_amount || 0), 0);
    return { total, completed, pending, failed, totalAmount };
  }, [payments]);

  // Filter payments
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const statusMapping = { completed: 'completed', pending: 'initiated', failed: 'failed' };
      const matchesStatus =
        filterStatus === 'all' ||
        p.status === (statusMapping[filterStatus] || filterStatus);
      const matchesSearch =
        !searchQuery ||
        (p.lawyer_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.transaction_uuid || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.esewa_ref_id || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [payments, filterStatus, searchQuery]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      completed: {
        icon: <CheckCircle size={14} />,
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        ring: 'ring-emerald-200',
        label: 'Completed',
      },
      initiated: {
        icon: <Clock size={14} />,
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        ring: 'ring-amber-200',
        label: 'Pending',
      },
      failed: {
        icon: <XCircle size={14} />,
        bg: 'bg-red-50',
        text: 'text-red-700',
        ring: 'ring-red-200',
        label: 'Failed',
      },
      refunded: {
        icon: <CheckCircle size={14} />,
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        ring: 'ring-blue-200',
        label: 'Refunded',
      },
    };
    const s = statusMap[status] || statusMap['initiated'];
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${s.bg} ${s.text} ${s.ring}`}
      >
        {s.icon}
        {s.label || status}
      </span>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <div className="sticky top-0 z-50 bg-white">
          <DashHeader
            title="Payments"
            subtitle="Your transaction history"
          />
        </div>

        <div className="p-8 overflow-y-auto space-y-8">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Payments */}
            <div className="relative overflow-hidden rounded-2xl p-6 text-white shadow-lg bg-linear-to-br from-blue-500 to-blue-600 ring-1 ring-blue-500/20">
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
              <div className="absolute -right-2 -bottom-6 h-20 w-20 rounded-full bg-white/5" />
              <div className="relative z-10 flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-white/80">Total Payments</p>
                  <h3 className="text-2xl font-extrabold tracking-tight">{stats.total}</h3>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-400/20">
                  <CreditCard size={20} />
                </div>
              </div>
            </div>

            {/* Completed */}
            <div className="relative overflow-hidden rounded-2xl p-6 text-white shadow-lg bg-linear-to-br from-emerald-500 to-emerald-600 ring-1 ring-emerald-500/20">
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
              <div className="absolute -right-2 -bottom-6 h-20 w-20 rounded-full bg-white/5" />
              <div className="relative z-10 flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-white/80">Completed</p>
                  <h3 className="text-2xl font-extrabold tracking-tight">{stats.completed}</h3>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/20">
                  <CheckCircle size={20} />
                </div>
              </div>
            </div>

            {/* Pending */}
            <div className="relative overflow-hidden rounded-2xl p-6 text-white shadow-lg bg-linear-to-br from-amber-500 to-orange-500 ring-1 ring-amber-500/20">
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
              <div className="absolute -right-2 -bottom-6 h-20 w-20 rounded-full bg-white/5" />
              <div className="relative z-10 flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-white/80">Pending</p>
                  <h3 className="text-2xl font-extrabold tracking-tight">{stats.pending}</h3>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/20">
                  <Clock size={20} />
                </div>
              </div>
            </div>

            {/* Total Spent */}
            <div className="relative overflow-hidden rounded-2xl p-6 text-white shadow-lg bg-linear-to-br from-violet-500 to-purple-600 ring-1 ring-violet-500/20">
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
              <div className="absolute -right-2 -bottom-6 h-20 w-20 rounded-full bg-white/5" />
              <div className="relative z-10 flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-white/80">Total Spent</p>
                  <h3 className="text-2xl font-extrabold tracking-tight">
                    Rs. {stats.totalAmount.toLocaleString()}
                  </h3>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-400/20">
                  <TrendingUp size={20} />
                </div>
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex items-center justify-between">
            {/* Search */}
            <div className="relative w-80">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by lawyer, transaction ID..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 bg-white"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium bg-white hover:bg-gray-50 transition cursor-pointer"
              >
                <Filter size={16} className="text-gray-500" />
                <span>
                  {filterStatus === 'all'
                    ? 'All Status'
                    : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                </span>
                <ChevronDown size={14} className="text-gray-400" />
              </button>

              {showFilterDropdown && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-100 rounded-xl shadow-xl z-10 overflow-hidden">
                  {['all', 'completed', 'pending', 'failed'].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setFilterStatus(status);
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition ${
                        filterStatus === status
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-700'
                      }`}
                    >
                      {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Transaction History Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3.5 bg-gray-50/80 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <div className="col-span-3">Lawyer</div>
              <div className="col-span-2">Transaction ID</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-1">Method</div>
              <div className="col-span-2 text-right">Amount</div>
              <div className="col-span-2 text-center">Status</div>
            </div>

            {/* Loading State */}
            {paymentsLoading && (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-gray-500">Loading transactions...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {paymentsError && !paymentsLoading && (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center">
                    <AlertTriangle size={24} className="text-red-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">Failed to load transactions</p>
                  <p className="text-sm text-gray-500">{paymentsError}</p>
                  <button
                    onClick={() => dispatch(fetchPaymentHistory())}
                    className="mt-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {/* Empty State */}
            {!paymentsLoading && !paymentsError && filteredPayments.length === 0 && (
              <div className="flex items-center justify-center py-20">
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <Receipt size={24} className="text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">No transactions found</p>
                  <p className="text-sm text-gray-500">
                    {filterStatus !== 'all' || searchQuery
                      ? 'Try adjusting your filters'
                      : 'Your payment history will appear here'}
                  </p>
                </div>
              </div>
            )}

            {/* Transaction Rows */}
            {!paymentsLoading &&
              !paymentsError &&
              filteredPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-gray-50 hover:bg-gray-50/50 transition"
                >
                  {/* Lawyer */}
                  <div className="col-span-3 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-linear-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {(payment.lawyer_name || 'L')
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {payment.lawyer_name || 'Unknown Lawyer'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {payment.lawyer_email || `Appointment #${payment.appointment_id || '—'}`}
                      </p>
                    </div>
                  </div>

                  {/* Transaction ID */}
                  <div className="col-span-2">
                    <p className="text-sm text-gray-700 font-mono truncate">
                      {payment.transaction_uuid
                        ? payment.transaction_uuid.slice(0, 12) + '...'
                        : '—'}
                    </p>
                    {payment.esewa_ref_id && (
                      <p className="text-xs text-gray-400 truncate">
                        Ref: {payment.esewa_ref_id}
                      </p>
                    )}
                  </div>

                  {/* Date */}
                  <div className="col-span-2">
                    <p className="text-sm text-gray-700">{formatDate(payment.created_at)}</p>
                    <p className="text-xs text-gray-400">{formatTime(payment.created_at)}</p>
                  </div>

                  {/* Method */}
                  <div className="col-span-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                      {payment.payment_method || 'eSewa'}
                    </span>
                  </div>

                  {/* Amount */}
                  <div className="col-span-2 text-right">
                    <p className="text-sm font-bold text-gray-900">
                      Rs. {parseFloat(payment.total_amount || 0).toLocaleString()}
                    </p>
                    {payment.tax_amount && parseFloat(payment.tax_amount) > 0 && (
                      <p className="text-xs text-gray-400">
                        Tax: Rs. {parseFloat(payment.tax_amount).toLocaleString()}
                      </p>
                    )}
                  </div>

                  {/* Status */}
                  <div className="col-span-2 flex justify-center">
                    {getStatusBadge(payment.status)}
                  </div>
                </div>
              ))}
          </div>

          {/* Footer summary */}
          {!paymentsLoading && filteredPayments.length > 0 && (
            <div className="flex items-center justify-between text-sm text-gray-500 px-1">
              <p>
                Showing {filteredPayments.length} of {payments.length} transactions
              </p>
              <p>
                Total:{' '}
                <span className="font-semibold text-gray-900">
                  Rs.{' '}
                  {filteredPayments
                    .filter((p) => p.status === 'completed')
                    .reduce((sum, p) => sum + parseFloat(p.total_amount || 0), 0)
                    .toLocaleString()}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payment;
