import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../slices/auth';
import profileReducer from '../slices/profileSlice';
import kycReducer from '../slices/kycSlice';
import adminReducer from '../slices/adminSlice';
import lawyerReducer from '../slices/lawyerSlice';
import reviewReducer from '../slices/reviewSlice';
import caseReducer from '../slices/caseSlice';
import proposalReducer from '../slices/proposalSlice';
import consultationReducer from '../slices/consultationSlice';
import appointmentReducer from '../slices/appointmentSlice';
import notificationReducer from '../slices/notificationSlice';

// Configure the Redux store with the auth reducer
export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    kyc: kycReducer,
    admin: adminReducer,
    lawyer: lawyerReducer,
    review: reviewReducer,
    case: caseReducer,
    proposal: proposalReducer,
    consultation: consultationReducer,
    appointment: appointmentReducer,
    notifications: notificationReducer,
  },
  // Enable Redux DevTools only in development mode
  devTools: import.meta.env.DEV,
});