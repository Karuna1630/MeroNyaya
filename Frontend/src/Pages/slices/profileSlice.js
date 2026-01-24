import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../axios/axiosinstance';

/* ================= FETCH USER PROFILE ================= */
export const fetchUserProfile = createAsyncThunk(
  "profile/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(
        "/authentications/profile/"
      );

      console.log("Fetch profile response:", response.data);

      return response.data;
    } catch (error) {
      console.error("Fetch profile error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/* ================= UPDATE USER PROFILE ================= */
export const updateUserProfile = createAsyncThunk(
  "profile/updateUserProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      console.log("Update profile payload:", profileData);

      // Create FormData to handle file uploads
      const formData = new FormData();
      
      // Append all fields except profile_image
      Object.keys(profileData).forEach(key => {
        if (key !== 'profile_image' || (key === 'profile_image' && profileData[key])) {
          formData.append(key, profileData[key]);
        }
      });

      const response = await axiosInstance.patch(
        "/authentications/profile/",
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log("Update profile response:", response.data);

      return response.data;
    } catch (error) {
      console.error("Update profile error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/* ================= FULL UPDATE USER PROFILE (PUT) ================= */
export const fullUpdateUserProfile = createAsyncThunk(
  "profile/fullUpdateUserProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      console.log("Full update profile payload:", profileData);

      // Create FormData to handle file uploads
      const formData = new FormData();
      
      // Append all fields except profile_image
      Object.keys(profileData).forEach(key => {
        if (key !== 'profile_image' || (key === 'profile_image' && profileData[key])) {
          formData.append(key, profileData[key]);
        }
      });

      const response = await axiosInstance.put(
        "/authentications/profile/",
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log("Full update profile response:", response.data);

      return response.data;
    } catch (error) {
      console.error("Full update profile error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Extract a human-friendly message from API error shapes
const extractErrorMessage = (payload) => {
  if (!payload) return "Profile operation failed.";
  if (typeof payload === "string") return payload;

  const errorMessage = payload.ErrorMessage;
  if (typeof errorMessage === "string" && errorMessage.trim()) {
    return errorMessage;
  }

  if (errorMessage && typeof errorMessage === "object") {
    const firstEntry = Object.values(errorMessage)[0];
    if (Array.isArray(firstEntry) && firstEntry.length > 0) {
      return firstEntry[0];
    }
    if (typeof firstEntry === "string") {
      return firstEntry;
    }
  }

  if (payload.Result?.message) {
    return payload.Result.message;
  }

  return "Profile operation failed.";
};

/* ================= INITIAL STATE ================= */
const initialState = {
  userProfile: null,
  
  // Fetch profile state
  fetchLoading: false,
  fetchError: null,
  fetchSuccess: false,

  // Update profile state
  updateLoading: false,
  updateError: null,
  updateSuccess: false,

  // Full update profile state
  fullUpdateLoading: false,
  fullUpdateError: null,
  fullUpdateSuccess: false,
};

/* ================= SLICE ================= */
const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearError: (state) => {
      state.fetchError = null;
      state.updateError = null;
      state.fullUpdateError = null;
    },
    clearSuccess: (state) => {
      state.fetchSuccess = false;
      state.updateSuccess = false;
      state.fullUpdateSuccess = false;
    },
    clearProfileState: (state) => {
      state.userProfile = null;
      state.fetchError = null;
      state.updateError = null;
      state.fullUpdateError = null;
    },
  },
  extraReducers: (builder) => {
    /* Fetch User Profile */
    builder.addCase(fetchUserProfile.pending, (state) => {
      state.fetchLoading = true;
      state.fetchError = null;
      state.fetchSuccess = false;
    });

    builder.addCase(fetchUserProfile.fulfilled, (state, action) => {
      state.fetchLoading = false;
      state.userProfile = action.payload.Result;
      state.fetchSuccess = true;
    });

    builder.addCase(fetchUserProfile.rejected, (state, action) => {
      state.fetchLoading = false;
      state.fetchError = extractErrorMessage(action.payload);
      state.fetchSuccess = false;
    });

    /* Update User Profile (PATCH) */
    builder.addCase(updateUserProfile.pending, (state) => {
      state.updateLoading = true;
      state.updateError = null;
      state.updateSuccess = false;
    });

    builder.addCase(updateUserProfile.fulfilled, (state, action) => {
      state.updateLoading = false;
      state.userProfile = action.payload.Result?.user;
      state.updateSuccess = true;
    });

    builder.addCase(updateUserProfile.rejected, (state, action) => {
      state.updateLoading = false;
      state.updateError = extractErrorMessage(action.payload);
      state.updateSuccess = false;
    });

    /* Full Update User Profile (PUT) */
    builder.addCase(fullUpdateUserProfile.pending, (state) => {
      state.fullUpdateLoading = true;
      state.fullUpdateError = null;
      state.fullUpdateSuccess = false;
    });

    builder.addCase(fullUpdateUserProfile.fulfilled, (state, action) => {
      state.fullUpdateLoading = false;
      state.userProfile = action.payload.Result?.user;
      state.fullUpdateSuccess = true;
    });

    builder.addCase(fullUpdateUserProfile.rejected, (state, action) => {
      state.fullUpdateLoading = false;
      state.fullUpdateError = extractErrorMessage(action.payload);
      state.fullUpdateSuccess = false;
    });
  },
});

export const { clearError, clearSuccess, clearProfileState } = profileSlice.actions;
export default profileSlice.reducer;
