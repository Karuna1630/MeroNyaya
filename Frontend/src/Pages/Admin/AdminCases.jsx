import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Briefcase, 
  Clock, 
  CheckCircle, 
  X,
  FileText,
  AlertCircle
} from 'lucide-react';
import Sidebar from './Sidebar';
import AdminDashHeader from './AdminDashHeader';
import Statcard from './Statcard';
import { fetchCases } from '../slices/caseSlice';
import Pagination from '../../components/Pagination';

const AdminCases = () => {
  const dispatch = useDispatch();
  const { cases, casesLoading } = useSelector((state) => state.case);
  const [selectedCase, setSelectedCase] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    dispatch(fetchCases({}));
  }, [dispatch]);

  // Statistics Calculation
  const totalCases = cases?.length || 0;
  const activeCases = cases?.filter(c => ['in_progress', 'accepted'].includes(c.status)).length || 0;
  const completedCases = cases?.filter(c => c.status === 'completed').length || 0;

  // Pagination Logic
  const totalPages = Math.ceil((cases?.length || 0) / itemsPerPage);
  const paginatedCases = cases?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleViewCase = (caseObj) => {
    setSelectedCase(caseObj);
    setIsModalOpen(true);
  };

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold";
    switch ((status || '').toLowerCase()) {
      case 'public':
      case 'proposals_received':
      case 'sent_to_lawyers':
        return <span className={`${baseClasses} bg-blue-100 text-blue-700`}>Open</span>;
      case 'accepted':
      case 'in_progress':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-700`}>Active</span>;
      case 'completed':
        return <span className={`${baseClasses} bg-green-100 text-green-700`}>Completed</span>;
      case 'cancelled':
      case 'rejected':
        return <span className={`${baseClasses} bg-red-100 text-red-700`}>Cancelled</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-700`}>{status}</span>;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminDashHeader 
          title="Case Management" 
          subtitle="View and manage all legal cases in the system"
        />

        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Statcard
              icon={<Briefcase size={20} />}
              title="Total Cases"
              value={casesLoading ? "..." : totalCases}
              subtitle="All cases created"
              color="blue"
            />
            <Statcard
              icon={<Clock size={20} />}
              title="Active Cases"
              value={casesLoading ? "..." : activeCases}
              subtitle="In progress or accepted"
              color="yellow"
            />
            <Statcard
              icon={<CheckCircle size={20} />}
              title="Completed Cases"
              value={casesLoading ? "..." : completedCases}
              subtitle="Successfully resolved"
              color="green"
            />
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">All Cases List</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-left">
                    <th className="py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Case Title</th>
                    <th className="py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Client</th>
                    <th className="py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Lawyer</th>
                    <th className="py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                    <th className="py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                    <th className="py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {casesLoading ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-gray-500">Loading cases...</td>
                    </tr>
                  ) : paginatedCases?.length > 0 ? (
                    paginatedCases.map((c) => (
                      <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6">
                          <p className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">{c.case_title}</p>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">{c.client_name || 'Unknown'}</td>
                        <td className="py-4 px-6 text-sm text-gray-600">{c.lawyer_name || 'Unassigned'}</td>
                        <td className="py-4 px-6 text-sm text-gray-600">{c.case_category}</td>
                        <td className="py-4 px-6">{getStatusBadge(c.status)}</td>
                        <td className="py-4 px-6 text-sm text-gray-600">{new Date(c.created_at).toLocaleDateString()}</td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleViewCase(c)}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-gray-500">No cases found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={cases?.length || 0}
          />
        </div>
      </div>

      {/* Case Details Modal */}
      {isModalOpen && selectedCase && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">Case Details</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-100 p-2 rounded-full hover:bg-gray-200"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Header Info */}
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-2xl font-bold text-gray-900">{selectedCase.case_title}</h3>
                  {getStatusBadge(selectedCase.status)}
                </div>
                <div className="flex gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <AlertCircle size={16} /> {selectedCase.urgency_level} Urgency
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText size={16} /> {selectedCase.case_category}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-gray-700 text-sm whitespace-pre-line">{selectedCase.case_description}</p>
              </div>

              {/* Users */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-gray-100 p-4 rounded-xl">
                  <h4 className="font-semibold text-gray-500 text-xs uppercase mb-1">Client</h4>
                  <p className="text-gray-900 font-medium">{selectedCase.client_name || 'N/A'}</p>
                </div>
                <div className="border border-gray-100 p-4 rounded-xl">
                  <h4 className="font-semibold text-gray-500 text-xs uppercase mb-1">Assigned Lawyer</h4>
                  <p className="text-gray-900 font-medium">{selectedCase.lawyer_name || 'Unassigned'}</p>
                </div>
              </div>
              
              {/* Extra details (optional) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-gray-100 p-4 rounded-xl">
                  <h4 className="font-semibold text-gray-500 text-xs uppercase mb-1">Case ID</h4>
                  <p className="text-gray-900 font-medium">#{selectedCase.id}</p>
                </div>
                <div className="border border-gray-100 p-4 rounded-xl">
                  <h4 className="font-semibold text-gray-500 text-xs uppercase mb-1">Created Date</h4>
                  <p className="text-gray-900 font-medium">{new Date(selectedCase.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
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

export default AdminCases;
