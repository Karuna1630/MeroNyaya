import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  MapPin,
  Star,
  Clock,
  CheckCircle,
  Briefcase,
  ArrowRight,
  AlertCircle,
  Send,
  ChevronLeft,
} from "lucide-react";
import Header from "../../components/Header.jsx";
import Footer from "../../components/Footer.jsx";
import { fetchLawyerDetails } from "../slices/lawyerSlice.js";
import { submitReview, getLawyerReviews, clearSubmitStatus } from "../slices/reviewSlice.js";
import Consultationrequest from "./Consultationrequest.jsx";

const IndividualLawyer = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux selectors
  const lawyerData = useSelector((state) => state.lawyer.lawyerDetails);
  const loading = useSelector((state) => state.lawyer.lawyerDetailsLoading);
  const error = useSelector((state) => state.lawyer.lawyerDetailsError);
  const submitLoading = useSelector((state) => state.review.submitLoading);
  const { user } = useSelector((state) => state.auth);
  const submitSuccess = useSelector((state) => state.review.submitSuccess);
  const submitError = useSelector((state) => state.review.submitError);
  const reviews = useSelector((state) => state.review.reviews);
  const reviewsLoading = useSelector((state) => state.review.reviewsLoading);

  // Local component state
  const [reviewText, setReviewText] = useState("");
  const [selectedRating, setSelectedRating] = useState(5);

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
        specialization: Array.isArray(lawyerData.specializations)
          ? lawyerData.specializations.join(", ")
          : lawyerData.specializations || "General Law",
        location: lawyerData.city || lawyerData.district || "Nepal",
        district: lawyerData.district || "N/A",
        phone: lawyerData.phone || "N/A",
        rating: 4.5,
        fee: lawyerData.consultation_fee || 0,
        verified: lawyerData.kyc_status === "approved",
        yearsOfExperience: lawyerData.years_of_experience || 0,
        bio: lawyerData.bio || "Experienced legal professional",
        profileImage: lawyerData.profile_image,
      }
    : null;

  // Fetch lawyer data on component mount
  useEffect(() => {
    if (id) {
      dispatch(fetchLawyerDetails(id));
    }
  }, [id, dispatch]);

  // Fetch reviews when lawyer data is available
  useEffect(() => {
    if (lawyer?.id) {
      dispatch(getLawyerReviews(lawyer.id));
    }
  }, [lawyer?.id, dispatch]);


  const handleSubmitReview = async () => {
    if (reviewText.trim() && lawyer) {
      // Dispatch review submission to Redux
      const result = await dispatch(
        submitReview({
          lawyerId: lawyer.id,
          comment: reviewText,
          rating: selectedRating,
          title: "",
        })
      );

      if (result.type === submitReview.fulfilled.type) {
        // Success - reset form and refresh reviews
        setReviewText("");
        setSelectedRating(5);
        // Refresh reviews list
        if (lawyer?.id) {
          dispatch(getLawyerReviews(lawyer.id));
        }
      }
    }
  };

  // Clear success message after 2 seconds
  useEffect(() => {
    if (submitSuccess) {
      const timer = setTimeout(() => {
        dispatch(clearSubmitStatus());
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [submitSuccess, dispatch]);


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
        <div className="border-b border-slate-200 bg-white sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-3">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600 flex items-center gap-2">
                <span className="hover:text-slate-900 cursor-pointer transition">Lawyer</span>
                <ArrowRight size={14} className="text-slate-400" />
                <span className="text-slate-900 font-medium">{lawyer?.name}</span>
              </div>
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition"
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
              <div className="bg-white border border-slate-200 rounded-lg p-8">
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
                        <h1 className="text-3xl font-bold text-slate-900 mb-1">
                          {lawyer?.name}
                        </h1>
                        <p className="text-base text-slate-600 mb-3">
                          {lawyer?.specialization}
                        </p>
                      </div>
                      {lawyer?.verified && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-yellow-50 border border-yellow-300 rounded-full">
                          <CheckCircle size={16} className="text-yellow-600 fill-yellow-600" />
                          <span className="text-xs font-semibold text-yellow-700">
                            Verified
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mt-4">
                      <span className="flex items-center gap-1">
                        <MapPin size={16} className="text-slate-400" />
                        {lawyer?.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase size={16} className="text-slate-400" />
                        {lawyer?.yearsOfExperience} years
                      </span>
                      <span className="flex items-center gap-1">
                        <Star size={16} className="text-yellow-500 fill-yellow-500" />
                        {lawyer?.rating}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* About Section */}
              <div className="bg-white border border-slate-200 rounded-lg p-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">About</h2>
                <p className="text-base leading-relaxed text-slate-700">
                  {lawyer?.bio}
                </p>
              </div>

              {/* Reviews Section */}
              <div className="bg-white border border-slate-200 rounded-lg p-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-6">Reviews & Comments</h2>

                {/* Add Review Form */}
                <div className="mb-8 pb-8 border-b border-slate-200">
                  <h3 className="text-base font-semibold text-slate-900 mb-4">Share Your Experience</h3>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <span className="text-sm font-semibold text-slate-600">You</span>
                    </div>
                    <div className="flex-1">
                      {/* Star Rating Selector */}
                      <div className="mb-4 flex items-center gap-3">
                        <span className="text-sm text-slate-600 font-medium">Rating:</span>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setSelectedRating(star)}
                              className="transition duration-200 hover:scale-110"
                            >
                              <Star
                                size={24}
                                className={
                                  star <= selectedRating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-slate-300 hover:text-yellow-300"
                                }
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Share your feedback about this lawyer..."
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 resize-none"
                        rows="3"
                        disabled={submitLoading}
                      />

                      {/* Success/Error Messages */}
                      {submitSuccess && (
                        <div className="mt-3 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm text-green-700 font-semibold">Review submitted successfully!</p>
                        </div>
                      )}
                      {submitError && (
                        <div className="mt-3 px-4 py-2 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-700 font-semibold">{submitError}</p>
                        </div>
                      )}

                      <button
                        onClick={handleSubmitReview}
                        disabled={!reviewText.trim() || submitLoading}
                        className="mt-3 flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Posting...
                          </>
                        ) : (
                          <>
                            <Send size={16} />
                            Post Review
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Reviews List */}
                <div className="space-y-6">
                  {reviewsLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto mb-2"></div>
                      <p className="text-sm text-slate-600">Loading reviews...</p>
                    </div>
                  ) : reviews && reviews.length > 0 ? (
                    reviews.slice(0, 3).map((review) => (
                      <div key={review.id} className="pb-6 border-b border-slate-200 last:border-b-0 last:pb-0">
                        <div className="flex items-start gap-4">
                          {/* Avatar */}
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                            {review.client_profile_image ? (
                              <img
                                src={review.client_profile_image}
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
                  {reviews && reviews.length > 3 && (
                    <div className="text-center pt-4">
                      <button className="text-sm text-slate-900 font-semibold hover:underline">
                        View all {reviews.length} reviews
                      </button>
                    </div>                  )}
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
