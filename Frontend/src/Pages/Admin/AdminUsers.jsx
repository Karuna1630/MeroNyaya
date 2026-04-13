import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Phone, 
  Calendar,
  Shield,
  Trash2,
  CheckCircle,
  XCircle,
  ToggleLeft,
  ToggleRight,
  X
} from 'lucide-react';
import Sidebar from './Sidebar';
import AdminDashHeader from './AdminDashHeader';
import Statcard from './Statcard';
import { fetchAdminStats, updateUserStatus } from '../slices/adminSlice';
import Pagination from '../../components/Pagination';

const AdminUsers = () => {
  const dispatch = useDispatch();
  const { stats, statsLoading } = useSelector((state) => state.admin);
  const users = stats?.users || [];
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    dispatch(fetchAdminStats());
  }, [dispatch]);

  // Filtering Logic
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' 
      ? user.role?.toLowerCase() !== 'superadmin' 
      : user.role?.toLowerCase() === roleFilter.toLowerCase();
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' ? user.is_active : !user.is_active);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminDashHeader 
          title="User Management" 
          subtitle="Manage system users, lawyers, and administrators"
        />

        <div className="p-8">
          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Statcard
              icon={<Users size={20} />}
              title="Total Users"
              value={statsLoading ? "..." : stats.totalUsers}
              subtitle="Registered accounts"
              color="blue"
            />
            <Statcard
              icon={<UserCheck size={20} />}
              title="Total Clients"
              value={statsLoading ? "..." : stats.totalClients}
              subtitle="Client accounts"
              color="purple"
            />
            <Statcard
              icon={<Shield size={20} />}
              title="Total Lawyers"
              value={statsLoading ? "..." : stats.totalLawyers}
              subtitle="Legal professionals"
              color="amber"
            />
          </div>

          {/* Filters and Search */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                />
              </div>
              
              <div className="flex gap-4 w-full md:w-auto">
                <select 
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-all bg-white"
                >
                  <option value="all">All Roles (Clients & Lawyers)</option>
                  <option value="client">Clients</option>
                  <option value="lawyer">Lawyers</option>
                </select>

                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-all bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left border-b border-gray-100">
                    <th className="py-4 px-6 text-xs font-semibold text-gray-600 uppercase">User</th>
                    <th className="py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Role</th>
                    <th className="py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="py-4 px-6 text-xs font-semibold text-gray-600 uppercase">Joined</th>
                    <th className="py-4 px-6 text-xs font-semibold text-gray-600 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {statsLoading ? (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-gray-500">Loading users...</td>
                    </tr>
                  ) : paginatedUsers.length > 0 ? (
                    paginatedUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold overflow-hidden">
                              {user.profile_image ? (
                                <img src={user.profile_image} alt={user.name} className="w-full h-full object-cover" />
                              ) : (
                                (user.name || user.email || 'U').charAt(0).toUpperCase()
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{user.name || 'No Name'}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                           <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                             user.role === 'Lawyer' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                             user.role === 'SuperAdmin' ? 'bg-red-50 text-red-600 border border-red-100' :
                             'bg-blue-50 text-blue-600 border border-blue-100'
                           }`}>
                             {user.role}
                           </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                              user.is_active 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {user.is_active ? <CheckCircle size={14} /> : <XCircle size={14} />}
                            {user.is_active ? 'Active' : 'Inactive'}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-500">
                          {new Date(user.date_joined).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button 
                            onClick={() => handleViewUser(user)}
                            className="px-4 py-2 bg-[#0F1A3D] text-white rounded-lg hover:bg-[#0B1430] transition-all text-xs font-semibold shadow-sm"
                            title="View Details"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="py-12 text-center text-gray-500">No users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={filteredUsers.length}
            />
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
              <h2 className="text-xl font-bold text-gray-900">User Profile</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-100 p-2 rounded-full hover:bg-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold mb-4 border-4 border-blue-50 shadow-sm overflow-hidden">
                  {selectedUser.profile_image ? (
                    <img src={selectedUser.profile_image} alt={selectedUser.name} className="w-full h-full object-cover" />
                  ) : (
                    (selectedUser.name || selectedUser.email || 'U').charAt(0).toUpperCase()
                  )}
                </div>
                <h3 className="text-xl font-bold text-gray-900">{selectedUser.name || 'No Name'}</h3>
                <p className="text-gray-500 text-sm">{selectedUser.role}</p>
                
                <div className="flex gap-2 mt-4">
                   <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedUser.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                     {selectedUser.is_active ? 'Account Active' : 'Account Inactive'}
                   </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Mail size={18} className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase">Email Address</p>
                    <p className="text-sm font-medium text-gray-900">{selectedUser.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Phone size={18} className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase">Phone Number</p>
                    <p className="text-sm font-medium text-gray-900">{selectedUser.phone || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Calendar size={18} className="text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 font-semibold uppercase">Date Joined</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(selectedUser.date_joined).toLocaleDateString(undefined, { 
                        year: 'numeric', month: 'long', day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-8 py-2.5 bg-gray-200 text-gray-800 font-bold rounded-xl hover:bg-gray-300 transition-colors text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
