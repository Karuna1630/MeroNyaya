import React, { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Sidebar from "./sidebar";
import ClientDashHeader from "./ClientDashHeader";
import { Search, MapPin, Star, Briefcase, Shield, ChevronDown, Loader, CheckCircle2, MessageSquare, Video, Filter } from "lucide-react";
import { fetchVerifiedLawyers } from "../slices/lawyerSlice";

const specializations = [
  "All Specializations",
  "Family Law",
  "Property Law",
  "Criminal Law",
  "Corporate Law",
  "Civil Litigation",
  "Banking & Finance",
  "Labor Law",
  "Immigration Law",
  "Insurance Law",
  "Tort Law",
];

const FindLawyers = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux selectors
  const lawyersData = useSelector((state) => state.lawyer.verifiedLawyers);
  const loading = useSelector((state) => state.lawyer.verifiedLawyersLoading);
  const error = useSelector((state) => state.lawyer.verifiedLawyersError);

  // Local component state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("All Specializations");

  // Fetch verified lawyers on component mount
  useEffect(() => {
    dispatch(fetchVerifiedLawyers());
  }, [dispatch]);

  // Transform backend data to frontend format
  const lawyers = useMemo(() => {
    return lawyersData
      .filter(lawyer => lawyer) 
      .map((lawyer) => {
        // Handle specializations - it might be a string, array, or null
        let specialization = "General Practice";
        if (lawyer.specializations) {
          if (typeof lawyer.specializations === 'string') {
            specialization = lawyer.specializations;
          } else if (Array.isArray(lawyer.specializations)) {
            specialization = lawyer.specializations.join(", ") || "General Practice";
          }
        }

        return {
          id: lawyer.id,
          name: lawyer.name || "Unknown",
          specialization: specialization,
          experience: lawyer.years_of_experience || 0,
          rating: 4.5, // Default rating, update when you have a rating system
          reviews: 0, // Default reviews, update when you have a review system
          location: lawyer.city || lawyer.district || "Nepal",
          fee: lawyer.consultation_fee || 0,
          status: "Available", // Default status, can be updated based on availability
          verified: lawyer.kyc_status === "approved",
          image: lawyer.profile_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(lawyer.name || "User")}&background=4F46E5&color=fff`,
          phone: lawyer.phone,
          email: lawyer.email,
          bio: lawyer.bio,
          dob: lawyer.dob,
          district: lawyer.district,
          barCouncilNumber: lawyer.bar_council_number,
          lawFirm: lawyer.law_firm_name,
          availabilityDays: lawyer.availability_days,
          availableFrom: lawyer.available_from,
          availableUntil: lawyer.available_until,
        };
      });
  }, [lawyersData]);

  // Helper function to extract city from address
  // (Removed unused extractCity function)

  // Filter lawyers based on search and specialization
  const filteredLawyers = useMemo(() => {
    console.log("Filtering with searchQuery:", searchQuery, "selectedSpec:", selectedSpecialization);
    
    const filtered = lawyers.filter((lawyer) => {
      if (!lawyer) return false;

      // If no specialization filter is selected, match all
      const matchesSpec =
        selectedSpecialization === "All Specializations" ||
        !selectedSpecialization ||
        (lawyer.specialization && 
         String(lawyer.specialization).toLowerCase().includes(String(selectedSpecialization).toLowerCase()));
      
      // If search is empty, show all matching specialization
      // If search has text, match against name, specialization, or location
      const matchesSearch =
        !searchQuery ||
        searchQuery.trim() === "" ||
        (lawyer.name && String(lawyer.name).toLowerCase().includes(String(searchQuery).toLowerCase())) ||
        (lawyer.specialization && String(lawyer.specialization).toLowerCase().includes(String(searchQuery).toLowerCase())) ||
        (lawyer.location && String(lawyer.location).toLowerCase().includes(String(searchQuery).toLowerCase()));

      return matchesSpec && matchesSearch;
    });
    
    console.log("Filtered result:", filtered);
    return filtered;
  }, [searchQuery, selectedSpecialization, lawyers]);

  // Sort filtered lawyers
  const sortedLawyers = useMemo(() => {
    // Default: sort by rating (Top Rated)
    return [...filteredLawyers].sort((a, b) => b.rating - a.rating);
  }, [filteredLawyers]);

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
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex gap-4 items-center">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name, specialization, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0F1A3D] text-sm"
                />
              </div>

              {/* Specialization Dropdown */}
              <div className="relative">
                <select
                  value={selectedSpecialization}
                  onChange={(e) => setSelectedSpecialization(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2 border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0F1A3D] bg-white cursor-pointer text-sm text-gray-600 min-w-[200px]"
                >
                  {specializations.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              </div>

              {/* Filters Button */}
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-100 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">
                <Filter size={16} />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <Loader className="animate-spin text-[#0F1A3D]" size={48} />
              <p className="ml-4 text-gray-600 text-lg">Loading lawyers...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
              <p className="text-red-700 text-center">{error}</p>
            </div>
          )}

          {/* Results Count */}
          {!loading && !error && (
            <>
              <p className="text-gray-600 mb-6">Showing {sortedLawyers.length} of {lawyers.length} lawyers</p>
              {sortedLawyers.length === 0 && lawyers.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-yellow-800">No lawyers match current filters. Total lawyers available: {lawyers.length}</p>
                </div>
              )}
            </>
          )}

          {/* Lawyers Grid */}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedLawyers.map((lawyer) => (
              <div
                key={lawyer.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100 flex flex-col"
              >
                {/* Header Section: Avatar and Name */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative">
                    <img
                      src={lawyer.image}
                      alt={lawyer.name}
                      className="w-20 h-20 rounded-full object-cover border border-gray-100"
                    />
                    <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <h3 className="font-bold text-[#0F1A3D] text-lg">{lawyer.name}</h3>
                      {lawyer.verified && (
                        <CheckCircle2 size={18} className="text-gray-400" />
                      )}
                    </div>
                    
                    <span className="inline-block px-3 py-1 bg-[#1A2B5A] text-white text-[11px] font-medium rounded-full mb-3 uppercase tracking-wider">
                      {lawyer.specialization}
                    </span>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Briefcase size={14} className="text-gray-400" />
                        <span>{lawyer.experience} yrs</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star size={14} className="text-yellow-400 fill-yellow-400" />
                        <span className="text-gray-700 font-semibold">{lawyer.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location and Price Section */}
                <div className="flex items-center justify-between mb-5 px-1">
                  <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                    <MapPin size={16} className="text-gray-400" />
                    <span>{lawyer.location}</span>
                  </div>
                  <div className="text-[#0F1A3D] font-bold">
                    Rs. {lawyer.fee.toLocaleString()}
                  </div>
                </div>

                {/* Bio and Details */}
                <div className="mb-5 space-y-2 text-sm text-gray-600">
                  {lawyer.bio && (
                    <p className="text-gray-500 line-clamp-2">{lawyer.bio}</p>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-400">Date of Birth</p>
                      <p className="text-gray-700">{lawyer.dob || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">District</p>
                      <p className="text-gray-700">{lawyer.district || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Phone</p>
                      <p className="text-gray-700">{lawyer.phone || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-auto">
                  <button 
                    onClick={() => navigate(`/lawyer/${lawyer.id}`)}
                    className="w-full py-2.5 px-4 bg-[#0F1A3D] text-white rounded-lg font-semibold text-sm hover:bg-[#1a2b5a] transition"
                  >
                    Request Consultation
                  </button>
                </div>
              </div>
            ))}
          </div>
          )}

          {/* No Results Message */}
          {!loading && !error && sortedLawyers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No lawyers found matching your criteria</p>
              <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or search terms</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FindLawyers;
