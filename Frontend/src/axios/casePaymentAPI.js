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

// Client responds to payment request (accept only)
export const respondToCasePayment = (paymentRequestId, response) => {
  return axiosInstance.post(
    `/payment/cases/${paymentRequestId}/respond/`,
    { response }
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

// Verify eSewa payment for case
export const verifyEsewaPayment = (data) => {
  return axiosInstance.get("/payment/esewa/verify-case/", {
    params: { data },
  });
};

// Verify Khalti payment for case
export const verifyKhaltiPayment = (pidx, transactionId, purchaseOrderId = null) => {
  const params = { pidx };
  if (transactionId) params.transaction_id = transactionId;
  if (purchaseOrderId) params.purchase_order_id = purchaseOrderId;
  
  return axiosInstance.get("/payment/khalti/verify-case/", {
    params
  });
};

