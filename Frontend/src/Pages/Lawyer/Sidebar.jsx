import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
} from "lucide-react";
import { GoLaw } from "react-icons/go";

const Sidebar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const handleHome = () => {
    navigate("/");
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
    <aside className="w-64 bg-[#0F1A3D] text-white min-h-screen flex flex-col fixed left-0 top-0">
      {/* LOGO */}
      <div onClick={handleHome} className="flex items-center gap-2 px-6 py-5 border-b border-blue-800 cursor-pointer hover:opacity-80 transition">
        <div className="bg-yellow-500 text-blue-900 p-2 rounded-lg">
          <GoLaw size={22} />
        </div>
        <h1 className="text-lg font-bold">
          Mero<span className="text-yellow-500">Nyaya</span>
        </h1>
      </div>

      {/* MENU */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map(({ icon: Icon, label, path, badge }) => (
          <div
            key={label}
            onClick={() => navigate(path)}
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
  );
};

export default Sidebar;
