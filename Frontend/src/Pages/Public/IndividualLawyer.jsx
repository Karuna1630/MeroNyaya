import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  MapPin,
  Star,
  Briefcase,
  Phone,
  CalendarDays,
  ArrowRight,
  AlertCircle,
  ChevronLeft,
  CheckCircle2,
} from "lucide-react";
import Header from "../../components/Header.jsx";
import Footer from "../../components/Footer.jsx";
import Pagination from "../../components/Pagination";
import { getImageUrl } from '../../utils/imageUrl';
import { fetchLawyerDetails } from "../slices/lawyerSlice.js";
import { getLawyerReviews, getLawyerReviewSummary } from "../slices/reviewSlice.js";
import Consultationrequest from "./Consultationrequest.jsx";

const IndividualLawyer = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux selectors
  const lawyerData = useSelector((state) => state.lawyer.lawyerDetails);
  const loading = useSelector((state) => state.lawyer.lawyerDetailsLoading);
  const error = useSelector((state) => state.lawyer.lawyerDetailsError);
  const { user } = useSelector((state) => state.auth);
  const reviews = useSelector((state) => state.review.reviews);
  const reviewsLoading = useSelector((state) => state.review.reviewsLoading);
  const reviewSummary = useSelector((state) => state.review.lawyerSummary);
  const dynamicRating = reviewSummary?.average_rating ?? 0;
  const [reviewPageByLawyer, setReviewPageByLawyer] = useState({});
  const currentReviewPage = id ? reviewPageByLawyer[id] || 1 : 1;
  const REVIEWS_PER_PAGE = 3;
  const totalReviews = Array.isArray(reviews) ? reviews.length : 0;

  const totalReviewPages = useMemo(() => {
    if (!Array.isArray(reviews) || reviews.length === 0) return 1;
    return Math.ceil(reviews.length / REVIEWS_PER_PAGE);
  }, [reviews]);

  const effectiveReviewPage = Math.min(currentReviewPage, totalReviewPages);

  const paginatedReviews = useMemo(() => {
    if (!Array.isArray(reviews) || reviews.length === 0) return [];
    const startIndex = (effectiveReviewPage - 1) * REVIEWS_PER_PAGE;
    return reviews.slice(startIndex, startIndex + REVIEWS_PER_PAGE);
  }, [reviews, effectiveReviewPage]);

  const handleReviewPageChange = (page) => {
    if (!id) return;
    setReviewPageByLawyer((prev) => ({
      ...prev,
      [id]: page,
    }));
  };

  const formatRating = (rating) => {
    const value = Number(rating || 0);
    if (value <= 0) return "No reviews";
    return value.toFixed(2).replace(/\.0+$/, "").replace(/(\.\d*[1-9])0+$/, "$1");
  };

  const getInitials = (name) => {
    if (!name) return "A";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Transform API data to component structure
  const lawyer = lawyerData
    ? {
        id: lawyerData.id,
        name: lawyerData.name || "Advocate",
        initials: getInitials(lawyerData.name),
        specializationList: Array.isArray(lawyerData.specializations)
          ? lawyerData.specializations.filter(Boolean)
          : typeof lawyerData.specializations === "string" && lawyerData.specializations.trim()
          ? lawyerData.specializations
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : ["General Law"],
        location: lawyerData.city || lawyerData.district || "Nepal",
        district: lawyerData.district || "N/A",
        phone: lawyerData.phone || "N/A",
        dob: lawyerData.dob || "N/A",
        rating: dynamicRating, // Dynamic rating from review summary
        fee: lawyerData.consultation_fee || 0,
        verified: lawyerData.kyc_status === "approved",
        yearsOfExperience: lawyerData.years_of_experience || 0,
        bio: lawyerData.bio || "Experienced legal professional",
        profileImage: getImageUrl(lawyerData.profile_image, lawyerData.name),
        availabilityDays: Array.isArray(lawyerData.availability_days)
          ? lawyerData.availability_days
          : [],
        availableFrom: lawyerData.available_from || "",
        availableUntil: lawyerData.available_until || "",
      }
    : null;

  // Fetch lawyer data on component mount
  useEffect(() => {
    if (id) {
      dispatch(fetchLawyerDetails(id));
    }
  }, [id, dispatch]);

  // Fetch reviews and review summary when lawyer data is available
  useEffect(() => {
    if (lawyerData?.id) {
      dispatch(getLawyerReviews(lawyerData.id));
      dispatch(getLawyerReviewSummary(lawyerData.id));
    }
  }, [lawyerData?.id, dispatch]);

  // Show loading state
  if (loading) {
    return (
      <div className="bg-white min-h-screen text-slate-900">
        <Header />
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
              <p className="text-slate-600">Loading lawyer profile...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show error state
  if (error || !lawyer) {
    return (
      <div className="bg-white min-h-screen text-slate-900">
        <Header />
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <AlertCircle size={48} className="mx-auto text-red-600 mb-4" />
            <h2 className="text-2xl font-bold text-red-900 mb-2">
              Unable to Load Lawyer Profile
            </h2>
            <p className="text-red-700">
              {error || "The lawyer you're looking for could not be found."}
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen text-slate-900">
      <Header />

      <main className="w-full">
        {/* Breadcrumb Navigation */}
        <div className="border-b border-slate-400 bg-white sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-900 flex items-center gap-2">
                <span className="hover:text-slate-900 cursor-pointer transition">Lawyer</span>
                <ArrowRight size={14} className="text-slate-400" />
                <span className="text-slate-900 font-medium">{lawyer?.name}</span>
              </div>
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100 rounded-lg transition"
              >
                <ChevronLeft size={18} />
                Back
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-8 space-y-8">
              {/* Lawyer Profile Header Card */}
              <div className="bg-white border border-slate-400 rounded-lg p-8">
                <div className="flex items-start gap-6">
                  {/* Avatar */}
                  <div className="shrink-0">
                    {lawyer.profileImage ? (
                      <img
                        src={lawyer.profileImage}
                        alt={lawyer.name}
                        className="w-24 h-24 rounded-full object-cover border-2 border-slate-300"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center">
                        <span className="text-3xl font-bold text-slate-700">
                          {lawyer.initials}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h1 className="text-3xl font-bold text-slate-900">
                            {lawyer?.name}
                          </h1>
                          {lawyer?.verified && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                              <CheckCircle2 size={14} className="text-emerald-600" />
                              Verified
                            </span>
                          )}
                        </div>
                        <p className="text-base text-slate-600 mb-3">
                          Lawyer Profile
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Snapshot */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-400 bg-slate-50 p-5">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <MapPin size={16} />
                    <span className="text-xs font-semibold uppercase tracking-wide">Location</span>
                  </div>
                  <p className="text-base font-semibold text-slate-900">{lawyer?.location}</p>
                </div>

                <div className="rounded-xl border border-slate-400 bg-slate-50 p-5">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Briefcase size={16} />
                    <span className="text-xs font-semibold uppercase tracking-wide">Experience</span>
                  </div>
                  <p className="text-base font-semibold text-slate-900">{lawyer?.yearsOfExperience} years</p>
                </div>

                <div className="rounded-xl border border-slate-400 bg-slate-50 p-5">
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Star size={16} className="text-yellow-500" />
                    <span className="text-xs font-semibold uppercase tracking-wide">Reviews</span>
                  </div>
                  <p className="text-base font-semibold text-slate-900">{formatRating(lawyer?.rating)} ({totalReviews})</p>
                </div>
              </div>

              {/* Contact & Personal Info */}
              <div className="bg-white border border-slate-400 rounded-lg p-6">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600 mb-4">
                  Contact & Personal Info
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-slate-300 bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                      <Phone size={16} />
                      <span className="text-xs font-semibold uppercase tracking-wide">Phone</span>
                    </div>
                    <p className="text-base font-semibold text-slate-900">{lawyer?.phone}</p>
                  </div>

                  <div className="rounded-xl border border-slate-300 bg-slate-50 p-4">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                      <CalendarDays size={16} />
                      <span className="text-xs font-semibold uppercase tracking-wide">Date of Birth</span>
                    </div>
                    <p className="text-base font-semibold text-slate-900">{lawyer?.dob}</p>
                  </div>
                </div>
              </div>

              {/* About Section */}
              <div className="bg-white border border-slate-400 rounded-lg p-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">About</h2>
                <div className="mb-6">
                  <p className="text-sm font-semibold text-slate-700 mb-3">Specialization</p>
                  <div className="flex flex-wrap gap-2">
                    {lawyer?.specializationList?.map((specialization) => (
                      <span
                        key={specialization}
                        className="inline-flex items-center rounded-full bg-[#0F1A3D] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white"
                      >
                        {specialization}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="border-t border-slate-400 pt-5">
                <p className="text-base leading-relaxed text-slate-700">
                  {lawyer?.bio}
                </p>
                </div>
              </div>

              {/* Reviews Section */}
              <div className="bg-white border border-slate-400 rounded-lg p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-slate-900">Reviews & Comments</h2>
                  <span className="inline-flex items-center rounded-full border border-slate-400 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                    {totalReviews} total
                  </span>
                </div>

                {/* Reviews List */}
                <div className="space-y-6">
                  {reviewsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto mb-2"></div>
                      <p className="text-sm text-slate-600">Loading reviews...</p>
                    </div>
                  ) : reviews && reviews.length > 0 ? (
                    paginatedReviews.map((review) => (
                      <div key={review.id} className="rounded-xl border border-slate-400 bg-slate-50 p-4 hover:bg-white hover:shadow-sm transition">
                        <div className="flex items-start gap-4">
                          {/* Avatar */}
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                            {review.client_profile_image ? (
                              <img
                                src={getImageUrl(review.client_profile_image, review.client_name)}
                                alt={review.client_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-semibold text-slate-600">
                                {review.client_name?.[0]?.toUpperCase() || "A"}
                              </span>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <p className="font-semibold text-slate-900">{review.client_name || "Anonymous"}</p>
                              <p className="text-xs text-slate-500">
                                {review.created_at ? new Date(review.created_at).toLocaleDateString() : "Recently"}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 mb-2">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={14}
                                  className={
                                    i < review.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-slate-300"
                                  }
                                />
                              ))}
                              <span className="text-xs text-slate-600 ml-2">{review.rating}/5</span>
                            </div>
                            <p className="text-sm text-slate-700 leading-relaxed">{review.comment}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-slate-600 py-8">No reviews yet. Be the first to share your feedback!</p>                  )
                  }

                  {reviews && reviews.length > REVIEWS_PER_PAGE && (
                    <Pagination
                      currentPage={effectiveReviewPage}
                      totalPages={totalReviewPages}
                      onPageChange={handleReviewPageChange}
                      itemsPerPage={REVIEWS_PER_PAGE}
                      totalItems={reviews.length}
                    />
                  )}
                </div>
              </div>
            </div>

            <Consultationrequest lawyer={lawyer} user={user} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default IndividualLawyer;
