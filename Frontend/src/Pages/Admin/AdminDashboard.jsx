import React, { useState } from 'react';
import { 
  Users, 
  Scale, 
  Clock, 
  Calendar, 
  DollarSign, 
  FileText, 
  TrendingUp,
  AlertCircle 
} from 'lucide-react';
import Sidebar from './Sidebar';
import AdminDashHeader from './AdminDashHeader';
import Statcard from './Statcard';

const AdminDashboard = () => {
  const [stats] = useState({
    totalUsers: 1336,
    totalClients: 1247,
    totalLawyers: 89,
    pendingKYC: 12,
    activeAppointments: 45,
    totalRevenue: "Rs. 2,45,000",
    activeCases: 127,
    systemIssues: 3
  });

  const [kycRequests] = useState([
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
              value={stats.totalUsers.toLocaleString()}
              subtitle={`${stats.totalClients} Clients • ${stats.totalLawyers} Lawyers`}
              bgColor="bg-blue-100"
              iconColor="text-blue-600"
            />

            <Statcard
              icon={<Users size={20} />}
              title="Total Clients"
              value={stats.totalClients.toLocaleString()}
              subtitle="Active clients"
              bgColor="bg-cyan-100"
              iconColor="text-cyan-600"
            />

            <Statcard
              icon={<Scale size={20} />}
              title="Total Lawyers"
              value={stats.totalLawyers}
              subtitle="Verified professionals"
              bgColor="bg-indigo-100"
              iconColor="text-indigo-600"
            />

            <Statcard
              icon={<Clock size={20} />}
              title="Pending KYC Requests"
              value={stats.pendingKYC}
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
                  </tr>
                </thead>
                <tbody>
                  {kycRequests.map((request) => (
                    <tr 
                      key={request.id} 
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4.5 px-3 text-sm font-semibold text-gray-900">
                        {request.id}
                      </td>
                      <td className="py-4.5 px-3 text-sm font-medium text-gray-900">
                        {request.name}
                      </td>
                      <td className="py-4.5 px-3 text-sm text-gray-600">
                        {request.contact}
                      </td>
                      <td className="py-4.5 px-3">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="py-4.5 px-3 text-sm text-gray-600">
                        {request.date}
                      </td>
                    </tr>
                  ))}
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
