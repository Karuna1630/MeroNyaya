import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import {
  Grid,
  Briefcase,
  Calendar,
  MessageSquare,
  DollarSign,
  LogOut,
  Inbox,
  FolderOpen,
  Search,
  X,
} from "lucide-react";
import { GoLaw } from "react-icons/go";
import { useSidebar } from "../../context/SidebarContext";

const RESTRICTED_PATHS = ['/lawyerfindcases', '/lawyercaserequest', '/lawyercase', '/lawyerappointment', '/lawyermessage', '/lawyerearning'];

const Sidebar = () => {
  const { isOpen, closeSidebar } = useSidebar();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { status } = useSelector((state) => state.kyc || {});
  const { userProfile } = useSelector((state) => state.profile || {});

  // Check KYC verification
  const kycStatus = (status?.status || status?.kyc_status || status?.state || '').toLowerCase();
  const isKycVerified = userProfile?.is_kyc_verified === true || kycStatus === 'approved';

  const handleHome = () => {
    navigate("/");
    closeSidebar();
  };

  const handleNavigation = (path) => {
    // Block navigation if KYC not verified and path is restricted
    if (!isKycVerified && RESTRICTED_PATHS.includes(path)) {
      toast.warning('Your KYC is not verified. You can only navigate once KYC is verified.');
      return;
    }
    navigate(path);
    closeSidebar();
  };

  const menuItems = [
    { icon: Grid, label: t('navigation.dashboard'), path: "/lawyerdashboard" },
    { icon: Search, label: t('navigation.findCases'), path: "/lawyerfindcases" },
    { icon: Inbox, label: t('navigation.caseRequests'), path: "/lawyercaserequest" },
    { icon: FolderOpen, label: t('navigation.myCases'), path: "/lawyercase" },
    { icon: Calendar, label: t('navigation.appointments'), path: "/lawyerappointment" },
    { icon: MessageSquare, label: t('navigation.messages'), path: "/lawyermessage" },
    { icon: DollarSign, label: t('navigation.earnings'), path: "/lawyerearning" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300"
          onClick={closeSidebar}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0F1A3D] text-white flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        {/* LOGO */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-blue-800">
          <div onClick={handleHome} className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition">
            <div className="bg-yellow-500 text-blue-900 p-2 rounded-lg">
              <GoLaw size={22} />
            </div>
            <h1 className="text-lg font-bold">
              Mero<span className="text-yellow-500">Nyaya</span>
            </h1>
          </div>
          <button onClick={closeSidebar} className="md:hidden text-gray-400 hover:text-white transition">
            <X size={24} />
          </button>
        </div>

        {/* MENU */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map(({ icon: Icon, label, path, badge }) => (
            <div
              key={label}
              onClick={() => handleNavigation(path)}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition relative
                ${
                  isActive(path)
                    ? "bg-blue-800 text-white border-l-4 border-yellow-500"
                    : "hover:bg-blue-800/50"
                }
              `}
            >
              <Icon size={18} />
              <span className="text-sm font-medium">{label}</span>

              {badge && (
                <span className="ml-auto bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {badge}
                </span>
              )}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
