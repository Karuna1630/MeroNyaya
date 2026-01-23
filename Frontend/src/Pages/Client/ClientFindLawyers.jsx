import React, { useState } from "react";
import Sidebar from "./sidebar";
import ClientDashHeader from "./ClientDashHeader";
import { Search, MapPin, Star, Briefcase, Shield, ChevronDown } from "lucide-react";

const lawyers = [
  {
    id: 1,
    name: "Adv. Priya Sharma",
    specialization: "Property Law",
    experience: "12 yrs",
    rating: 4.9,
    reviews: 15,
    location: "Kathmandu",
    fee: "Rs. 2,500",
    status: "Available",
    verified: true,
    image: "https://ui-avatars.com/api/?name=Priya+Sharma&background=4F46E5&color=fff",
  },
  {
    id: 2,
    name: "Adv. Rajesh Thapa",
    specialization: "Corporate Law",
    experience: "15 yrs",
    rating: 4.8,
    reviews: 12,
    location: "Lalitpur",
    fee: "Rs. 5,000",
    status: "Available",
    verified: true,
    image: "https://ui-avatars.com/api/?name=Rajesh+Thapa&background=4F46E5&color=fff",
  },
  {
    id: 3,
    name: "Adv. Sita Karki",
    specialization: "Family Law",
    experience: "8 yrs",
    rating: 4.7,
    reviews: 8,
    location: "Bhaktapur",
    fee: "Rs. 2,500",
    status: "Busy",
    verified: true,
    image: "https://ui-avatars.com/api/?name=Sita+Karki&background=4F46E5&color=fff",
  },
  {
    id: 4,
    name: "Adv. Anita Gurung",
    specialization: "Criminal Law",
    experience: "10 yrs",
    rating: 4.6,
    reviews: 10,
    location: "Kathmandu",
    fee: "Rs. 4,000",
    status: "Available",
    verified: true,
    image: "https://ui-avatars.com/api/?name=Anita+Gurung&background=4F46E5&color=fff",
  },
];

const FindLawyers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("All Specializations");

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <ClientDashHeader
          title="Find Lawyers"
          subtitle="Discover and connect with legal experts"
        />

        <div className="flex-1 p-8">
          {/* Search and Filter Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name, specialization, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F1A3D] focus:border-transparent"
                />
              </div>

              {/* Specialization Dropdown */}
              <div className="relative">
                <select
                  value={selectedSpecialization}
                  onChange={(e) => setSelectedSpecialization(e.target.value)}
                  className="appearance-none px-6 py-3 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F1A3D] focus:border-transparent bg-white cursor-pointer"
                >
                  <option>All Specializations</option>
                  <option>Property Law</option>
                  <option>Corporate Law</option>
                  <option>Family Law</option>
                  <option>Criminal Law</option>
                  <option>Civil Law</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
              </div>

              {/* Filters Button */}
              <button className="px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.5 5.83333H17.5M5.83333 10H14.1667M8.33333 14.1667H11.6667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Filters
              </button>
            </div>
          </div>

          {/* Results Count */}
          <p className="text-gray-600 mb-6">Showing {lawyers.length} lawyers</p>

          {/* Lawyers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lawyers.map((lawyer) => (
              <div
                key={lawyer.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100"
              >
                {/* Card Header with Avatar and Status */}
                <div className="bg-[#0F1A3D] p-6 relative">
                  <div className="flex items-start justify-between">
                    <div className="relative">
                      <img
                        src={lawyer.image}
                        alt={lawyer.name}
                        className="w-16 h-16 rounded-full border-4 border-white"
                      />
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        lawyer.status === "Available"
                          ? "bg-slate-700 text-green-400"
                          : "bg-slate-700 text-gray-400"
                      }`}
                    >
                      {lawyer.status}
                    </span>
                  </div>

                  {/* Verified Badge */}
                  {lawyer.verified && (
                    <div className="flex items-center gap-1 mt-3 text-white">
                      <Shield size={16} />
                      <span className="text-sm font-medium">Verified</span>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-6">
                  {/* Name and Rating */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-[#0F1A3D] mb-1">{lawyer.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Briefcase size={14} />
                        <span>{lawyer.specialization}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star size={16} className="text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold text-gray-800">{lawyer.rating}</span>
                      <span className="text-gray-500 text-sm">({lawyer.reviews})</span>
                    </div>
                  </div>

                  {/* Experience and Location */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Briefcase size={14} />
                      <span>{lawyer.experience} exp.</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin size={14} />
                      <span>{lawyer.location}</span>
                    </div>
                  </div>

                  {/* Consultation Fee */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-600">Consultation from</span>
                    <span className="text-lg font-bold text-[#0F1A3D]">{lawyer.fee}</span>
                  </div>

                  {/* Action Button */}
                  <button className="w-full bg-[#0F1A3D] text-white py-3 rounded-lg font-semibold hover:bg-[#1a2b5a] transition">
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindLawyers;
