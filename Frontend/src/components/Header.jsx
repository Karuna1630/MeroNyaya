import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { GoLaw } from "react-icons/go";

// Adjustable padding - change this value to adjust header padding
// Options: px-6, px-8, px-10, px-12, px-14, px-16

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Logout
  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };
  
  // View Profile
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
      <div className={"w-full px-12"}>
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <div className="flex items-center gap-2">
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
        </div>
      </div>
    </header>
  );
};

export default Header;
