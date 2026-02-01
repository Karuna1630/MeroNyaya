import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  MapPin,
  Star,
  Clock,
  CheckCircle,
  Briefcase,
  ArrowRight,
  X,
  AlertCircle,
  Video,
  Phone,
  MessageCircle,
  Send,
} from "lucide-react";
import Header from "../../components/Header.jsx";
import Footer from "../../components/Footer.jsx";
import { fetchLawyerDetails } from "../slices/lawyerSlice.js";
import { submitReview, getLawyerReviews, clearSubmitStatus } from "../slices/reviewSlice.js";

const IndividualLawyer = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  // Redux selectors
  const lawyerData = useSelector((state) => state.lawyer.lawyerDetails);
  const loading = useSelector((state) => state.lawyer.lawyerDetailsLoading);
  const error = useSelector((state) => state.lawyer.lawyerDetailsError);
  const submitLoading = useSelector((state) => state.review.submitLoading);
  const submitSuccess = useSelector((state) => state.review.submitSuccess);
  const submitError = useSelector((state) => state.review.submitError);
  const reviews = useSelector((state) => state.review.reviews);
  const reviewsLoading = useSelector((state) => state.review.reviewsLoading);

  // Local component state
  // State for booking
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedConsultationType, setSelectedConsultationType] = useState("Video");
  const [selectedDay, setSelectedDay] = useState("Mon");
  const [selectedTime, setSelectedTime] = useState("10:00 AM");
  const [reviewText, setReviewText] = useState("");
  const [selectedRating, setSelectedRating] = useState(5);

  // Helper function to get initials from name
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

  const handleBooking = () => {
    alert("Payment integration coming soon!");
    setShowBookingModal(false);
  };

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

  const consultationTypes = [
    { icon: Video, label: "Video", value: "Video" },
    { icon: Phone, label: "Phone", value: "Phone" },
    { icon: MessageCircle, label: "Chat", value: "Chat" },
  ];

  const availableDays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const timeSlots = ["10:00 AM", "11:00 AM", "12:00 PM", "2:00 PM", "3:00 PM", "4:00 PM"];

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
            <div className="text-sm text-slate-600 flex items-center gap-2">
              <span className="hover:text-slate-900 cursor-pointer transition">Lawyer</span>
              <ArrowRight size={14} className="text-slate-400" />
              <span className="text-slate-900 font-medium">{lawyer?.name}</span>
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

            {/* Right Column - Sticky Booking Panel */}
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-24 space-y-6">
                {/* Consultation Booking Card */}
                <div className="bg-white border border-slate-200 rounded-lg p-8">
                  <div className="mb-6">
                    <p className="text-sm text-slate-600 mb-1">Consultation Fee</p>
                    <p className="text-3xl font-bold text-slate-900">
                      Rs. {lawyer?.fee?.toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                        <CheckCircle size={12} />
                        Available
                      </span>
                    </div>
                  </div>

                  {/* Consultation Type Selection */}
                  <div className="mb-6 pb-6 border-b border-slate-200">
                    <p className="text-sm font-semibold text-slate-900 mb-3">Consultation Type</p>
                    <div className="grid grid-cols-3 gap-3">
                      {consultationTypes.map((type) => {
                        const Icon = type.icon;
                        const isSelected = selectedConsultationType === type.value;
                        return (
                          <button
                            key={type.value}
                            onClick={() => setSelectedConsultationType(type.value)}
                            className={`flex flex-col items-center gap-2 px-3 py-3 rounded-lg transition border ${
                              isSelected
                                ? "bg-slate-900 text-white border-slate-900"
                                : "border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-50"
                            }`}
                          >
                            <Icon size={18} />
                            <span className="text-xs font-semibold">{type.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Day Selection */}
                  <div className="mb-6 pb-6 border-b border-slate-200">
                    <p className="text-sm font-semibold text-slate-900 mb-3">Select Day</p>
                    <div className="grid grid-cols-5 gap-2">
                      {availableDays.map((day) => (
                        <button
                          key={day}
                          onClick={() => setSelectedDay(day)}
                          className={`px-2 py-2 rounded-lg text-xs font-semibold transition ${
                            selectedDay === day
                              ? "bg-slate-900 text-white"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time Slot Selection */}
                  <div className="mb-6">
                    <p className="text-sm font-semibold text-slate-900 mb-3">Available Times</p>
                    <div className="grid grid-cols-2 gap-2">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`px-3 py-2 rounded-lg text-xs font-semibold transition border ${
                            selectedTime === time
                              ? "bg-slate-900 text-white border-slate-900"
                              : "border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-50"
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Book Now Button */}
                  <button
                    onClick={() => setShowBookingModal(true)}
                    className="w-full px-4 py-3 rounded-lg text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 transition mb-2"
                  >
                    Book Consultation
                  </button>

                  {/* Cancellation Policy */}
                  <p className="text-xs text-slate-600 text-center">
                    Free cancellation up to 24 hours before consultation
                  </p>
                </div>

                {/* Help Card */}
                <div className="bg-white border border-slate-200 rounded-lg p-6">
                  <h3 className="font-semibold text-slate-900 mb-2">
                    Need Help?
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Send a message to get more information about the lawyer's services.
                  </p>
                  <button className="w-full px-4 py-2 rounded-lg text-sm font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50 transition">
                    Send Message
                  </button>
                </div>

                {/* Verification Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle
                      size={18}
                      className="text-blue-600 fill-blue-600 shrink-0 mt-0.5"
                    />
                    <div>
                      <p className="font-semibold text-blue-900 text-sm mb-1">
                        Verified Lawyer
                      </p>
                      <p className="text-xs text-blue-700">
                        All information and credentials have been verified by our
                        team.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">
                Confirm Your Booking
              </h3>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-slate-500 hover:text-slate-700 transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4 mb-6 pb-6 border-b border-slate-200">
              <div>
                <p className="text-sm text-slate-600">Lawyer</p>
                <p className="text-base font-semibold text-slate-900">
                  {lawyer?.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Consultation Type</p>
                <p className="text-base font-semibold text-slate-900">
                  {selectedConsultationType}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Date & Time</p>
                <p className="text-base font-semibold text-slate-900">
                  {selectedDay}, {selectedTime}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Fee</p>
                <p className="text-lg font-bold text-slate-900">
                  Rs. {lawyer?.fee?.toLocaleString()}
                </p>
              </div>
            </div>

            <button
              onClick={handleBooking}
              className="w-full px-4 py-3 rounded-lg text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 transition mb-2"
            >
              Proceed to Payment
            </button>
            <button
              onClick={() => setShowBookingModal(false)}
              className="w-full px-4 py-3 rounded-lg text-sm font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default IndividualLawyer;
