import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Bell, User, LogOut } from "lucide-react";

const DashHeader = ({ title, subtitle, notificationCount = 3 }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleProfile = () => {
    navigate("/profile");
    setOpen(false);
  };

  const handleLogout = () => {
    // Add logout logic here
    navigate("/login");
    setOpen(false);
  };

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

          {/* Profile Avatar with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-[#0F1A3D] text-white hover:bg-blue-950 transition font-semibold"
            >
              {user?.name?.charAt(0) || "U"}
            </button>

            {/* Dropdown Menu */}
            {open && (
              <div className="absolute right-0 mt-3 w-56 bg-slate-900 rounded-lg shadow-xl overflow-hidden z-50 border border-slate-700">
                {/* Profile Section */}
                <div className="px-4 py-4 border-b border-slate-700 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-yellow-400 text-slate-900 flex items-center justify-center font-bold text-lg">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{user?.name || "User"}</p>
                  </div>
                </div>

                {/* Menu Items */}
                <button
                  onClick={handleProfile}
                  className="flex items-center gap-2 w-full px-4 py-3 text-sm text-gray-200 hover:bg-slate-800 transition"
                >
                  Go to Dashboard
                </button>

                <button
                  onClick={handleProfile}
                  className="flex items-center gap-2 w-full px-4 py-3 text-sm text-gray-200 hover:bg-slate-800 transition border-t border-slate-700"
                >
                  <User size={16} />
                  View Profile
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-3 text-sm text-red-500 hover:bg-slate-800 transition border-t border-slate-700"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashHeader;
