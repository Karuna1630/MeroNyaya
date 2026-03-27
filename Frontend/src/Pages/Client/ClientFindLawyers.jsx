import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import Sidebar from "./sidebar";
import ClientDashHeader from "./ClientDashHeader";
import { Search, MapPin, Star, Briefcase, Shield, ChevronDown, Loader, CheckCircle2, MessageSquare, Video, Filter } from "lucide-react";
import { fetchVerifiedLawyers } from "../slices/lawyerSlice";
import { LAW_CATEGORIES } from "../../utils/lawCategories";
import LawyerProfileModal from "./LawyerProfileModal";

const specializations = [
  "All Specializations",
  ...LAW_CATEGORIES,
];

const FindLawyers = () => {
  const { t } = useTranslation(); // Translation hook for internationalization
  const dispatch = useDispatch();
  const navigate = useNavigate();
  

  // Redux selectors
  const lawyersData = useSelector((state) => state.lawyer.verifiedLawyers);
  const loading = useSelector((state) => state.lawyer.verifiedLawyersLoading);
  const error = useSelector((state) => state.lawyer.verifiedLawyersError);

  // Local component state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState(t('lawyers.allSpecializations'));
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch verified lawyers on component mount
  useEffect(() => {
    dispatch(fetchVerifiedLawyers());
  }, [dispatch]);

  // Transform backend data to frontend format using useMemo for performance optimization
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

        // mapping other fields from backend to frontend structure
        return {
          id: lawyer.id,
          name: lawyer.name || "Unknown",
          specialization: specialization,
          experience: lawyer.years_of_experience || 0,
          rating: lawyer.average_rating || 0,
          reviews: lawyer.total_reviews || 0,
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
    
    const filtered = lawyers.filter((lawyer) => {
      if (!lawyer) return false;

      // If no specialization filter is selected, match all
      const matchesSpec =
        selectedSpecialization === t('lawyers.allSpecializations') ||
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
    
    
    return filtered;
  }, [searchQuery, selectedSpecialization, lawyers, t]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedSpecialization]);

  // Sort filtered lawyers
  const sortedLawyers = useMemo(() => {
    // Default: sort by rating (Top Rated)
    return [...filteredLawyers].sort((a, b) => b.rating - a.rating);
  }, [filteredLawyers]);

  // Paginate sorted lawyers
  const totalPages = Math.ceil(sortedLawyers.length / itemsPerPage);
  const paginatedLawyers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedLawyers.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedLawyers, currentPage, itemsPerPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOpenProfile = (lawyer) => {
    setSelectedLawyer(lawyer);
    setIsProfileOpen(true);
  };

  const handleCloseProfile = () => {
    setIsProfileOpen(false);
    setSelectedLawyer(null);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <ClientDashHeader
          title={t('lawyers.title')}
          subtitle={t('lawyers.subtitle')}
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
            {paginatedLawyers.map((lawyer) => (
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
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="font-bold text-[#0F1A3D] text-lg">{lawyer.name}</h3>
                      {lawyer.verified && (
                        <div className="flex items-center gap-1 px-2.5 py-0.5 bg-[#0F1A3D] rounded-full text-white">
                          <CheckCircle2 size={12} />
                          <span className="text-[10px] font-medium tracking-wide uppercase">Verified</span>
                        </div>
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
                        <Star size={14} className={lawyer.rating > 0 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                        <span className="text-gray-700 font-semibold">
                          {lawyer.rating > 0 ? lawyer.rating.toFixed(1) : "No reviews"}
                        </span>
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
                <div className="mt-auto space-y-2">
                  <button
                    type="button"
                    onClick={() => handleOpenProfile(lawyer)}
                    className="w-full py-2.5 px-4 border border-[#0F1A3D] text-[#0F1A3D] rounded-lg font-semibold text-sm hover:bg-[#0F1A3D] hover:text-white transition"
                  >
                    View Profile
                  </button>
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

          {/* Pagination Controls */}
          {!loading && !error && totalPages > 1 && (
            <div className="mt-10 flex flex-col items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Previous
                </button>
                
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => handlePageChange(i + 1)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition ${
                        currentPage === i + 1
                          ? "bg-[#0F1A3D] text-white"
                          : "text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </div>
              
              <p className="text-sm text-gray-500">
                Page <span className="font-semibold text-gray-900">{currentPage}</span> of <span className="font-semibold text-gray-900">{totalPages}</span>
              </p>
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
      <LawyerProfileModal
        isOpen={isProfileOpen}
        onClose={handleCloseProfile}
        lawyer={selectedLawyer}
      />
    </div>
  );
};

export default FindLawyers;
