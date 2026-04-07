import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { GoLaw } from "react-icons/go";
import { User, LogOut, Home, Menu, X } from "lucide-react";
import { logoutUser } from "../Pages/slices/auth"; 
import { fetchUserProfile } from "../Pages/slices/profileSlice";

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const profileFetchedRef = useRef(false);
  const dropdownRef = useRef(null);

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { userProfile } = useSelector((state) => state.profile);

  const profile = userProfile || user;
  const avatarSrc = userProfile?.profile_image;

  useEffect(() => {
    if (isAuthenticated && !profileFetchedRef.current) {
      profileFetchedRef.current = true;
      dispatch(fetchUserProfile());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const handleLogout = () => {
    setOpen(false);
    dispatch(logoutUser());
    navigate("/login");
  };

  const handleProfile = () => {
    setOpen(false);
    const userRole = (user?.user_type || user?.role || "").toLowerCase();
    if (userRole === "client") navigate("/clientdashboard");
    if (userRole === "lawyer") navigate("/lawyerdashboard");
    if (userRole === "admin" || user?.is_superuser) navigate("/admindashboard");
  };

  const handleViewProfile = () => {
    setOpen(false);
    navigate("/viewprofile");
  };

  const handleNavigation = (path) => {
    // Allow public pages without authentication
    const publicPages = ["/about", "/findlawyers"];
    if (publicPages.includes(path)) {
      navigate(path);
      return;
    }

    // For other pages, require authentication
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    const userRole = (user?.user_type || user?.role || user?.type || "").toLowerCase();
    const isAdmin = user?.is_superuser || user?.is_staff || userRole === "admin";
    if (isAdmin && path !== "/admindashboard" && path !== "/viewprofile" && path !== "/edit-profile") {
      navigate("/admindashboard");
      return;
    }
    navigate(path);
  };

  const handleHome = () => {
    navigate("/");
    setMobileMenuOpen(false);
  };

  return (
    <header className="w-full bg-[#0F1A3D] sticky top-0 z-100">
      <div className="w-full px-6 md:px-12">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <div onClick={handleHome} className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition">
            <div className="bg-yellow-400 text-blue-900 p-2 rounded-lg">
              <GoLaw size={22} />
            </div>
            <span className="text-xl font-bold text-white">
              Mero<span className="text-yellow-400">Nyaya</span>
            </span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-200">
            <Link to="/findlawyers" className="hover:text-yellow-400 transition">Find Lawyers</Link>
            <button onClick={() => handleNavigation("/about")} className="hover:text-yellow-400 transition">About Us</button>

          </nav>

          {/* Right Side */}
          <div className="relative">
            {!isAuthenticated ? (
              /* BEFORE LOGIN */
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-white hover:text-yellow-300 transition"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="bg-yellow-500 text-[#0F1A3D] px-5 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-300 transition"
                >
                  Get Started
                </Link>
              </div>
            ) : (
              /* AFTER LOGIN */
              <div ref={dropdownRef} className="relative">
                {/* Avatar */}
                <button
                  onClick={() => setOpen(!open)}
                  className="w-10 h-10 rounded-full bg-yellow-500 text-[#0F1A3D] flex items-center justify-center font-bold overflow-hidden"
                >
                  {avatarSrc ? (
                    <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    profile?.name?.charAt(0) || "U"
                  )}
                </button>

                {/* Dropdown */}
                {open && (
                  <div className="absolute right-0 mt-3 w-56 bg-slate-900 rounded-lg shadow-xl overflow-hidden z-50 border border-slate-700">
                    {/* Profile Section */}
                    <div className="px-4 py-4 border-b border-slate-700 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-yellow-500 text-slate-900 flex items-center justify-center font-bold text-lg">
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
                      onClick={handleProfile}
                      className="flex items-center gap-2 w-full px-4 py-3 text-sm text-gray-200 hover:bg-slate-800 transition border-t border-slate-700"
                    >
                      <Home size={16} />
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
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white hover:text-yellow-400 transition p-2"
            >
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0F1A3D] border-t border-slate-800 absolute top-20 left-0 w-full shadow-xl z-90 animate-in slide-in-from-top duration-300">
          <nav className="flex flex-col p-6 gap-4">
            <Link 
              to="/findlawyers" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-gray-200 hover:text-yellow-400 py-3 text-lg font-medium border-b border-slate-800 transition"
            >
              Find Lawyers
            </Link>
            <button 
              onClick={() => {
                handleNavigation("/about");
                setMobileMenuOpen(false);
              }} 
              className="text-left text-gray-200 hover:text-yellow-400 py-3 text-lg font-medium border-b border-slate-800 transition"
            >
              About Us
            </button>

            {!isAuthenticated && (
              <div className="flex flex-col gap-4 mt-4">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 text-white font-semibold border border-slate-700 rounded-lg hover:bg-slate-800 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-3 bg-yellow-500 text-[#0F1A3D] rounded-lg font-bold hover:bg-yellow-400 transition"
                >
                  Get Started
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
