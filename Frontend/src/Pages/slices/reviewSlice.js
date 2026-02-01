import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../axios/axiosinstance';

/* ================= SUBMIT REVIEW ================= */
export const submitReview = createAsyncThunk(
  'review/submitReview',
  async (reviewData, { rejectWithValue }) => {
    try {
      console.log('Submit review payload:', reviewData);

      const payload = {
        lawyer_id: reviewData.lawyerId,
        comment: reviewData.comment,
        rating: reviewData.rating,
        title: reviewData.title || '',
      };

      const response = await axiosInstance.post(
        '/reviews/submit_review/',
        payload
      );

      console.log('Submit review response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Submit review error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/* ================= GET LAWYER REVIEWS ================= */
export const getLawyerReviews = createAsyncThunk(
  'review/getLawyerReviews',
  async (lawyerId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/reviews/?lawyer_id=${lawyerId}`
      );

      console.log('Get lawyer reviews response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Get lawyer reviews error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/* ================= GET LAWYER SUMMARY ================= */
export const getLawyerReviewSummary = createAsyncThunk(
  'review/getLawyerReviewSummary',
  async (lawyerId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/reviews/lawyer_summary/?lawyer_id=${lawyerId}`
      );

      console.log('Get lawyer summary response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Get lawyer summary error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/* ================= GET TOP LAWYERS ================= */
export const getTopLawyers = createAsyncThunk(
  'review/getTopLawyers',
  async (limit = 10, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        `/reviews/top_lawyers/?limit=${limit}`
      );

      console.log('Get top lawyers response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Get top lawyers error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Extract error message
const extractErrorMessage = (payload) => {
  if (!payload) return 'Operation failed.';
  if (typeof payload === 'string') return payload;

  if (payload.error) return payload.error;
  if (payload.detail) return payload.detail;
  if (payload.message) return payload.message;

  return 'An error occurred';
};

// Initial state
const initialState = {
  // Submit review
  submitLoading: false,
  submitSuccess: false,
  submitError: null,

  // Get reviews
  reviewsLoading: false,
  reviews: [],
  reviewsError: null,

  // Lawyer summary
  summaryLoading: false,
  lawyerSummary: null,
  summaryError: null,

  // Top lawyers
  topLawyersLoading: false,
  topLawyers: [],
  topLawyersError: null,
};

const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {
    clearSubmitStatus: (state) => {
      state.submitLoading = false;
      state.submitSuccess = false;
      state.submitError = null;
    },
    clearReviewsError: (state) => {
      state.reviewsError = null;
    },
  },
  extraReducers: (builder) => {
    // Submit Review
    builder
      .addCase(submitReview.pending, (state) => {
        state.submitLoading = true;
        state.submitSuccess = false;
        state.submitError = null;
      })
      .addCase(submitReview.fulfilled, (state) => {
        state.submitLoading = false;
        state.submitSuccess = true;
        state.submitError = null;
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.submitLoading = false;
        state.submitSuccess = false;
        state.submitError = extractErrorMessage(action.payload);
      });

    // Get Lawyer Reviews
    builder
      .addCase(getLawyerReviews.pending, (state) => {
        state.reviewsLoading = true;
        state.reviewsError = null;
      })
      .addCase(getLawyerReviews.fulfilled, (state, action) => {
        state.reviewsLoading = false;
        state.reviews = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getLawyerReviews.rejected, (state, action) => {
        state.reviewsLoading = false;
        state.reviewsError = extractErrorMessage(action.payload);
        state.reviews = [];
      });

    // Get Lawyer Summary
    builder
      .addCase(getLawyerReviewSummary.pending, (state) => {
        state.summaryLoading = true;
        state.summaryError = null;
      })
      .addCase(getLawyerReviewSummary.fulfilled, (state, action) => {
        state.summaryLoading = false;
        state.lawyerSummary = action.payload;
      })
      .addCase(getLawyerReviewSummary.rejected, (state, action) => {
        state.summaryLoading = false;
        state.summaryError = extractErrorMessage(action.payload);
        state.lawyerSummary = null;
      });

    // Get Top Lawyers
    builder
      .addCase(getTopLawyers.pending, (state) => {
        state.topLawyersLoading = true;
        state.topLawyersError = null;
      })
      .addCase(getTopLawyers.fulfilled, (state, action) => {
        state.topLawyersLoading = false;
        state.topLawyers = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getTopLawyers.rejected, (state, action) => {
        state.topLawyersLoading = false;
        state.topLawyersError = extractErrorMessage(action.payload);
        state.topLawyers = [];
      });
  },
});

export const { clearSubmitStatus, clearReviewsError } = reviewSlice.actions;
export default reviewSlice.reducer;