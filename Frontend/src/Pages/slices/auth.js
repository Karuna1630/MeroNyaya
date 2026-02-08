// create slice for creating reducres and actions in one place for authentication related state management
//create async thunks for api calls, automatically gives pending, fulfilled and rejected

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../axios/axiosinstance';

// creating async thunk for user registration which calls the register api and handles the response and errors
export const registerUser = createAsyncThunk(
  // defining async thunk name as 'auth/register' which will be used in the slice and for dispatching the action
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      // Logging the payload to verify the data being sent to the API
      console.log("Register payload:", userData);

      // calling the register API endpoint with the user data
      const response = await axiosInstance.post(
        "/authentications/register/",
        userData
      );
      // Logging the API response to verify the data received from the API
      console.log("Register response:", response.data);

      // Storing the registration data temporarily in localStorage to be used for OTP verification
      localStorage.setItem(
        "registeredData",
        JSON.stringify({
          email: userData.email,
          name: userData.name,
          userType: userData.userType,
        })
      );

      // Returning the API response data to be handled in the fulfilled case of the thunk
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


// creating async thunk for verifying otp which calls the verify otp api and handles the response and errors
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



// creating async thunk for user login which calls the login api and handles the response and errors
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/authentications/login/",
        credentials
      );

      // extracting tokens and user data from the response
      const accessToken = response.data?.Result?.access_token;
      const refreshToken = response.data?.Result?.refresh_token;
      const user = response.data?.Result?.user;


      // Storing tokens and user data in localStorage for maintaining authentication state
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

// creating async thunk for user logout which clears the localStorage and handles errors
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

// Function to get the initial state of the auth slice, checking localStorage for existing user and token to maintain authentication state on page refresh
const getInitialState = () => {
  const storedUser = localStorage.getItem("user");
  const token = localStorage.getItem("access_token");

  // if user exist after refresh token then keep user logged in after page reload
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

// Function to create the auth slice which includes reducers and actions for authentication state management
const authSlice = createSlice({
  name: "auth",
  // defining the initial state using the getInitialState function
  initialState: getInitialState(),
  // defining the reducers for handling synchronous state updates 
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.registerError = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    // set user data in the state and localStorage
    setUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
  },

// handling asynchronous actions using extraReducers
  extraReducers: (builder) => {
    // it is helper object define state chnaged for async actions, Handling register user async thunk states from createAsyncThunk
    builder.addCase(registerUser.pending, (state) => {
      state.registerLoading = true;
      state.registerError = null;
    });

    // run when register user api call is successful
    builder.addCase(registerUser.fulfilled, (state) => {
      state.registerLoading = false;
    });
     
    // run when register user api call fails
    builder.addCase(registerUser.rejected, (state, action) => {
      state.registerLoading = false;
      state.registerError = extractErrorMessage(action.payload);
    });

// Handling verify otp async thunk states from createAsyncThunk runn when verify otp api call is pending
    builder.addCase(verifyOtp.pending, (state) => {
      state.verifyLoading = true;
      state.verifyError = null;
      state.verifySuccess = false;
    });

    // on successful otp verification
    builder.addCase(verifyOtp.fulfilled, (state) => {
      state.verifyLoading = false;
      state.verifySuccess = true;
    });

    // on failed otp verification
    builder.addCase(verifyOtp.rejected, (state, action) => {
      state.verifyLoading = false;
      state.verifyError = action.payload;
    });

    // Handling login user async thunk states from createAsyncThunk
    // run when login request is started
    builder.addCase(loginUser.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.success = false;
    });

    // on successful login, set user and token in state and is authenticated to true
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.Result?.user;
      state.token = action.payload.Result?.access_token;
      state.isAuthenticated = true;
      state.success = true;
    });

    // run when login request fails
    builder.addCase(loginUser.rejected, (state, action) => {
      state.loading = false;
      state.error = extractErrorMessage(action.payload);
    });

    // Handling logout async thunk states from createAsyncThunk
    builder.addCase(logoutUser.fulfilled, (state) => {
      // on sucessful logocut clear user and token from state and set isAuthenticated to false
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    });
  },
});

export const { clearError, clearSuccess, setUser } = authSlice.actions;
export default authSlice.reducer;
