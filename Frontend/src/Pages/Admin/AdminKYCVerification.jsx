import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import Sidebar from './Sidebar';
import AdminDashHeader from './AdminDashHeader';

const AdminKYCVerification = () => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedKYC, setSelectedKYC] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [kycRequests, setKycRequests] = useState([
    {
      id: 'KYC-001',
      name: 'Adv. Ram Kumar',
      contact: 'ram.kumar@email.com',
      status: 'Pending',
      date: 'Jan 27, 2026'
    },
    {
      id: 'KYC-002',
      name: 'Adv. Sita Sharma',
      contact: 'sita.sharma@email.com',
      status: 'Pending',
      date: 'Jan 26, 2026'
    },
    {
      id: 'KYC-003',
      name: 'Adv. Hari Prasad',
      contact: 'hari.prasad@email.com',
      status: 'Approved',
      date: 'Jan 25, 2026'
    },
    {
      id: 'KYC-004',
      name: 'Adv. Maya Thapa',
      contact: 'maya.thapa@email.com',
      status: 'Rejected',
      date: 'Jan 24, 2026'
    },
    {
      id: 'KYC-005',
      name: 'Adv. Krishna Bhattarai',
      contact: 'krishna.b@email.com',
      status: 'Pending',
      date: 'Jan 23, 2026'
    },
    {
      id: 'KYC-006',
      name: 'Adv. Deepak Shrestha',
      contact: 'deepak.s@email.com',
      status: 'Pending',
      date: 'Jan 22, 2026'
    },
    {
      id: 'KYC-007',
      name: 'Adv. Sarita Karki',
      contact: 'sarita.karki@email.com',
      status: 'Approved',
      date: 'Jan 21, 2026'
    },
    {
      id: 'KYC-008',
      name: 'Adv. Bikash Pokharel',
      contact: 'bikash.p@email.com',
      status: 'Pending',
      date: 'Jan 20, 2026'
    }
  ]);

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold";
    
    switch (status) {
      case 'Pending':
        return (
          <span className={`${baseClasses} bg-[#1e3a5f] text-white`}>
            <span className="w-2 h-2 rounded-full bg-white"></span>
            Pending
          </span>
        );
      case 'Approved':
        return (
          <span className={`${baseClasses} bg-green-500 text-white`}>
            <span className="w-2 h-2 rounded-full bg-white"></span>
            Approved
          </span>
        );
      case 'Rejected':
        return (
          <span className={`${baseClasses} bg-red-500 text-white`}>
            <span className="w-2 h-2 rounded-full bg-white"></span>
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const handleApprove = (kycId) => {
    // TODO: Call API to approve KYC
    setKycRequests(prevRequests =>
      prevRequests.map(request =>
        request.id === kycId
          ? { ...request, status: 'Approved' }
          : request
      )
    );
    
    // Show success toast (you can use react-toastify)
    alert(`KYC ${kycId} has been approved successfully!`);
  };

  const handleRejectClick = (kyc) => {
    setSelectedKYC(kyc);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleRejectConfirm = () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    // TODO: Call API to reject KYC with reason
    setKycRequests(prevRequests =>
      prevRequests.map(request =>
        request.id === selectedKYC.id
          ? { ...request, status: 'Rejected' }
          : request
      )
    );

    // Show success toast
    alert(`KYC ${selectedKYC.id} has been rejected.`);
    
    // Close modal and reset
    setShowRejectModal(false);
    setSelectedKYC(null);
    setRejectionReason('');
  };

  const handleCancelReject = () => {
    setShowRejectModal(false);
    setSelectedKYC(null);
    setRejectionReason('');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 ml-64">
        <AdminDashHeader 
          title="Lawyer KYC Verification" 
          subtitle="Review and manage lawyer identity verification requests"
        />

        <div className="p-8">
          {/* KYC Verification Table */}
          <div className="bg-white rounded-2xl p-8 shadow-md">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">KYC Verification Requests</h2>
              <p className="text-sm text-gray-600 mt-1">
                Total: {kycRequests.length} | 
                Pending: {kycRequests.filter(r => r.status === 'Pending').length} | 
                Approved: {kycRequests.filter(r => r.status === 'Approved').length} | 
                Rejected: {kycRequests.filter(r => r.status === 'Rejected').length}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    <th className="text-left py-4 px-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      KYC ID
                    </th>
                    <th className="text-left py-4 px-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Lawyer Name
                    </th>
                    <th className="text-left py-4 px-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="text-left py-4 px-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left py-4 px-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Submitted Date
                    </th>
                    <th className="text-center py-4 px-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {kycRequests.map((request) => (
                    <tr 
                      key={request.id} 
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-3 text-sm font-semibold text-gray-900">
                        {request.id}
                      </td>
                      <td className="py-4 px-3 text-sm font-medium text-gray-900">
                        {request.name}
                      </td>
                      <td className="py-4 px-3 text-sm text-gray-600">
                        {request.contact}
                      </td>
                      <td className="py-4 px-3">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="py-4 px-3 text-sm text-gray-600">
                        {request.date}
                      </td>
                      <td className="py-4 px-3">
                        {request.status === 'Pending' ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleApprove(request.id)}
                              className="px-4 py-1.5 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectClick(request)}
                              className="px-4 py-1.5 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-center">
                            <span className="text-sm text-gray-400">-</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="text-red-600" size={20} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Reject Lawyer Verification</h3>
              </div>
              <button
                onClick={handleCancelReject}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">KYC ID:</span> {selectedKYC?.id}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-semibold">Lawyer:</span> {selectedKYC?.name}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  rows="4"
                  placeholder="Please provide a detailed reason for rejection..."
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
              <button
                onClick={handleCancelReject}
                className="px-5 py-2.5 text-gray-700 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                className="px-5 py-2.5 text-white bg-red-500 rounded-lg font-medium hover:bg-red-600 transition-colors"
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
