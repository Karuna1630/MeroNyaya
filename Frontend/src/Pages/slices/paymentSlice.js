import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../axios/axiosinstance';

// Helper to extract error message from api_response format
const extractErrorMessage = (error, fallback = 'Something went wrong') => {
  const data = error.response?.data;
  if (!data) return fallback;
  if (typeof data.ErrorMessage === 'string') return data.ErrorMessage;
  if (data.ErrorMessage?.error) return data.ErrorMessage.error;
  if (typeof data.ErrorMessage === 'object') {
    const firstKey = Object.keys(data.ErrorMessage)[0];
    if (firstKey) return data.ErrorMessage[firstKey];
  }
  return fallback;
};

// Initiate eSewa payment for an appointment
export const initiateEsewaPayment = createAsyncThunk(
  'payment/initiateEsewaPayment',
  async (appointmentId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/payment/esewa/initiate/', {
        appointment_id: appointmentId,
      });
      // api_response format: { Result: { esewa_url, params, ... } }
      return response.data.Result;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to initiate payment'));
    }
  }
);

// Verify eSewa payment after redirect
export const verifyEsewaPayment = createAsyncThunk(
  'payment/verifyEsewaPayment',
  async (encodedData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/payment/esewa/verify/?data=${encodeURIComponent(encodedData)}`);
      // api_response format: { Result: { message, payment } }
      return response.data.Result;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Payment verification failed'));
    }
  }
);

// Fetch payment history
export const fetchPaymentHistory = createAsyncThunk(
  'payment/fetchPaymentHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/payment/');
      // api_response format: { Result: { payments: [...] } }
      return response.data.Result?.payments || [];
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to load payments'));
    }
  }
);

// Fetch lawyer earnings summary and payment history
export const fetchLawyerEarnings = createAsyncThunk(
  'payment/fetchLawyerEarnings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/payment/earnings/');
      return response.data.Result;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to load earnings'));
    }
  }
);

// Fetch admin platform revenue summary (SuperAdmin only)
export const fetchAdminRevenue = createAsyncThunk(
  'payment/fetchAdminRevenue',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/payment/admin/revenue/');
      return response.data.Result;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to load revenue data'));
    }
  }
);

// Fetch pending payments for a specific lawyer (admin only)
export const fetchLawyerPendingPayments = createAsyncThunk(
  'payment/fetchLawyerPendingPayments',
  async (lawyerId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/payment/admin/pending/${lawyerId}/`);
      return response.data.Result;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to load pending payments'));
    }
  }
);

// Create a payout to a lawyer (admin only)
export const createPayout = createAsyncThunk(
  'payment/createPayout',
  async (payoutData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/payment/admin/payout/', payoutData);
      return response.data.Result;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error, 'Failed to process payout'));
    }
  }
);

const initialState = {
  // Initiation
  initiating: false,
  initiateError: null,
  esewaParams: null,
  esewaUrl: null,

  // Verification
  verifying: false,
  verifyError: null,
  verifiedPayment: null,

  // History
  payments: [],
  paymentsLoading: false,
  paymentsError: null,

  // Lawyer Earnings
  earnings: null,
  earningsLoading: false,
  earningsError: null,

  // Admin Revenue
  revenue: null,
  revenueLoading: false,
  revenueError: null,

  // Admin Payout
  pendingPayments: null,
  pendingPaymentsLoading: false,
  pendingPaymentsError: null,
  payoutCreating: false,
  payoutError: null,
  lastPayout: null,
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearPaymentErrors: (state) => {
      state.initiateError = null;
      state.verifyError = null;
      state.paymentsError = null;
    },
    clearEsewaParams: (state) => {
      state.esewaParams = null;
      state.esewaUrl = null;
    },
    clearVerifiedPayment: (state) => {
      state.verifiedPayment = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Initiate
      .addCase(initiateEsewaPayment.pending, (state) => {
        state.initiating = true;
        state.initiateError = null;
        state.esewaParams = null;
        state.esewaUrl = null;
      })
      .addCase(initiateEsewaPayment.fulfilled, (state, action) => {
        state.initiating = false;
        state.esewaParams = action.payload.params;
        state.esewaUrl = action.payload.esewa_url;
      })
      .addCase(initiateEsewaPayment.rejected, (state, action) => {
        state.initiating = false;
        state.initiateError = action.payload;
      })

      // Verify
      .addCase(verifyEsewaPayment.pending, (state) => {
        state.verifying = true;
        state.verifyError = null;
        state.verifiedPayment = null;
      })
      .addCase(verifyEsewaPayment.fulfilled, (state, action) => {
        state.verifying = false;
        state.verifiedPayment = action.payload;
      })
      .addCase(verifyEsewaPayment.rejected, (state, action) => {
        state.verifying = false;
        state.verifyError = action.payload;
      })

      // History
      .addCase(fetchPaymentHistory.pending, (state) => {
        state.paymentsLoading = true;
        state.paymentsError = null;
      })
      .addCase(fetchPaymentHistory.fulfilled, (state, action) => {
        state.paymentsLoading = false;
        state.payments = action.payload || [];
      })
      .addCase(fetchPaymentHistory.rejected, (state, action) => {
        state.paymentsLoading = false;
        state.paymentsError = action.payload;
      })

      // Lawyer Earnings
      .addCase(fetchLawyerEarnings.pending, (state) => {
        state.earningsLoading = true;
        state.earningsError = null;
      })
      .addCase(fetchLawyerEarnings.fulfilled, (state, action) => {
        state.earningsLoading = false;
        state.earnings = action.payload;
      })
      .addCase(fetchLawyerEarnings.rejected, (state, action) => {
        state.earningsLoading = false;
        state.earningsError = action.payload;
      })

      // Admin Revenue
      .addCase(fetchAdminRevenue.pending, (state) => {
        state.revenueLoading = true;
        state.revenueError = null;
      })
      .addCase(fetchAdminRevenue.fulfilled, (state, action) => {
        state.revenueLoading = false;
        state.revenue = action.payload;
      })
      .addCase(fetchAdminRevenue.rejected, (state, action) => {
        state.revenueLoading = false;
        state.revenueError = action.payload;
      })

      // Fetch Lawyer Pending Payments
      .addCase(fetchLawyerPendingPayments.pending, (state) => {
        state.pendingPaymentsLoading = true;
        state.pendingPaymentsError = null;
      })
      .addCase(fetchLawyerPendingPayments.fulfilled, (state, action) => {
        state.pendingPaymentsLoading = false;
        state.pendingPayments = action.payload;
      })
      .addCase(fetchLawyerPendingPayments.rejected, (state, action) => {
        state.pendingPaymentsLoading = false;
        state.pendingPaymentsError = action.payload;
      })

      // Create Payout
      .addCase(createPayout.pending, (state) => {
        state.payoutCreating = true;
        state.payoutError = null;
      })
      .addCase(createPayout.fulfilled, (state, action) => {
        state.payoutCreating = false;
        state.lastPayout = action.payload;
        state.pendingPayments = null;
      })
      .addCase(createPayout.rejected, (state, action) => {
        state.payoutCreating = false;
        state.payoutError = action.payload;
      });
  },
});

export const { clearPaymentErrors, clearEsewaParams, clearVerifiedPayment } = paymentSlice.actions;
export default paymentSlice.reducer;
