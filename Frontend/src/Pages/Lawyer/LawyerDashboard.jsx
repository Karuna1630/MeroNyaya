import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import StatCard from './Statcard.jsx';
import DashHeader from './LawyerDashHeader';
import { Briefcase, DollarSign, Calendar, MessageSquare, Star, Gavel, Trophy, GraduationCap, ArrowRight, AlertCircle } from 'lucide-react';
import axiosInstance from '../../axios/axiosinstance';

const LawyerDashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axiosInstance.get('/authentications/profile/');
        console.log('Full API Response:', response);
        console.log('Response Data:', response.data);
        console.log('User data loaded:', response.data.Result);
        console.log('is_kyc_verified value:', response.data.Result?.is_kyc_verified);
        setUserData(response.data.Result);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        console.error('Error response:', error.response?.data);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const getPriorityClasses = (priority) => {
    switch (priority) {
      case 'High Priority':
        return 'bg-rose-100 text-rose-700';
      case 'Medium Priority':
        return 'bg-amber-100 text-amber-700';
      case 'Low Priority':
        return 'bg-emerald-100 text-emerald-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getCaseStatusClasses = (status) => {
    switch (status) {
      case 'In Progress':
        return 'bg-blue-100 text-blue-700';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'Closed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getScheduleStatusClasses = (status) => {
    switch (status) {
      case 'Confirmed':
        return 'bg-emerald-100 text-emerald-700';
      case 'Pending':
        return 'bg-amber-100 text-amber-700';
      case 'Upcoming':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const statCards = [
    {
      icon: <Briefcase size={20} />,
      title: 'Active Cases',
      value: '12',
      subtitle: '+2 this month',
    },
    {
      icon: <DollarSign size={20} />,
      title: "This Month's Earnings",
      value: '₹ 85,000',
      subtitle: '+15% from last month',
    },
    {
      icon: <Calendar size={20} />,
      title: 'Appointments Today',
      value: '4',
      subtitle: '2 pending confirmation',
    },
    {
      icon: <MessageSquare size={20} />,
      title: 'Unread Messages',
      value: '8',
      subtitle: '3 urgent',
      
    },
  ];

  const recentCases = [
    {
      id: 1,
      title: 'Property Dispute Case',
      client: 'Sita Sharma vs. Local Authority',
      caseId: 'Case ID #LAW-2024-001',
      priority: 'High Priority',
      next: 'Next: Jan 15, 2025',
      status: 'In Progress',
      avatar: 'SS',
    },
    {
      id: 2,
      title: 'Contract Review',
      client: 'Rajesh Enterprises',
      caseId: 'Case ID #LAW-2024-002',
      priority: 'Medium Priority',
      next: 'Next: Jan 18, 2025',
      status: 'In Progress',
      avatar: 'RE',
    },
    {
      id: 3,
      title: 'Family Law Consultation',
      client: 'Priya Thapa',
      caseId: 'Case ID #LAW-2024-003',
      priority: 'Low Priority',
      next: 'Next: Jan 20, 2025',
      status: 'Pending',
      avatar: 'PT',
    },
    {
      id: 4,
      title: 'Divorce Settlement',
      client: 'Maya Devi',
      caseId: 'Case ID #LAW-2024-004',
      priority: 'Low Priority',
      next: 'Completed: Dec 28, 2024',
      status: 'Closed',
      avatar: 'MD',
    },
  ];

  const todaySchedule = [
    {
      id: 1,
      name: 'Maya Patel',
      type: 'Contract Law',
      time: '10:00 AM',
      status: 'Confirmed',
      avatar: 'MP',
    },
    {
      id: 2,
      name: 'Amit Shah',
      type: 'Contract Law',
      time: '2:00 PM',
      status: 'Pending',
      avatar: 'AS',
    },
    {
      id: 3,
      name: 'Sunita Rai',
      type: 'Family Law',
      time: '4:30 PM',
      status: 'Upcoming',
      avatar: 'SR',
    },
  ];

  const recentMessages = [
    {
      id: 1,
      name: 'Kiran Basnet',
      message: 'I submitted my review have been...',
      time: '2 min ago',
      avatar: 'KB',
      unread: true,
    },
    {
      id: 2,
      name: 'Deepak Sharma',
      message: 'Thank you for the consultation...',
      time: '1 hr ago',
      avatar: 'DS',
      unread: false,
    },
    {
      id: 3,
      name: 'Sita Sharma',
      message: 'When is the next hearing date?',
      time: '4 hour ago',
      avatar: 'SS',
      unread: true,
    },
  ];

  const bottomStats = [
    { icon: <Star size={20} />, value: '4.9', label: 'Client Rating' },
    { icon: <Gavel size={20} />, value: '156', label: 'Cases Handled' },
    { icon: <Trophy size={20} />, value: '89%', label: 'Success Rate' },
    { icon: <GraduationCap size={20} />, value: '8+', label: 'Years Experience' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="ml-64 flex-1 flex flex-col">
        <div className="sticky top-0 z-50 bg-white">
          <DashHeader
            title="Welcome back, Adv. Raha Kumari"
            subtitle="Here's an overview of your practice today"
            notificationCount={3}
          />
        </div>

        {/* Show KYC banner only if not verified */}
        {userData && !userData.is_kyc_verified && (
          <div className="px-6 pt-4 pb-2">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center gap-3 cursor-pointer hover:bg-amber-100 transition" onClick={() => navigate('/kyc')}>
              <AlertCircle className="text-amber-600 shrink-0" size={20} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-900">Haven't verified your Lawyer KYC yet?</p>
                <p className="text-xs text-amber-700">Complete your identity verification to unlock full platform access</p>
              </div>
              <ArrowRight className="text-amber-600 shrink-0" size={20} />
            </div>
          </div>
        )}

        <div className="flex-1 p-6 space-y-5 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-[#0F1A3D]">Recent Cases</h2>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-[#0F1A3D] text-sm font-semibold transition hover:bg-yellow-500 ">
                View All
                <ArrowRight size={16} />
              </button>
            </div>
            <div className="space-y-4">
              {recentCases.map((case_) => (
                <div key={case_.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition">
                  <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-purple-600 text-white font-bold flex items-center justify-center shrink-0">
                    {case_.avatar}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-semibold text-[#0F1A3D]">{case_.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600">Client: {case_.client}</p>
                    <p className="text-xs text-gray-400 flex items-center gap-2">
                      <span>{case_.caseId}</span>
                      <span className="text-gray-300">•</span>
                      <span>{case_.next}</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCaseStatusClasses(case_.status)}`}>
                      {case_.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-lg p-6 shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#0F1A3D]">Upcoming Appointments</h2>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[#0F1A3D] text-xs font-semibold transition hover:bg-yellow-500 ">
                  View All
                  <ArrowRight size={14} />
                </button>
              </div>
              <div className="space-y-4">
                {todaySchedule.map((appointment) => (
                  <div key={appointment.id} className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {appointment.avatar}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-[#0F1A3D]">{appointment.name}</h4>
                      <p className="text-xs text-gray-600">{appointment.type}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <p className="text-xs font-semibold text-[#0F1A3D]">{appointment.time}</p>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getScheduleStatusClasses(appointment.status)}`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#0F1A3D]">Recent Messages</h2>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[#0F1A3D] text-xs font-semibold transition hover:bg-yellow-500 ">
                  View All
                  <ArrowRight size={14} />
                </button>
              </div>
              <div className="space-y-4">
                {recentMessages.map((msg) => (
                  <div key={msg.id} className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-500 to-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {msg.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-[#0F1A3D]">{msg.name}</h4>
                        {msg.unread && <span className="w-2 h-2 bg-blue-600 rounded-full"></span>}
                      </div>
                      <p className="text-xs text-gray-600">{msg.message}</p>
                      <p className="text-xs text-gray-400 mt-1">{msg.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-6">
          {bottomStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow flex gap-4 items-center">
              <div className="w-14 h-14 rounded-lg bg-blue-100 text-blue-900 flex items-center justify-center shrink-0">
                {stat.icon}
              </div>
              <div>
                <div className="text-2xl font-bold text-[#0F1A3D]">{stat.value}</div>
                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
};

export default LawyerDashboard;