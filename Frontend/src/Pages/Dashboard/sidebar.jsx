import React from "react";
import {
  Home,
  Briefcase,
  Calendar,
  MessageSquare,
  CreditCard,
  LogOut,
} from "lucide-react";
import { GoLaw } from "react-icons/go";

const sidebar = () => {
  return (
    <aside className="w-64 bg-blue-900 text-white min-h-screen flex flex-col">
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
        {[
          { icon: Home, label: "Dashboard" },
          { icon: Briefcase, label: "My Cases" },
          { icon: Calendar, label: "Appointments" },
          { icon: MessageSquare, label: "Messages" },
          { icon: CreditCard, label: "Payments" },
        ].map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-3 px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-800 transition"
          >
            <Icon size={18} />
            <span className="text-sm">{label}</span>
          </div>
        ))}
      </nav>

      {/* USER */}
      <div className="px-6 py-4 border-t border-blue-800">
        <p className="text-sm font-semibold">Karuna Giri</p>
        <p className="text-xs text-gray-300">karuna@gmail.com</p>

        <button className="flex items-center gap-2 mt-4 text-sm text-red-300 hover:text-red-400">
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default sidebar;
