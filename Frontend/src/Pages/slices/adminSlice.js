import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../axios/axiosinstance';

/* ================= FETCH ADMIN STATS ================= */
export const fetchAdminStats = createAsyncThunk(
  'admin/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/authentications/get-user/');
      
      // Process users data to calculate stats
      const users = response.data?.Result?.users || [];
      const totalUsers = users.length;
      const totalClients = users.filter(u => (u.user_type || u.role || '').toLowerCase() === 'client').length;
      const totalLawyers = users.filter(u => (u.user_type || u.role || '').toLowerCase() === 'lawyer').length;

      return {
        totalUsers,
        totalClients,
        totalLawyers,
        users
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/* ================= FETCH KYC LIST ================= */
export const fetchKycList = createAsyncThunk(
  'admin/fetchKycList',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/kyc/admin/list/');
      return response.data?.Result || response.data || [];
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/* ================= REVIEW KYC ================= */
export const reviewKyc = createAsyncThunk(
  'admin/reviewKyc',
  async ({ id, status, rejection_reason }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/kyc/admin/review/${id}/`, {
        status,
        rejection_reason
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/* ================= INITIAL STATE ================= */
const initialState = {
  stats: {
    totalUsers: 0,
    totalClients: 0,
    totalLawyers: 0,
    users: []
  },
  statsLoading: false,
  statsError: null,

  kycList: [],
  kycLoading: false,
  kycError: null,

  reviewLoading: false,
  reviewError: null,
};

/* ================= SLICE ================= */
const adminSlice = createSlice({
  name: 'admin',
  initialState,
  extraReducers: (builder) => {
    /* Fetch Admin Stats */
    builder.addCase(fetchAdminStats.pending, (state) => {
      state.statsLoading = true;
      state.statsError = null;
    });

    builder.addCase(fetchAdminStats.fulfilled, (state, action) => {
      state.statsLoading = false;
      state.stats = action.payload;
    });

    builder.addCase(fetchAdminStats.rejected, (state, action) => {
      state.statsLoading = false;
      state.statsError = action.payload;
    });

    /* Fetch KYC List */
    builder.addCase(fetchKycList.pending, (state) => {
      state.kycLoading = true;
      state.kycError = null;
    });

    builder.addCase(fetchKycList.fulfilled, (state, action) => {
      state.kycLoading = false;
      state.kycList = Array.isArray(action.payload) ? action.payload : [];
    });

    builder.addCase(fetchKycList.rejected, (state, action) => {
      state.kycLoading = false;
      state.kycError = action.payload;
    });

    /* Review KYC */
    builder.addCase(reviewKyc.pending, (state) => {
      state.reviewLoading = true;
      state.reviewError = null;
    });

    builder.addCase(reviewKyc.fulfilled, (state, action) => {
      state.reviewLoading = false;
      const updated = action.payload;
      state.kycList = state.kycList.map((item) =>
        item.id === updated.id ? updated : item
      );
    });

    builder.addCase(reviewKyc.rejected, (state, action) => {
      state.reviewLoading = false;
      state.reviewError = action.payload;
    });
  }
});

export default adminSlice.reducer;
