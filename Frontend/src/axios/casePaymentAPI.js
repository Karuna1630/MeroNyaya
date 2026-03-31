import axiosInstance from "./axiosinstance";

/**
 * API module for case payment requests
 */

// Create a new case payment request (lawyer requests payment)
export const createCasePaymentRequest = (caseId, amount, description = "") => {
  return axiosInstance.post("/payment/cases/request/", {
    case_id: caseId,
    proposed_amount: amount,
    description: description,
  });
};

// Get payment request details
export const getCasePaymentRequest = (paymentRequestId) => {
  return axiosInstance.get(`/payment/cases/${paymentRequestId}/`);
};

// Get all payment requests for a case
export const getCasePaymentRequests = (caseId) => {
  return axiosInstance.get(`/payment/cases/${caseId}/requests/`);
};

// Client responds to payment request (accept, reject, counter)
export const respondToCasePayment = (paymentRequestId, response, counterAmount = null) => {
  const data = { response };
  if (response === "counter" && counterAmount) {
    data.counter_amount = counterAmount;
  }
  return axiosInstance.post(
    `/payment/cases/${paymentRequestId}/respond/`,
    data
  );
};

// Lawyer responds to counter-offer
export const lawyerRespondToCounter = (paymentRequestId, response, counterAmount = null) => {
  const data = { response };
  if (response === "counter" && counterAmount) {
    data.counter_amount = counterAmount;
  }
  return axiosInstance.post(
    `/payment/cases/${paymentRequestId}/counter-respond/`,
    data
  );
};

// Initiate eSewa payment for case
export const initiateEsewaPayment = (paymentRequestId) => {
  return axiosInstance.post("/payment/cases/esewa/initiate/", {
    payment_request_id: paymentRequestId,
  });
};

// Initiate Khalti payment for case
export const initiateKhaltiPayment = (paymentRequestId) => {
  return axiosInstance.post("/payment/cases/khalti/initiate/", {
    payment_request_id: paymentRequestId,
  });
};

