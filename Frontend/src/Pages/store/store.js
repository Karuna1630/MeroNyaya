import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../slices/auth';
import profileReducer from '../slices/profileSlice';
import kycReducer from '../slices/kycSlice';
import adminReducer from '../slices/adminSlice';
import lawyerReducer from '../slices/lawyerSlice';
import reviewReducer from '../slices/reviewSlice';
import caseReducer from '../slices/caseSlice';

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
  },
  devTools: import.meta.env.DEV,
});