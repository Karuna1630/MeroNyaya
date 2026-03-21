import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Home,
  Briefcase,
  Calendar,
  MessageSquare,
  CreditCard,
  LogOut,
  Search,
  Clock,
  X,
} from "lucide-react";
import { GoLaw } from "react-icons/go";
import { useSidebar } from "../../context/SidebarContext";

const Sidebar = () => {
  const { isOpen, closeSidebar } = useSidebar();
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const handleHome = () => {
    navigate("/");
    closeSidebar();
  };

  const handleNavigation = (path) => {
    navigate(path);
    closeSidebar();
  };

  const menuItems = [
    { icon: Home, label: t('navigation.dashboard'), path: "/clientdashboard" },
    { icon: Search, label: t('navigation.findLawyers'), path: "/client/findlawyers" },
    { icon: Briefcase, label: t('navigation.myCases'), path: "/clientcase" },
    { icon: Clock, label: t('navigation.consultations'), path: "/client/consultation" },
    { icon: Calendar, label: t('navigation.appointments'), path: "/clientappointment" },
    { icon: MessageSquare, label: t('navigation.messages'), path: "/clientmessage" },
    { icon: CreditCard, label: t('navigation.payments'), path: "/clientpayment" },
  ];

  // Function to check if a menu item is active based on the current location
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
          {menuItems.map(({ icon: Icon, label, path }) => (
            <div
              key={label}
              onClick={() => handleNavigation(path)}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer transition ${
                isActive(path)
                  ? "bg-blue-800 text-white border-l-4 border-yellow-500"
                  : "hover:bg-blue-800/50"
              }`}
            >
              <Icon size={18} />
              <span className="text-sm font-medium">{label}</span>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
