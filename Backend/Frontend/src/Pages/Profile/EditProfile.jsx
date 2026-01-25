import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ArrowLeft, User, Mail, Phone, MapPin, CheckCircle, Upload, X } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { updateUserProfile } from "../slices/profileSlice";
import { clearSuccess, clearError } from "../slices/profileSlice";

const EditProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userProfile, updateLoading, updateError, updateSuccess } = useSelector(
    (state) => state.profile
  );
  const { user } = useSelector((state) => state.auth);
  const profile = userProfile || user;

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    city: "",
    district: "",
    bio: "",
    profile_image: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isNewImage, setIsNewImage] = useState(false);

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile?.name || "",
        phone: profile?.phone || "",
        city: profile?.city || "",
        district: profile?.district || "",
        bio: profile?.bio || "",
        profile_image: null,
      });
      // Set image preview from existing profile_image URL
      if (profile?.profile_image) {
        setImagePreview(profile.profile_image);
      } else {
        setImagePreview(null);
      }
    }
  }, [profile]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle image selection and preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image file size must not exceed 5MB.");
        return;
      }

      // Validate file format
      const allowedFormats = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!allowedFormats.includes(file.type)) {
        alert("Only JPEG, PNG, GIF, and WebP image formats are allowed.");
        return;
      }

      setFormData((prev) => ({
        ...prev,
        profile_image: file,
      }));
      setIsNewImage(true);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove image
  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      profile_image: null,
    }));
    setImagePreview(null);
    setIsNewImage(false);
  };

  // Handle save
  const handleSave = async () => {
    dispatch(clearError());
    const payload = {
      name: formData.name,
      phone: formData.phone,
      city: formData.city,
      district: formData.district,
      bio: formData.bio,
    };

    // Only add profile_image if a new file is selected
    if (formData.profile_image) {
      payload.profile_image = formData.profile_image;
    }

    dispatch(updateUserProfile(payload)).then(() => {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigate("/viewprofile");
      }, 2000);
    });
  };

  // Handle cancel
  const handleCancel = () => {
    navigate("/viewprofile");
  };

  const handleBackToDashboard = () => {
    const userRole = profile?.role;
    if (userRole === "Client") navigate("/clientdashboard");
    if (userRole === "Lawyer") navigate("/lawyerdashboard");
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Profile</h1>

        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            Profile updated successfully! Redirecting...
          </div>
        )}

        {/* Error Message */}
        {updateError && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {typeof updateError === "string" ? updateError : "Failed to update profile. Please try again."}
          </div>
        )}

        {/* Personal Information Card */}
        <div className="bg-white rounded-lg shadow-xl/30 border border-gray-200 p-8 mb-8">
          {/* Section Title */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900">Edit Personal Information</h2>
            <p className="text-sm text-gray-500 mt-1">Update your personal details and contact information</p>
          </div>

          {/* Profile Section - Image Upload */}
          <div className="flex items-start gap-6 mb-8 p-6 border border-gray-200 rounded-lg shadow-md bg-gray-50">
            {/* Avatar with Image Upload */}
            <div className="relative flex flex-col items-center gap-4">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Profile Preview"
                    className="w-24 h-24 rounded-full object-cover flex-shrink-0 border-2 border-[#0F1A3D]"
                  />
                  {isNewImage && (
                    <div className="absolute inset-0 rounded-full border-2 border-green-500 flex items-center justify-center">
                      <span className="text-xs font-bold text-green-600 bg-white rounded-full px-2 py-1">New</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#0F1A3D] text-white flex items-center justify-center font-bold text-3xl flex-shrink-0">
                  {formData.name?.charAt(0) || "U"}
                </div>
              )}

              {/* Image Upload Button */}
              <label className="cursor-pointer flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold">
                <Upload size={16} />
                Upload Photo
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              {/* Remove Image Button */}
              {imagePreview && (isNewImage || profile?.profile_image) && (
                <button
                  onClick={handleRemoveImage}
                  className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition text-sm font-semibold"
                >
                  <X size={16} />
                  Remove
                </button>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-2xl font-bold text-gray-900">{profile?.name || "User"}</h3>
                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                  <CheckCircle size={14} />
                  {profile?.is_verified ? "Verified" : "Unverified"}
                </span>
              </div>
              <p className="text-gray-600 mb-3">{profile?.role || "User"}</p>
              <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                Active
              </span>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name</label>
              <div className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3 bg-white hover:border-blue-400 transition">
                <User size={18} className="text-gray-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Email Address</label>
              <div className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3 bg-gray-50">
                <Mail size={18} className="text-gray-400" />
                <input
                  type="email"
                  value={profile?.email || ""}
                  readOnly
                  className="flex-1 bg-transparent outline-none text-gray-700 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Phone Number</label>
              <div className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3 bg-white hover:border-blue-400 transition">
                <Phone size={18} className="text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>

            {/* City and District */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">City</label>
                <div className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3 bg-white hover:border-blue-400 transition">
                  <MapPin size={18} className="text-gray-400" />
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Enter your city"
                    className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">District</label>
                <div className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-3 bg-white hover:border-blue-400 transition">
                  <MapPin size={18} className="text-gray-400" />
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    placeholder="Enter your district"
                    className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell us about yourself..."
                rows="4"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 bg-white hover:border-blue-400 transition text-gray-700 outline-none placeholder-gray-400"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-8 pt-8 border-t border-gray-200">
            <button
              onClick={handleCancel}
              disabled={updateLoading}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={updateLoading}
              className="px-6 py-2 bg-[#0F1A3D] text-white rounded-lg font-semibold hover:bg-blue-950 transition disabled:opacity-50 flex items-center gap-2"
            >
              {updateLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                "💾 Save Changes"
              )}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default EditProfile;