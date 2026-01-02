import React, { useState } from 'react';
import { Download, ArrowUpRight, ArrowDownLeft, CheckCircle, Clock, XCircle, Filter, Shield, Receipt, RefreshCw } from 'lucide-react';
import DashHeader from './DashHeader';

const Payments = () => {
  const [activeTab, setActiveTab] = useState('history');
  const [filterStatus, setFilterStatus] = useState('all');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('esewa');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Sample transaction data
  const transactions = [
    {
      id: 1,
      type: 'payment',
      title: 'Consultation Fee - Adv. Rajesh Sharma',
      caseType: 'Property Dispute',
      paymentMethod: 'eSewa',
      amount: 5000,
      status: 'completed',
      date: 'Dec 5, 2025'
    },
    {
      id: 2,
      type: 'payment',
      title: 'Document Filing Fee',
      caseType: 'Property Dispute',
      paymentMethod: 'Khalti',
      amount: 2500,
      status: 'completed',
      date: 'Dec 3, 2025'
    },
    {
      id: 3,
      type: 'payment',
      title: 'Consultation Fee - Adv. Priya Sharma',
      caseType: 'Divorce Proceedings',
      paymentMethod: 'eSewa',
      amount: 5000,
      status: 'pending',
      date: 'Dec 1, 2025'
    },
    {
      id: 4,
      type: 'refund',
      title: 'Refund - Cancelled Appointment',
      caseType: 'Employment Dispute',
      paymentMethod: 'eSewa',
      amount: 3000,
      status: 'completed',
      date: 'Nov 28, 2025'
    },
    {
      id: 5,
      type: 'payment',
      title: 'Retainer Fee - Adv. Sita Karki',
      caseType: 'Business Contract Review',
      paymentMethod: 'Khalti',
      amount: 15000,
      status: 'completed',
      date: 'Nov 25, 2025'
    },
    {
      id: 6,
      type: 'payment',
      title: 'Court Fee Deposit',
      caseType: 'Property Dispute',
      paymentMethod: 'eSewa',
      amount: 10000,
      status: 'failed',
      date: 'Nov 20, 2025'
    }
  ];

  // Filter transactions based on status
  const filteredTransactions = transactions.filter(transaction => {
    if (filterStatus === 'all') return true;
    return transaction.status === filterStatus;
  });

  // Get pending count
  const pendingCount = transactions.filter(t => t.status === 'pending').length;

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'pending':
        return <Clock className="text-yellow-500" size={16} />;
      case 'failed':
        return <XCircle className="text-red-500" size={16} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed':
        return 'text-green-600';
      case 'pending':
        return 'text-yellow-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTransactionIcon = (type) => {
    if (type === 'refund') {
      return <ArrowDownLeft className="text-green-600" size={20} />;
    }
    return <ArrowUpRight className="text-gray-600" size={20} />;
  };

  const handleProceedToPay = (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    alert(`Processing payment of Rs. ${amount} via ${paymentMethod === 'esewa' ? 'eSewa' : 'Khalti'}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashHeader 
        title="Payments" 
        subtitle="Manage your payments and transactions"
      />

      <div className="flex gap-6 p-8">
        {/* Main Content */}
        <div className="flex-1">
          {/* Tabs */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-6">
              <button
                onClick={() => setActiveTab('history')}
                className={`pb-2 font-medium transition-colors ${
                  activeTab === 'history'
                    ? 'text-gray-900 border-b-2 border-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Transaction History
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`pb-2 font-medium transition-colors ${
                  activeTab === 'pending'
                    ? 'text-gray-900 border-b-2 border-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Pending ({pendingCount})
              </button>
            </div>

            {/* Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                <Filter size={16} />
                <span className="text-sm font-medium">
                  {filterStatus === 'all' ? 'All Status' : 
                   filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                </span>
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showFilterDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => { setFilterStatus('all'); setShowFilterDropdown(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                  >
                    All Status
                  </button>
                  <button
                    onClick={() => { setFilterStatus('completed'); setShowFilterDropdown(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                  >
                    Completed
                  </button>
                  <button
                    onClick={() => { setFilterStatus('pending'); setShowFilterDropdown(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => { setFilterStatus('failed'); setShowFilterDropdown(false); }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                  >
                    Failed
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Transactions List */}
          <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    {getTransactionIcon(transaction.type)}
                  </div>

                  {/* Transaction Details */}
                  <div>
                    <h3 className="font-semibold text-gray-900">{transaction.title}</h3>
                    <p className="text-sm text-gray-600">
                      {transaction.caseType} • {transaction.paymentMethod}
                    </p>
                  </div>
                </div>

                {/* Amount and Status */}
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      {transaction.type === 'refund' ? '+' : '-'} Rs. {transaction.amount.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1 justify-end mt-1">
                      {getStatusIcon(transaction.status)}
                      <span className={`text-sm capitalize ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">{transaction.date}</span>
                    </div>
                  </div>

                  {/* Download Button */}
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition">
                    <Download size={20} className="text-gray-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Pay Sidebar */}
        <div className="w-96">
          <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Pay</h2>

            <form onSubmit={handleProceedToPay}>
              {/* Amount Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (Rs.)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  step="1"
                />
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('esewa')}
                    className={`px-6 py-3 rounded-lg font-semibold transition ${
                      paymentMethod === 'esewa'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    eSewa
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('khalti')}
                    className={`px-6 py-3 rounded-lg font-semibold transition ${
                      paymentMethod === 'khalti'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Khalti
                  </button>
                </div>
              </div>

              {/* Proceed Button */}
              <button
                type="submit"
                className="w-full bg-[#0F1A3D] text-white py-3 rounded-lg font-semibold hover:bg-blue-950 transition"
              >
                Proceed to Pay
              </button>
            </form>

            {/* Payment Information */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4">Payment Information</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Shield className="text-green-500 mt-0.5" size={20} />
                  <p className="text-sm text-gray-600">
                    All payments are secured with 256-bit encryption
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Receipt className="text-blue-500 mt-0.5" size={20} />
                  <p className="text-sm text-gray-600">
                    Digital receipts are generated automatically
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <RefreshCw className="text-orange-500 mt-0.5" size={20} />
                  <p className="text-sm text-gray-600">
                    Refunds processed within 5-7 business days
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payments;
