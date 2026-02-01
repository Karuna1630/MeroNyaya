import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../axios/axiosinstance';

/* ================= FETCH LAWYER DETAILS ================= */
export const fetchLawyerDetails = createAsyncThunk(
  'lawyer/fetchLawyerDetails',
  async (lawyerId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/kyc/lawyer/${lawyerId}/`);
      console.log('Fetch lawyer details response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Fetch lawyer details error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to load lawyer details');
    }
  }
);

/* ================= FETCH VERIFIED LAWYERS LIST ================= */
export const fetchVerifiedLawyers = createAsyncThunk(
  'lawyer/fetchVerifiedLawyers',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.specialization) params.append('specialization', filters.specialization);
      if (filters.city) params.append('city', filters.city);
      if (filters.min_experience) params.append('min_experience', filters.min_experience);
      if (filters.max_fee) params.append('max_fee', filters.max_fee);

      const response = await axiosInstance.get(`/kyc/verified-lawyers/?${params}`);
      console.log('Fetch verified lawyers response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Fetch verified lawyers error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to load lawyers');
    }
  }
);

const initialState = {
  // Single lawyer details
  lawyerDetails: null,
  lawyerDetailsLoading: false,
  lawyerDetailsError: null,

  // Lawyers list
  verifiedLawyers: [],
  verifiedLawyersLoading: false,
  verifiedLawyersError: null,
};

const lawyerSlice = createSlice({
  name: 'lawyer',
  initialState,
  reducers: {
    clearLawyerDetails: (state) => {
      state.lawyerDetails = null;
      state.lawyerDetailsError = null;
    },
    clearVerifiedLawyers: (state) => {
      state.verifiedLawyers = [];
      state.verifiedLawyersError = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Lawyer Details
    builder
      .addCase(fetchLawyerDetails.pending, (state) => {
        state.lawyerDetailsLoading = true;
        state.lawyerDetailsError = null;
      })
      .addCase(fetchLawyerDetails.fulfilled, (state, action) => {
        state.lawyerDetailsLoading = false;
        state.lawyerDetails = action.payload;
        state.lawyerDetailsError = null;
      })
      .addCase(fetchLawyerDetails.rejected, (state, action) => {
        state.lawyerDetailsLoading = false;
        state.lawyerDetailsError = action.payload;
      });

    // Fetch Verified Lawyers
    builder
      .addCase(fetchVerifiedLawyers.pending, (state) => {
        state.verifiedLawyersLoading = true;
        state.verifiedLawyersError = null;
      })
      .addCase(fetchVerifiedLawyers.fulfilled, (state, action) => {
        state.verifiedLawyersLoading = false;
        state.verifiedLawyers = Array.isArray(action.payload)
          ? action.payload
          : action.payload.results || [];
        state.verifiedLawyersError = null;
      })
      .addCase(fetchVerifiedLawyers.rejected, (state, action) => {
        state.verifiedLawyersLoading = false;
        state.verifiedLawyersError = action.payload;
      });
  },
});

export const { clearLawyerDetails, clearVerifiedLawyers } = lawyerSlice.actions;
export default lawyerSlice.reducer;
