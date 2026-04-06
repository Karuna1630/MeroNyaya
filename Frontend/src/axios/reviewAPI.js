import axiosInstance from "./axiosinstance";

/**
 * API module for lawyer reviews and ratings
 */

// Check if client has completed interactions with lawyer (consultation or case)
export const checkCanRateLawyer = async (lawyerId) => {
  try {
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    if (!currentUser.id) {
      return false;
    }
    
    // Fetch user's consultations
    const consultationsRes = await axiosInstance.get("/consultations/my_consultations/");
    const consultations = Array.isArray(consultationsRes.data) 
      ? consultationsRes.data 
      : consultationsRes.data.results || [];
    
    const completedConsultation = consultations.some(
      c => c.lawyer_id === lawyerId && c.status === "completed"
    );
    
    if (completedConsultation) return true;
    
    // Fetch user's cases
    const casesRes = await axiosInstance.get("/cases/");
    const cases = Array.isArray(casesRes.data) 
      ? casesRes.data 
      : casesRes.data.results || [];
    
    const completedCase = cases.some(
      c => c.lawyer_id === lawyerId && c.status === "completed"
    );
    
    return completedCase;
  } catch (error) {
    console.error("Error checking rating eligibility:", error);
    return false;
  }
};

// Create a new review/rating for a lawyer
export const createReview = (lawyerId, rating, comment = "", title = "", appointmentId = null, caseId = null) => {
  const payload = {
    lawyer_id: lawyerId,
    rating: rating,
    comment: comment,
    appointment_id: appointmentId,
    case_id: caseId,
  };
  console.log("DEBUG: Posting review to backend:", payload);

  return axiosInstance.post("/reviews/submit_review/", payload).catch(error => {
    // Extract error message from backend
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw error;
  });
};

// Get all reviews for a specific lawyer
export const getLawyerReviews = (lawyerId) => {
  return axiosInstance.get(`/reviews/?lawyer_id=${lawyerId}`);
};

// Get review summary for a lawyer
export const getLawyerReviewSummary = (lawyerId) => {
  return axiosInstance.get(`/reviews/lawyer_summary/?lawyer_id=${lawyerId}`);
};

// Get all reviews given by the current user (client)
export const getMyReviews = () => {
  return axiosInstance.get(`/reviews/?client_id=me`);
};

// Check if user has already reviewed a lawyer
export const checkExistingReview = (lawyerId) => {
  return axiosInstance.get(`/reviews/?lawyer_id=${lawyerId}`).then((response) => {
    const reviews = response.data.results || response.data.Result || [];
    const currentUserId = JSON.parse(localStorage.getItem("user") || "{}")?.id;
    
    return reviews.some(
      (review) => review.client === currentUserId || review.client_id === currentUserId
    );
  });
};

// Get a specific review
export const getReview = (reviewId) => {
  return axiosInstance.get(`/reviews/${reviewId}/`);
};

// Update a review
export const updateReview = (reviewId, rating, comment = "", title = "") => {
  return axiosInstance.patch(`/reviews/${reviewId}/`, {
    rating: rating,
    comment: comment,
    title: title,
  });
};

// Delete a review
export const deleteReview = (reviewId) => {
  return axiosInstance.delete(`/reviews/${reviewId}/`);
};

// Get top-rated lawyers
export const getTopLawyers = (limit = 10) => {
  return axiosInstance.get(`/reviews/top-lawyers/?limit=${limit}`);
};
