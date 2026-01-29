import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Users, 
  Scale, 
  Clock,
  AlertCircle 
} from 'lucide-react';
import Sidebar from './Sidebar';
import AdminDashHeader from './AdminDashHeader';
import Statcard from './Statcard';
import { fetchAdminStats, fetchKycList } from '../slices/adminSlice';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { stats, statsLoading, kycList, kycLoading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAdminStats());
    dispatch(fetchKycList());
  }, [dispatch]);

  // Calculate pending KYC count
  const pendingKycCount = Array.isArray(kycList) 
    ? kycList.filter(kyc => (kyc.status || '').toLowerCase() === 'pending').length 
    : 0;

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold";
    
    switch ((status || '').toLowerCase()) {
      case 'pending':
      case 'under_review':
      case 'in_review':
        return (
          <span className={`${baseClasses} bg-[#1e3a5f] text-white`}>
            <span className="w-2 h-2 rounded-full bg-white"></span>
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className={`${baseClasses} bg-green-500 text-white`}>
            <span className="w-2 h-2 rounded-full bg-white"></span>
            Approved
          </span>
        );
      case 'rejected':
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 ml-64">
        <AdminDashHeader 
          title="Admin Dashboard" 
          subtitle="System overview and quick actions"
        />

        <div className="p-8">
          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Statcard
              icon={<Users size={20} />}
              title="Total Users"
              value={statsLoading ? "..." : stats.totalUsers.toLocaleString()}
              subtitle={`${stats.totalClients} Clients • ${stats.totalLawyers} Lawyers`}
              bgColor="bg-blue-100"
              iconColor="text-blue-600"
            />

            <Statcard
              icon={<Users size={20} />}
              title="Total Clients"
              value={statsLoading ? "..." : stats.totalClients.toLocaleString()}
              subtitle="Active clients"
              bgColor="bg-cyan-100"
              iconColor="text-cyan-600"
            />

            <Statcard
              icon={<Scale size={20} />}
              title="Total Lawyers"
              value={statsLoading ? "..." : stats.totalLawyers}
              subtitle="Verified professionals"
              bgColor="bg-indigo-100"
              iconColor="text-indigo-600"
            />

            <Statcard
              icon={<Clock size={20} />}
              title="Pending KYC Requests"
              value={kycLoading ? "..." : pendingKycCount}
              subtitle="Requires verification"
              bgColor="bg-red-100"
              iconColor="text-red-600"
            />
          </div>

          {/* Recent KYC Requests Table */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent KYC Requests</h2>
              <button 
                className="text-blue-500 font-semibold text-sm px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
              >
                View All →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-100">
                    <th className="text-left py-4 px-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      User ID
                    </th>
                    <th className="text-left py-4 px-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Lawyer Name
                    </th>
                    <th className="text-left py-4 px-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="text-left py-4 px-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left py-4 px-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Submitted Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {kycLoading ? (
                    <tr>
                      <td colSpan="5" className="py-4 px-3 text-center text-gray-600">Loading...</td>
                    </tr>
                  ) : Array.isArray(kycList) && kycList.length > 0 ? (
                    kycList.slice(0, 10).map((kyc) => (
                      <tr 
                        key={kyc.id} 
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4.5 px-3 text-sm font-semibold text-gray-900">
                          {kyc.id}
                        </td>
                        <td className="py-4.5 px-3 text-sm font-medium text-gray-900">
                          {kyc.user_name || kyc.user?.name || kyc.lawyer_name || 'N/A'}
                        </td>
                        <td className="py-4.5 px-3 text-sm text-gray-600">
                          {kyc.user_email || kyc.user?.email || kyc.email || 'N/A'}
                        </td>
                        <td className="py-4.5 px-3">
                          {getStatusBadge(kyc.status)}
                        </td>
                        <td className="py-4.5 px-3 text-sm text-gray-600">
                          {kyc.created_at ? new Date(kyc.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-4 px-3 text-center text-gray-600">No KYC requests found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
