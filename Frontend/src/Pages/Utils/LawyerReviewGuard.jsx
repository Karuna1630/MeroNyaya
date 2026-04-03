import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { fetchKycStatus } from '../slices/kycSlice';
import { toast } from 'react-toastify';

const ALLOWED_PATHS_WITHOUT_KYC = ['/lawyerdashboard', '/kyc', '/viewprofile', '/edit-profile'];

const LawyerReviewGuard = ({ children }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const toastShownRef = useRef({});

  const { status } = useSelector((state) => state.kyc || {});
  const { userProfile } = useSelector((state) => state.profile || {});

  // Fetch KYC status on mount
  useEffect(() => {
    dispatch(fetchKycStatus());
  }, [dispatch]);

  // Determine KYC status with fallbacks
  const rawStatus = (status?.status || status?.kyc_status || status?.state || '').toLowerCase();
  const kycStatus = rawStatus;
  
  // A lawyer is verified if the database flag is true OR the current status is approved
  const isProfileVerified = userProfile?.is_kyc_verified === true;
  const isStatusApproved = kycStatus === 'approved';
  const isKycVerified = isProfileVerified || isStatusApproved;

  // Check if current path is allowed without KYC
  const isPathAllowedWithoutKyc = ALLOWED_PATHS_WITHOUT_KYC.some((path) =>
    location.pathname.startsWith(path)
  );

  // Block access if KYC not verified and path is not allowed
  useEffect(() => {
    // If we have user data and we know they aren't verified, and they are on a forbidden path
    if (userProfile && !isKycVerified && !isPathAllowedWithoutKyc) {
      // Show toast only once per path
      if (!toastShownRef.current[location.pathname]) {
        toastShownRef.current[location.pathname] = true;
        toast.warning('Access Restricted: Please complete your KYC verification first.');
      }
      
      // Redirect to dashboard
      navigate('/lawyerdashboard', { replace: true });
    }
  }, [userProfile, isKycVerified, isPathAllowedWithoutKyc, location.pathname, navigate]);

  // Don't render children if blocked on a restricted path
  if (!isKycVerified && !isPathAllowedWithoutKyc) {
    return null;
  }

  return children;
};

export default LawyerReviewGuard;
