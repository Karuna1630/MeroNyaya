import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../axios/axiosinstance';

/* ================= CREATE CONSULTATION ================= */
export const createConsultation = createAsyncThunk(
  'consultation/createConsultation',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/consultations/', payload);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/* ================= FETCH MY CONSULTATIONS ================= */
export const fetchMyConsultations = createAsyncThunk(
  'consultation/fetchMyConsultations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/consultations/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  consultations: [],
  consultationsLoading: false,
  consultationsError: null,

  createLoading: false,
  createError: null,
  createSuccess: false,
};

const consultationSlice = createSlice({
  name: 'consultation',
  initialState,
  reducers: {
    clearConsultationState: (state) => {
      state.createError = null;
      state.createSuccess = false;
      state.consultationsError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createConsultation.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
        state.createSuccess = false;
      })
      .addCase(createConsultation.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createSuccess = true;
        state.consultations = [action.payload, ...state.consultations];
      })
      .addCase(createConsultation.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload || 'Failed to create consultation.';
        state.createSuccess = false;
      })
      .addCase(fetchMyConsultations.pending, (state) => {
        state.consultationsLoading = true;
        state.consultationsError = null;
      })
      .addCase(fetchMyConsultations.fulfilled, (state, action) => {
        state.consultationsLoading = false;
        state.consultations = action.payload || [];
      })
      .addCase(fetchMyConsultations.rejected, (state, action) => {
        state.consultationsLoading = false;
        state.consultationsError = action.payload || 'Failed to load consultations.';
      });
  },
});

export const { clearConsultationState } = consultationSlice.actions;
export default consultationSlice.reducer;
