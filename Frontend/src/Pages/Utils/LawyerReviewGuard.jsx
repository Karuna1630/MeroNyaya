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

  // Determine KYC status
  const rawStatus = status?.status || status?.kyc_status || status?.state || '';
  const kycStatus = typeof rawStatus === 'string' ? rawStatus.toLowerCase() : '';
  const isKycVerified = userProfile?.is_kyc_verified === true || kycStatus === 'approved';

  // Check if current path is allowed without KYC
  const isPathAllowedWithoutKyc = ALLOWED_PATHS_WITHOUT_KYC.some((path) =>
    location.pathname.startsWith(path)
  );

  // Block access if KYC not verified and path is not allowed
  useEffect(() => {
    if (!isKycVerified && !isPathAllowedWithoutKyc) {
      // Show toast only once per path
      if (!toastShownRef.current[location.pathname]) {
        toastShownRef.current[location.pathname] = true;
        toast.warning('Your KYC is not verified. You can only navigate once KYC is verified.');
      }
      
      // Redirect after a small delay to let toast render
      const timer = setTimeout(() => {
        navigate('/lawyerdashboard', { replace: true });
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isKycVerified, isPathAllowedWithoutKyc, location.pathname, navigate]);

  // Don't render children if blocked
  if (!isKycVerified && !isPathAllowedWithoutKyc) {
    return null;
  }

  return children;
};

export default LawyerReviewGuard;
