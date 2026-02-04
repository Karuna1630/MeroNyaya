import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Bell, User, LogOut } from "lucide-react";
import { fetchUserProfile } from "../slices/profileSlice";
import { logoutUser } from "../slices/auth";

const ClientDashHeader = ({ title, subtitle }) => {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { userProfile } = useSelector((state) => state.profile);

  const profile = user || userProfile;
  const avatarSrc = profile?.profile_image;

  useEffect(() => {
    if (isAuthenticated && user) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, isAuthenticated, user?.id]);

  const isDashboardActive = location.pathname === "/clientdashboard";

  const handleDashboard = () => {
    if (!isDashboardActive) {
      navigate("/clientdashboard");
    }
    setOpen(false);
  };

  const handleViewProfile = () => {
    navigate("/viewprofile");
    setOpen(false);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
    setOpen(false);
  };

  return (
    <div className="bg-white border-b-2 border-slate-300 px-8 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[#0F1A3D]">
            {title}
          </h2>
          <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 hover:bg-gray-100 rounded-full transition">
            <Bell size={24} className="text-gray-600" />
            <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </button>

          {/* Profile Avatar with Dropdown */}
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-[#0F1A3D] text-white hover:bg-blue-950 transition font-semibold overflow-hidden"
            >
              {avatarSrc ? (
                <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                profile?.name?.charAt(0) || "U"
              )}
            </button>

            {/* Dropdown Menu */}
            {open && (
              <div className="absolute right-0 mt-3 w-56 bg-slate-900 rounded-lg shadow-xl overflow-hidden z-50 border border-slate-700">
                {/* Profile Section */}
                <div className="px-4 py-4 border-b border-slate-700 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-yellow-400 text-slate-900 flex items-center justify-center font-bold text-lg">
                    {avatarSrc ? (
                      <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      profile?.name?.charAt(0) || "U"
                    )}
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">{profile?.name || "User"}</p>
                  </div>
                </div>

                {/* Menu Items */}
                <button
                  onClick={handleDashboard}
                  className={`flex items-center gap-2 w-full px-4 py-3 text-sm transition ${
                    isDashboardActive
                      ? "bg-slate-800 text-yellow-400 font-semibold"
                      : "text-gray-200 hover:bg-slate-800"
                  }`}
                >
                  Go to Dashboard
                </button>

                <button
                  onClick={handleViewProfile}
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

export default ClientDashHeader;