import React from "react";
import { Link } from "react-router-dom";
import { GoLaw } from "react-icons/go";

// Adjustable padding - change this value to adjust header padding
// Options: px-6, px-8, px-10, px-12, px-14, px-16


const Header = () => {
  return (
    <header className="w-full bg-[#0F1A3D]">
      <div className={"w-full px-12"}>
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <GoLaw className="text-yellow-400 text-2xl" />
            <span className="text-xl font-bold text-white">
              Mero<span className="text-yellow-400">Nyaya</span>
            </span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-200">
            <Link to="/" className="hover:text-yellow-400 transition">
              Find Lawyers
            </Link>
            <Link to="/" className="hover:text-yellow-400 transition">
              Categories
            </Link>
            <Link to="/" className="hover:text-yellow-400 transition">
              Pricing
            </Link>
            <Link to="/" className="hover:text-yellow-400 transition">
              About Us
            </Link>
          </nav>

          {/* Actions */}
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
