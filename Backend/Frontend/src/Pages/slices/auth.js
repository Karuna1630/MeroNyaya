import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../axios/axiosinstance';

/* ================= REGISTER ================= */
export const registerUser = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      console.log("Register payload:", userData);

      const response = await axiosInstance.post(
        "/authentications/register/",
        userData
      );

      console.log("Register response:", response.data);

      // store email for OTP verification
      localStorage.setItem(
        "registeredData",
        JSON.stringify({
          email: userData.email,
          name: userData.name,
          userType: userData.userType,
        })
      );

      return response.data;
    } catch (error) {
      console.error("Register error:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Extract a human-friendly message from API error shapes
const extractErrorMessage = (payload) => {
  if (!payload) return "Registration failed.";
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

  return "Registration failed.";
};

export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async (payload, { rejectWithValue }) => {
    try {
      console.log("Verify OTP payload:", payload);
      const response = await axiosInstance.post(
        "/authentications/verify-otp/",
        payload
      );
      console.log("Verify OTP response:", response.data);

      // clear temporary registration data on success
      localStorage.removeItem("registeredData");

      return response.data;
    } catch (error) {
      console.error(
        "Verify OTP error:",
        error.response?.data || error.message
      );
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


/* ================= LOGIN ================= */
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/authentications/login/",
        credentials
      );

      // Store tokens from API Result shape
      const accessToken = response.data?.Result?.access_token;
      const refreshToken = response.data?.Result?.refresh_token;
      const user = response.data?.Result?.user;

      if (accessToken && refreshToken) {
        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("refresh_token", refreshToken);
      }
      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

/* ================= LOGOUT ================= */
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      localStorage.clear();
      return rejectWithValue(error.message);
    }
  }
);

/* ================= INITIAL STATE ================= */
const getInitialState = () => {
  const storedUser = localStorage.getItem("user");
  const token = localStorage.getItem("access_token");

  return {
    user: storedUser ? JSON.parse(storedUser) : null,
    token: token || null,
    isAuthenticated: !!token,

    loading: false,
    error: null,
    success: false,

    registerLoading: false,
    registerError: null,

     // verify otp state
    verifyLoading: false,
    verifyError: null,
    verifySuccess: false,
  };
};

/* ================= SLICE ================= */
const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.registerError = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    setUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {
    /* Register */
    builder.addCase(registerUser.pending, (state) => {
      state.registerLoading = true;
      state.registerError = null;
    });

    builder.addCase(registerUser.fulfilled, (state) => {
      state.registerLoading = false;
    });

    builder.addCase(registerUser.rejected, (state, action) => {
      state.registerLoading = false;
      state.registerError = extractErrorMessage(action.payload);
    });

     /* Verify OTP */
    builder.addCase(verifyOtp.pending, (state) => {
      state.verifyLoading = true;
      state.verifyError = null;
      state.verifySuccess = false;
    });

    builder.addCase(verifyOtp.fulfilled, (state) => {
      state.verifyLoading = false;
      state.verifySuccess = true;
    });

    builder.addCase(verifyOtp.rejected, (state, action) => {
      state.verifyLoading = false;
      state.verifyError = action.payload;
    });

    /* Login */
    builder.addCase(loginUser.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });

    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.Result?.user;
      state.token = action.payload.Result?.access_token;
      state.isAuthenticated = true;
      state.success = true;
    });

    builder.addCase(loginUser.rejected, (state, action) => {
      state.loading = false;
      state.error = extractErrorMessage(action.payload);
    });

    /* Logout */
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    });
  },
});

export const { clearError, clearSuccess, setUser } = authSlice.actions;
export default authSlice.reducer;
