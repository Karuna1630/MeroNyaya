import React from "react";
import { GoLaw } from "react-icons/go";
import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaInstagram,
} from "react-icons/fa";

// Adjustable padding - change this value to adjust footer padding
// Options: px-6, px-8, px-10, px-12, px-14, px-16


const Footer = () => {
  return (
    <footer className="bg-[#0F1A3D] text-gray-300">
      <div className={"w-full px-12 py-14"}>

        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-yellow-400 text-[#0F1A3D] p-2 rounded-full">
                <GoLaw className="text-lg" />
              </div>
              <h2 className="text-xl font-bold text-white">
                Mero<span className="text-yellow-400">Nyaya</span>
              </h2>
            </div>

            <p className="text-sm leading-relaxed mb-6">
              Nepal’s premier digital legal platform connecting clients with
              verified lawyers. Modern, transparent, and accessible legal
              services for everyone.
            </p>

            {/* Social Icons */}
            <div className="flex gap-3">
              {[FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram].map(
                (Icon, index) => (
                  <div
                    key={index}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-[#1C2A5A] hover:bg-yellow-400 hover:text-[#0F1A3D] transition cursor-pointer"
                  >
                    <Icon size={14} />
                  </div>
                )
              )}
            </div>
          </div>

          {/* Column 1 */}
          <div>
            <h3 className="text-white font-semibold mb-4">Explore</h3>
            <ul className="space-y-3 text-sm">
              <li className="hover:text-yellow-400 cursor-pointer">
                Find Lawyers
              </li>
              <li className="hover:text-yellow-400 cursor-pointer">
                Become a Lawyer
              </li>
              <li className="hover:text-yellow-400 cursor-pointer">
                How It Works
              </li>
              <li className="hover:text-yellow-400 cursor-pointer">
                Pricing
              </li>
            </ul>
          </div>

          {/* Column 2 */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-3 text-sm">
              <li className="hover:text-yellow-400 cursor-pointer">
                Terms of Service
              </li>
              <li className="hover:text-yellow-400 cursor-pointer">
                Privacy Policy
              </li>
              <li className="hover:text-yellow-400 cursor-pointer">
                Cookie Policy
              </li>
              <li className="hover:text-yellow-400 cursor-pointer">
                Refund Policy
              </li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-3 text-sm">
              <li className="hover:text-yellow-400 cursor-pointer">
                Help Center
              </li>
              <li className="hover:text-yellow-400 cursor-pointer">
                FAQ
              </li>
              <li className="hover:text-yellow-400 cursor-pointer">
                Contact Us
              </li>
              <li className="hover:text-yellow-400 cursor-pointer">
                Report Issue
              </li>
            </ul>
          </div>

        </div>

        {/* Divider */}
        <div className="border-t border-[#1C2A5A] my-10" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">

          <div className="flex flex-col md:flex-row items-center gap-4">
            <span>meronyay@gmail.com</span>
            <span>+977-1-4567890</span>
            <span>Itahari, Nepal</span>
          </div>

          <div className="text-center">
            © 2025 MeroNyaya. All rights reserved.
          </div>

          <div className="text-center">
            Built with <span className="text-red-400">❤</span> for Nepal’s Digital
            Future
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
