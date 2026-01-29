import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../slices/auth';
import profileReducer from '../slices/profileSlice';
import kycReducer from '../slices/kycSlice';
import adminReducer from '../slices/adminSlice';

// Configure the Redux store with the auth reducer
export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    kyc: kycReducer,
    admin: adminReducer,
  },
  devTools: import.meta.env.DEV,
});