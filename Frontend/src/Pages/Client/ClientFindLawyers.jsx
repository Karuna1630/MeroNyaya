import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "./sidebar";
import ClientDashHeader from "./ClientDashHeader";
import { Search, MapPin, Star, Briefcase, Shield, ChevronDown, Loader } from "lucide-react";
import axiosInstance from "../../axios/axiosinstance";

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

const sortOptions = [
  "Top Rated",
  "Price: Low to High",
  "Price: High to Low",
  "Experience",
];

const FindLawyers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState("All Specializations");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [sortBy, setSortBy] = useState("Top Rated");
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locations, setLocations] = useState(["All Locations"]);

  // Fetch verified lawyers from backend
  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/kyc/verified-lawyers/");
        
        // Transform backend data to frontend format
        const transformedLawyers = response.data.map((lawyer) => ({
          id: lawyer.id,
          name: lawyer.name || "Unknown",
          specialization: lawyer.specializations || "General Practice",
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
          barCouncilNumber: lawyer.bar_council_number,
          lawFirm: lawyer.law_firm_name,
          availabilityDays: lawyer.availability_days,
          availableFrom: lawyer.available_from,
          availableUntil: lawyer.available_until,
        }));

        setLawyers(transformedLawyers);

        // Extract unique locations
        const uniqueLocations = ["All Locations", ...new Set(
          transformedLawyers.map(l => l.location).filter(Boolean)
        )];
        setLocations(uniqueLocations);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching lawyers:", err);
        setError("Failed to load lawyers. Please try again later.");
        setLoading(false);
      }
    };

    fetchLawyers();
  }, []);

  // Helper function to extract city from address
  const extractCity = (address) => {
    if (!address) return "Nepal";
    // Try to extract city name from address
    const cities = ["Kathmandu", "Lalitpur", "Bhaktapur", "Pokhara", "Biratnagar", "Birgunj", "Bharatpur", "Butwal"];
    for (const city of cities) {
      if (address.toLowerCase().includes(city.toLowerCase())) {
        return city;
      }
    }
    return address.split(",")[0].trim(); // Return first part of address
  };

  // Filter lawyers based on search, specialization, and location

  // Filter lawyers based on search, specialization, and location
  const filteredLawyers = useMemo(() => {
    return lawyers.filter((lawyer) => {
      const matchesSpec =
        selectedSpecialization === "All Specializations" ||
        lawyer.specialization === selectedSpecialization;
      
      const matchesLocation =
        selectedLocation === "All Locations" ||
        lawyer.location === selectedLocation;
      
      const matchesSearch =
        lawyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lawyer.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lawyer.location.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSpec && matchesLocation && matchesSearch;
    });
  }, [searchQuery, selectedSpecialization, selectedLocation]);

  // Sort filtered lawyers
  const sortedLawyers = useMemo(() => {
    const clone = [...filteredLawyers];

    switch (sortBy) {
      case "Price: Low to High":
        return clone.sort((a, b) => a.fee - b.fee);
      case "Price: High to Low":
        return clone.sort((a, b) => b.fee - a.fee);
      case "Experience":
        return clone.sort((a, b) => b.experience - a.experience);
      default: // "Top Rated"
        return clone.sort((a, b) => b.rating - a.rating);
    }
  }, [filteredLawyers, sortBy]);

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
            <div className="flex gap-4 flex-wrap">
              {/* Search Bar */}
              <div className="flex-1 min-w-[300px] relative">
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
                  {specializations.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
              </div>

              {/* Location Dropdown */}
              <div className="relative">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="appearance-none px-6 py-3 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F1A3D] focus:border-transparent bg-white cursor-pointer"
                >
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
              </div>

              {/* Sort By Dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none px-6 py-3 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F1A3D] focus:border-transparent bg-white cursor-pointer"
                >
                  {sortOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
              </div>
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
            <p className="text-gray-600 mb-6">Showing {sortedLawyers.length} lawyers</p>
          )}

          {/* Lawyers Grid */}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedLawyers.map((lawyer) => (
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
                      <span>{lawyer.experience} yrs exp.</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin size={14} />
                      <span>{lawyer.location}</span>
                    </div>
                  </div>

                  {/* Consultation Fee */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-600">Consultation from</span>
                    <span className="text-lg font-bold text-[#0F1A3D]">Rs. {lawyer.fee.toLocaleString()}</span>
                  </div>

                  {/* Action Button */}
                  <button className="w-full bg-[#0F1A3D] text-white py-3 rounded-lg font-semibold hover:bg-[#1a2b5a] transition">
                    View Profile
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
