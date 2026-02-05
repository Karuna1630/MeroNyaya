import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../axios/axiosinstance';

export const fetchMyAppointments = createAsyncThunk(
  'appointments/fetchMyAppointments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/appointments/');
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to load appointments');
    }
  }
);

export const payAppointment = createAsyncThunk(
  'appointments/payAppointment',
  async (appointmentId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/appointments/${appointmentId}/pay/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || 'Payment failed');
    }
  }
);

const initialState = {
  appointments: [],
  appointmentsLoading: false,
  appointmentsError: null,
};

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    clearAppointmentsError: (state) => {
      state.appointmentsError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyAppointments.pending, (state) => {
        state.appointmentsLoading = true;
        state.appointmentsError = null;
      })
      .addCase(fetchMyAppointments.fulfilled, (state, action) => {
        state.appointmentsLoading = false;
        state.appointments = action.payload || [];
      })
      .addCase(fetchMyAppointments.rejected, (state, action) => {
        state.appointmentsLoading = false;
        state.appointmentsError = action.payload;
      })
      .addCase(payAppointment.pending, (state) => {
        state.appointmentsError = null;
      })
      .addCase(payAppointment.fulfilled, (state, action) => {
        const updated = action.payload;
        state.appointments = state.appointments.map((item) =>
          item.id === updated.id ? { ...item, ...updated } : item
        );
      })
      .addCase(payAppointment.rejected, (state, action) => {
        state.appointmentsError = action.payload;
      });
  },
});

export const { clearAppointmentsError } = appointmentSlice.actions;

export default appointmentSlice.reducer;
