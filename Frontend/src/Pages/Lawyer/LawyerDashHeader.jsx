import React from "react";
import { Bell, User } from "lucide-react";

const DashHeader = ({ title, subtitle, notificationCount = 3 }) => {
  return (
    <div className="bg-white border-b-2 border-slate-300 px-8 py-4 shadow-sm">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#0F1A3D]">{title}</h2>
          <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 hover:bg-gray-100 rounded-full transition">
            <Bell size={24} className="text-gray-600" />
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                {notificationCount}
              </span>
            )}
          </button>

          <button className="flex items-center justify-center w-10 h-10 rounded-full bg-[#0F1A3D] text-white hover:bg-blue-950 transition">
            <User size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashHeader;
