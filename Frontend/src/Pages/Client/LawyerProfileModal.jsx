import React from "react";
import { X, MapPin, Briefcase, Star, CheckCircle2, Phone, CalendarDays } from "lucide-react";

const formatAvailability = (days) => {
  if (!days) return "N/A";
  if (Array.isArray(days)) return days.join(", ");
  return days;
};

const getCategories = (specialization) => {
  if (!specialization) return [];
  if (Array.isArray(specialization)) return specialization.filter(Boolean);
  if (typeof specialization === "string") {
    return specialization.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
};

const LawyerProfileModal = ({ isOpen, onClose, lawyer }) => {
  if (!isOpen || !lawyer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-[#0F1A3D]">
            Lawyer Profile
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* Top Section */}
          <div className="flex flex-col lg:flex-row lg:items-start gap-6">

            <div className="flex gap-5 flex-1">
              <img
                src={lawyer.image}
                alt={lawyer.name}
                className="w-24 h-24 rounded-full object-cover border"
              />

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold text-[#0F1A3D]">
                    {lawyer.name}
                  </h3>
                  {lawyer.verified && (
                    <span className="flex items-center gap-1 text-xs bg-[#0F1A3D] text-white px-2 py-0.5 rounded-full">
                      <CheckCircle2 size={14} />
                      Verified
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Briefcase size={14} />
                    {lawyer.experience} years
                  </span>

                  <span className="flex items-center gap-1">
                    <Star
                      size={14}
                      className={
                        lawyer.rating > 0
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300"
                      }
                    />
                    {lawyer.rating > 0
                      ? lawyer.rating.toFixed(1)
                      : "No reviews"}
                  </span>

                  <span className="flex items-center gap-1">
                    <MapPin size={14} />
                    {lawyer.location || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Fee */}
            <div className="lg:text-right">
              <div className="text-[#0F1A3D] font-bold text-2xl">
                Rs. {Number(lawyer.fee || 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">per consultation</div>
            </div>
          </div>

          {/* About */}
          <div>
            <h4 className="text-sm font-semibold text-[#0F1A3D] mb-2">
              About
            </h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              {lawyer.bio || "No bio available yet."}
            </p>
          </div>

          {/* Personal Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <p className="text-gray-400 text-xs">Date of Birth</p>
              <p className="text-[#0F1A3D] font-medium">
                {lawyer.dob || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-gray-400 text-xs">District</p>
              <p className="text-[#0F1A3D] font-medium">
                {lawyer.district || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-gray-400 text-xs">Phone</p>
              <p className="text-[#0F1A3D] font-medium flex items-center gap-1">
                <Phone size={14} />
                {lawyer.phone || "N/A"}
              </p>
            </div>
          </div>

          {/* Case Categories */}
          <div>
            <h4 className="text-sm font-semibold text-[#0F1A3D] mb-3">
              Case Categories
            </h4>
            <div className="flex flex-wrap gap-2">
              {getCategories(lawyer.specialization).length > 0 ? (
                getCategories(lawyer.specialization).map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1 rounded-full text-xs bg-[#0F1A3D] text-white"
                  >
                    {item}
                  </span>
                ))
              ) : (
                <span className="text-sm text-gray-500">
                  General Practice
                </span>
              )}
            </div>
          </div>

          {/* Availability - BLUE STYLE */}
          <div>
            <h4 className="text-sm font-semibold text-[#0F1A3D] mb-3">
              Availability
            </h4>
            <div className="flex flex-wrap gap-3">
              <span className="px-4 py-1.5 rounded-full text-xs bg-blue-50 text-blue-600 border border-blue-200">
                {formatAvailability(lawyer.availabilityDays)}
              </span>

              <span className="px-4 py-1.5 rounded-full text-xs bg-blue-50 text-blue-600 border border-blue-200">
                {lawyer.availableFrom || "N/A"} -{" "}
                {lawyer.availableUntil || "N/A"}
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LawyerProfileModal;
