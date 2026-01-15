import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ArrowLeft, User, Mail, Phone, MapPin, CheckCircle } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const ViewProfile = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);

  const handleBackToDashboard = () => {
    const userRole = user?.role;
    if (userRole === "Client") navigate("/clientdashboard");
    if (userRole === "Lawyer") navigate("/lawyerdashboard");
  };

  const handleEditProfile = () => {
    // Navigate to edit profile page
    navigate("/edit-profile");
  };

  return (
    <div className="min-h-screen bg-gray-50">
        <Header />
      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        <button
          onClick={handleBackToDashboard}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium mb-8"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        {/* Profile Header */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile</h1>

        {/* Personal Information Card */}
        <div className="bg-white rounded-lg shadow-xl/30  border border-gray-200 p-8 mb-8">
          {/* Section Title */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
            <p className="text-sm text-gray-500 mt-1">View your personal details and contact information</p>
          </div>

          {/* Profile Section */}
          <div className="flex items-start gap-6 mb-8 p-6 border border-gray-200 rounded-lg shadow-md bg-gray-50">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-[#0F1A3D] text-white flex items-center justify-center font-bold text-3xl flex-shrink-0">
              {user?.name?.charAt(0) || "U"}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-2xl font-bold text-gray-900">{user?.name || "User"}</h3>
                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                  <CheckCircle size={14} />
                  Verified
                </span>
              </div>
              <p className="text-gray-600 mb-3">{user?.role || "User"}</p>
              <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                Active
              </span>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            {/* First Name and Last Name */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">First Name</label>
                <div className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3 bg-gray-50">
                  <User size={18} className="text-gray-400" />
                  <input
                    type="text"
                    value={user?.name?.split(" ")[0] || ""}
                    readOnly
                    className="flex-1 bg-transparent outline-none text-gray-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Last Name</label>
                <div className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3 bg-gray-50">
                  <User size={18} className="text-gray-400" />
                  <input
                    type="text"
                    value={user?.name?.split(" ").slice(1).join(" ") || ""}
                    readOnly
                    className="flex-1 bg-transparent outline-none text-gray-700"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Email Address</label>
              <div className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3 bg-gray-50">
                <Mail size={18} className="text-gray-400" />
                <input
                  type="email"
                  value={user?.email || ""}
                  readOnly
                  className="flex-1 bg-transparent outline-none text-gray-700"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Phone Number</label>
              <div className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3 bg-gray-50">
                <Phone size={18} className="text-gray-400" />
                <input
                  type="tel"
                  value={user?.phone_number || ""}
                  readOnly
                  className="flex-1 bg-transparent outline-none text-gray-700"
                />
              </div>
            </div>

            {/* City and District */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">City</label>
                <div className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3 bg-gray-50">
                  <MapPin size={18} className="text-gray-400" />
                  <input
                    type="text"
                    value={user?.city || ""}
                    readOnly
                    className="flex-1 bg-transparent outline-none text-gray-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">District</label>
                <div className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3 bg-gray-50">
                  <MapPin size={18} className="text-gray-400" />
                  <input
                    type="text"
                    value={user?.district || ""}
                    readOnly
                    className="flex-1 bg-transparent outline-none text-gray-700"
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Bio</label>
              <textarea
                value={user?.bio || ""}
                readOnly
                rows="4"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-gray-50 text-gray-700 outline-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-8 pt-8 border-t border-gray-200">
            <button
              onClick={handleBackToDashboard}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition"
            >
              Back to Dashboard
            </button>
            <button
              onClick={handleEditProfile}
              className="px-6 py-2 bg-[#0F1A3D] text-white rounded-lg font-semibold hover:bg-blue-950 transition flex items-center gap-2"
            >
              ✏️ Edit Profile
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ViewProfile;
