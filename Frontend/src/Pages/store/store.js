import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../slices/auth';

// Configure the Redux store with the auth reducer
export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  devTools: import.meta.env.DEV,
});