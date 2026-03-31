import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { DollarSign, Calendar, Clock, CheckCircle, AlertCircle, XCircle, CreditCard } from "lucide-react";
import { respondToCasePayment, lawyerRespondToCounter, initiateEsewaPayment, initiateKhaltiPayment } from "../../axios/casePaymentAPI";
import { redirectToEsewa } from "../../utils/esewaRedirect";
import { toast } from "react-toastify";

const PaymentRequestCard = ({ paymentRequest, currentUser, onResponseSuccess }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [counterAmount, setCounterAmount] = useState("");

  // Debug logging
  useEffect(() => {
    console.log("PaymentRequestCard received:", paymentRequest);
    console.log("Current user:", currentUser);
    console.log("Lawyer ID:", paymentRequest?.lawyer_id);
    console.log("Client ID:", paymentRequest?.client_id);
    console.log("Lawyer name:", paymentRequest?.lawyer_name);
    console.log("Client name:", paymentRequest?.client_name);
  }, [paymentRequest, currentUser]);

  const isLawyer = currentUser?.id === paymentRequest?.lawyer_id;
  const isClient = currentUser?.id === paymentRequest?.client_id;

  // Format currency
  const formatCurrency = (amount) => {
    return `Rs. ${parseFloat(amount).toLocaleString("en-NP", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Get status styling
  const getStatusStyle = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      negotiating: "bg-blue-100 text-blue-800 border-blue-300",
      agreed: "bg-green-100 text-green-800 border-green-300",
      paid: "bg-green-100 text-green-800 border-green-300",
      cancelled: "bg-gray-100 text-gray-800 border-gray-300",
      disputed: "bg-red-100 text-red-800 border-red-300",
    };
    return styles[status] || styles.pending;
  };

  // Get status icon
  const getStatusIcon = (status) => {
    const icons = {
      pending: <AlertCircle className="w-4 h-4" />,
      negotiating: <Clock className="w-4 h-4" />,
      agreed: <CheckCircle className="w-4 h-4" />,
      paid: <CheckCircle className="w-4 h-4" />,
      cancelled: <XCircle className="w-4 h-4" />,
      disputed: <AlertCircle className="w-4 h-4" />,
    };
    return icons[status] || icons.pending;
  };

  // Handle client accept
  const handleAccept = async () => {
    setLoading(true);
    try {
      const response = await respondToCasePayment(paymentRequest.id, "accept");
      if (response.data.IsSuccess) {
        toast.success(t("casePayment.acceptedSuccessfully") || "Payment request accepted!");
        onResponseSuccess();
      }
    } catch (error) {
      toast.error(error.response?.data?.error_message || t("casePayment.errorAccepting") || "Error accepting payment request");
    } finally {
      setLoading(false);
    }
  };

  // Handle client reject
  const handleReject = async () => {
    setLoading(true);
    try {
      const response = await respondToCasePayment(paymentRequest.id, "reject");
      if (response.data.IsSuccess) {
        toast.success(t("casePayment.rejectedSuccessfully") || "Payment request rejected!");
        onResponseSuccess();
      }
    } catch (error) {
      toast.error(error.response?.data?.error_message || t("casePayment.errorRejecting") || "Error rejecting payment request");
    } finally {
      setLoading(false);
    }
  };

  // Handle client counter-offer
  const handleCounter = async () => {
    if (!counterAmount || parseFloat(counterAmount) <= 0) {
      toast.error(t("casePayment.enterValidAmount") || "Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      const response = await respondToCasePayment(
        paymentRequest.id,
        "counter",
        parseFloat(counterAmount)
      );
      if (response.data.IsSuccess) {
        toast.success(t("casePayment.counterOfferSent") || "Counter-offer sent!");
        setCounterAmount("");
        onResponseSuccess();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.error_message ||
          t("casePayment.errorSendingCounter") ||
          "Error sending counter-offer"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle lawyer accept counter
  const handleLawyerAcceptCounter = async () => {
    setLoading(true);
    try {
      const response = await lawyerRespondToCounter(paymentRequest.id, "accept");
      if (response.data.IsSuccess) {
        toast.success(t("casePayment.counterAccepted") || "Counter-offer accepted!");
        onResponseSuccess();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.error_message ||
          t("casePayment.errorAcceptingCounter") ||
          "Error accepting counter-offer"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle lawyer counter-response
  const handleLawyerCounter = async () => {
    if (!counterAmount || parseFloat(counterAmount) <= 0) {
      toast.error(t("casePayment.enterValidAmount") || "Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      const response = await lawyerRespondToCounter(
        paymentRequest.id,
        "counter",
        parseFloat(counterAmount)
      );
      if (response.data.IsSuccess) {
        toast.success(t("casePayment.counterOfferSent") || "Counter-offer sent!");
        setCounterAmount("");
        onResponseSuccess();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.error_message ||
          t("casePayment.errorSendingCounter") ||
          "Error sending counter-offer"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle eSewa payment
  const handleEsewaPayment = async () => {
    setLoading(true);
    try {
      const response = await initiateEsewaPayment(paymentRequest.id);
      if (response.data.IsSuccess) {
        const { esewa_url, params } = response.data.Result;
        redirectToEsewa(esewa_url, params);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.error_message?.error || 
        t("casePayment.errorInitiatingEsewa") || 
        "Error initiating eSewa payment"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle Khalti payment
  const handleKhaltiPayment = async () => {
    setLoading(true);
    try {
      const response = await initiateKhaltiPayment(paymentRequest.id);
      if (response.data.IsSuccess) {
        const { khalti_payment_url } = response.data.Result;
        window.location.href = khalti_payment_url;
      }
    } catch (error) {
      toast.error(
        error.response?.data?.error_message?.error || 
        t("casePayment.errorInitiatingKhalti") || 
        "Error initiating Khalti payment"
      );
    } finally {
      setLoading(false);
    }
  };

  // Guard clause for missing data
  if (!paymentRequest) {
    console.warn("PaymentRequestCard: No payment request data provided");
    return <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-800">No payment request data available</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t("casePayment.paymentRequest") || "Payment Request"}
              </h3>
              <p className="text-sm text-gray-600">{paymentRequest.case_title}</p>
            </div>
          </div>
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-full border ${getStatusStyle(
              paymentRequest.status
            )}`}
          >
            {getStatusIcon(paymentRequest.status)}
            <span className="text-sm font-medium capitalize">{paymentRequest.status}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Amount Information */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">
              {t("casePayment.proposedAmount") || "Proposed Amount"}
            </p>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(paymentRequest.proposed_amount)}
            </p>
          </div>

          {paymentRequest.client_counter_offer && (
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">
                {t("casePayment.clientCounter") || "Client Counter-Offer"}
              </p>
              <p className="text-2xl font-bold text-yellow-600">
                {formatCurrency(paymentRequest.client_counter_offer)}
              </p>
            </div>
          )}

          {paymentRequest.current_agreed_amount && (
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">
                {t("casePayment.agreedAmount") || "Agreed Amount"}
              </p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(paymentRequest.current_agreed_amount)}
              </p>
            </div>
          )}
        </div>

        {/* Parties Information */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div>
            <p className="text-sm font-semibold text-gray-900 mb-2">
              {t("casePayment.lawyer") || "Lawyer"}
            </p>
            <div className="flex items-center gap-3">
              {paymentRequest.lawyer_profile_image && (
                <img
                  src={paymentRequest.lawyer_profile_image}
                  alt={paymentRequest.lawyer_name}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div>
                <p className="font-medium text-gray-900">{paymentRequest.lawyer_name}</p>
                <p className="text-sm text-gray-600">{paymentRequest.lawyer_email}</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900 mb-2">
              {t("casePayment.client") || "Client"}
            </p>
            <div className="flex items-center gap-3">
              {paymentRequest.client_profile_image && (
                <img
                  src={paymentRequest.client_profile_image}
                  alt={paymentRequest.client_name}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div>
                <p className="font-medium text-gray-900">{paymentRequest.client_name}</p>
                <p className="text-sm text-gray-600">{paymentRequest.client_email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {paymentRequest.description && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-semibold text-gray-900 mb-2">
              {t("casePayment.description") || "Description"}
            </p>
            <p className="text-gray-700">{paymentRequest.description}</p>
          </div>
        )}

        {/* Timeline */}
        <div className="grid grid-cols-2 gap-4 text-sm border-t border-gray-200 pt-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>
              {t("casePayment.created") || "Created"}: {new Date(paymentRequest.created_at).toLocaleDateString()}
            </span>
          </div>
          {paymentRequest.expires_at && (
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>
                {t("casePayment.expires") || "Expires"}: {new Date(paymentRequest.expires_at).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {/* Actions - Client View */}
        {isClient && paymentRequest.status === "pending" && (
          <div className="space-y-4 border-t border-gray-200 pt-6">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-900">
                {t("casePayment.pleaseConfirm") || "Please review the requested amount and confirm to proceed with payment."}
              </p>
            </div>
            <button
              onClick={handleAccept}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg shadow-sm transition-all"
            >
              {loading ? t("casePayment.loading") || "Processing..." : t("casePayment.confirmAndPay") || "Confirm Amount & Pay"}
            </button>
          </div>
        )}

        {/* Lawyer View - Waiting Message */}
        {isLawyer && paymentRequest.status === "pending" && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 mt-4">
            <p className="text-sm font-medium text-blue-900 text-center">
              {t("casePayment.waitingForClient") || "Waiting for client to confirm and complete the payment."}
            </p>
          </div>
        )}


        {/* Status Info & Payment Buttons */}
        {paymentRequest.status === "agreed" && (
          <div className="space-y-4 border-t border-gray-200 pt-6">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm font-medium text-green-900">
                {t("casePayment.amountAgreed") || "Amount agreed! Proceed to payment:"}{" "}
                <span className="font-bold">{formatCurrency(paymentRequest.current_agreed_amount)}</span>
              </p>
            </div>

            {isClient && (
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleEsewaPayment}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 bg-[#60bb46] hover:bg-[#52a03c] disabled:bg-gray-400 text-white font-bold py-3 rounded-lg shadow-sm transition-all"
                >
                  <CreditCard size={18} />
                  {loading ? t("casePayment.loading") || "Processing..." : t("casePayment.payWithEsewa") || "Pay with eSewa"}
                </button>
                <button
                  onClick={handleKhaltiPayment}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 bg-[#5d2e8e] hover:bg-[#4d2675] disabled:bg-gray-400 text-white font-bold py-3 rounded-lg shadow-sm transition-all"
                >
                  <CreditCard size={18} />
                  {loading ? t("casePayment.loading") || "Processing..." : t("casePayment.payWithKhalti") || "Pay with Khalti"}
                </button>
              </div>
            )}
          </div>
        )}

        {paymentRequest.status === "paid" && (
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm font-medium text-green-900">
              {t("casePayment.paymentCompleted") || "Payment completed"}
            </p>
            {paymentRequest.paid_at && (
              <p className="text-xs text-green-700 mt-1">
                {t("casePayment.paidOn") || "Paid on"}: {new Date(paymentRequest.paid_at).toLocaleString()}
              </p>
            )}
          </div>
        )}

        {paymentRequest.status === "disputed" && (
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm font-medium text-red-900">
              {t("casePayment.disputed") || "This payment request has been escalated to admin for dispute resolution"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentRequestCard;
