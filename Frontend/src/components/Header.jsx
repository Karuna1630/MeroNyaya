import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { GoLaw } from "react-icons/go";
import { User, LogOut } from "lucide-react";
import { logoutUser } from "../Pages/slices/auth"; 

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  const handleProfile = () => {
    const userRole = user?.role;
    if (userRole === "Client") navigate("/clientdashboard");
    if (userRole === "Lawyer") navigate("/lawyerdashboard");
  };

  const handleHome = () => {
    navigate("/");
  };

  return (
    <header className="w-full bg-[#0F1A3D]">
      <div className="w-full px-12">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <div onClick={handleHome} className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition">
            <div className="bg-yellow-500 text-blue-900 p-2 rounded-lg">
              <GoLaw size={22} />
            </div>
            <span className="text-xl font-bold text-white">
              Mero<span className="text-yellow-400">Nyaya</span>
            </span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-200">
            <Link to="/" className="hover:text-yellow-400 transition">Find Lawyers</Link>
            <Link to="/" className="hover:text-yellow-400 transition">Categories</Link>
            <Link to="/" className="hover:text-yellow-400 transition">Pricing</Link>
            <Link to="/" className="hover:text-yellow-400 transition">About Us</Link>
          </nav>

          {/* Right Side */}
          <div className="relative">
            {!isAuthenticated ? (
              /* BEFORE LOGIN */
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-white hover:text-yellow-400 transition"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="bg-yellow-400 text-[#0F1A3D] px-5 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-300 transition"
                >
                  Get Started
                </Link>
              </div>
            ) : (
              /* AFTER LOGIN */
              <div className="relative">
                {/* Avatar */}
                <button
                  onClick={() => setOpen(!open)}
                  className="w-10 h-10 rounded-full bg-yellow-400 text-[#0F1A3D] flex items-center justify-center font-bold"
                >
                  {user?.name?.charAt(0) || "U"}
                </button>

                {/* Dropdown */}
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
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;
