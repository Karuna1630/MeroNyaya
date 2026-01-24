import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../slices/auth';
import profileReducer from '../slices/profileSlice';

// Configure the Redux store with the auth reducer
export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
  },
  devTools: import.meta.env.DEV,
});