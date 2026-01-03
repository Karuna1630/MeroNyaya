import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Briefcase,
  Calendar,
  MessageSquare,
  DollarSign,
  LogOut,
} from "lucide-react";
import { GoLaw } from "react-icons/go";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/lawyerdashboard" },
    { icon: Briefcase, label: "My Cases", path: "/cases" },
    { icon: Calendar, label: "Appointments", path: "/appointments" },
    { icon: MessageSquare, label: "Messages", path: "/messages", badge: 1 },
    { icon: DollarSign, label: "Earnings", path: "/earnings" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-64 bg-[#0F1A3D] text-white min-h-screen flex flex-col fixed left-0 top-0">
      {/* LOGO */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-blue-800">
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
