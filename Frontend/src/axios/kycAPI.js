import axiosInstance from "./axiosinstance";

/**
 * API module for KYC and lawyer information
 */

/**
 * Get detailed lawyer profile including KYC and availability info
 * @param {number} lawyerId - The lawyer's user ID
 * @returns {Promise} Lawyer profile with KYC data
 */
export const getLawyerDetail = (lawyerId) => {
  return axiosInstance.get(`/kyc/lawyer/${lawyerId}/`);
};

/**
 * Get all verified lawyers with KYC info
 * @param {Object} params - Query parameters (specialization, etc)
 * @returns {Promise} List of verified lawyers
 */
export const getVerifiedLawyers = (params = {}) => {
  return axiosInstance.get(`/kyc/verified-lawyers/`, { params });
};

/**
 * Get current user's KYC status (for lawyers)
 * @returns {Promise} Current user's KYC data
 */
export const getMyKYC = () => {
  return axiosInstance.get(`/kyc/my-kyc/`);
};

/**
 * Get lawyer availability - parsed days and time slots
 * @param {number} lawyerId - The lawyer's user ID
 * @returns {Promise & Object} { availableDays: [], availableFrom: "", availableUntil: "" }
 */
export const getLawyerAvailability = async (lawyerId) => {
  try {
    const response = await getLawyerDetail(lawyerId);
    // KYC API returns data directly (standard DRF response, not wrapped)
    const lawyerData = response.data;
    return {
      availableDays: lawyerData.availability_days || [],
      availableFrom: lawyerData.available_from || "10:00",
      availableUntil: lawyerData.available_until || "17:00",
    };
  } catch (error) {
    console.error("Failed to fetch lawyer availability:", error);
    return null;
  }
};
