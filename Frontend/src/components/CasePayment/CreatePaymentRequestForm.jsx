import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { DollarSign, AlertCircle } from "lucide-react";
import { createCasePaymentRequest } from "../../axios/casePaymentAPI";
import { toast } from "react-toastify";

const CreatePaymentRequestForm = ({ caseId, caseTitle, onSuccess, isLoading = false }) => {
  const { t } = useTranslation();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = t("casePayment.enterValidAmount") || "Please enter a valid amount";
    }

    if (parseFloat(amount) > 999999) {
      newErrors.amount =
        t("casePayment.amountTooLarge") || "Amount cannot exceed Rs. 999,999";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const payload = {
        case_id: caseId,
        proposed_amount: parseFloat(amount),
        description: description
      };
      console.log("Sending payment request payload:", payload);
      
      const response = await createCasePaymentRequest(
        caseId,
        parseFloat(amount),
        description
      );

      if (response.data.IsSuccess) {
        toast.success(
          t("casePayment.requestCreated") ||
            "Payment request created successfully!"
        );
        setAmount("");
        setDescription("");
        onSuccess(response.data.Result.payment_request);
      }
    } catch (error) {
      console.error("Payment request error:", error.response?.data);
      
      // The backend returns errors in different formats
      let errorMsg = "Error creating payment request";
      let isAlreadyExists = false;
      
      if (error.response?.data) {
        const data = error.response.data;
        
        // Try different error message locations
        if (data.ErrorMessage) {
          console.log("Full ErrorMessage object:", data.ErrorMessage);
          if (typeof data.ErrorMessage === 'object') {
            // If it's an object, try to extract the error message
            errorMsg = data.ErrorMessage.error || JSON.stringify(data.ErrorMessage);
            // Check if it's the "already exists" error
            isAlreadyExists = errorMsg.includes("already exists");
          } else {
            errorMsg = data.ErrorMessage;
          }
        } else if (data.error_message) {
          errorMsg = data.error_message;
        } else if (data.error) {
          errorMsg = data.error;
        } else if (data.errors) {
          errorMsg = JSON.stringify(data.errors);
        }
      }
      
      console.error("Parsed error message:", errorMsg);
      
      // If payment request already exists, reload the existing one instead of showing error
      if (isAlreadyExists) {
        console.log("Payment request already exists. Reloading existing request...");
        // Call onSuccess to reload payment requests and show the existing one
        onSuccess();
      } else {
        toast.error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <DollarSign className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {t("casePayment.requestPayment") || "Request Payment"}
            </h3>
            <p className="text-sm text-gray-600">{caseTitle}</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Info banner */}
        <div className="flex gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">
              {t("casePayment.paymentInfo") || "Payment Information"}
            </p>
            <ul className="text-sm text-blue-800 mt-1 space-y-1 ml-4 list-disc">
              <li>
                {t("casePayment.oneTimeRequest") || "This is a one-time payment request for total legal services."}
              </li>
              <li>
                {t("casePayment.clientWillPay") || "The client will be notified to review and complete the payment."}
              </li>
              <li>
                {t("casePayment.expiresIn30Days") || "Request expires in 30 days if not paid."}
              </li>
              <li>
                {t("casePayment.platformFee10Percent") || "Platform takes 10% commission on the total amount."}
              </li>
            </ul>
          </div>
        </div>

        {/* Proposed Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-900 mb-2">
            {t("casePayment.proposedAmount") || "Proposed Amount"}
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 font-medium">
              Rs.
            </span>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              max="999999"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={loading || isLoading}
              placeholder={t("casePayment.enterAmount") || "Enter amount"}
              className={`w-full pl-12 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 transition ${
                errors.amount ? "border-red-500" : "border-gray-300"
              }`}
            />
          </div>
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
          )}
          {amount && (
            <p className="mt-2 text-sm text-gray-600">
              {t("casePayment.yourEarning") || "Your earning (after 10% commission)"}:{" "}
              <span className="font-semibold text-gray-900">
                Rs. {(parseFloat(amount) * 0.9).toLocaleString("en-NP", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </p>
          )}
        </div>

        {/* Description/Justification */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-2">
            {t("casePayment.justification") || "Justification (Optional)"}
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading || isLoading}
            placeholder={t("casePayment.explainAmount") ||
              "Explain why you're requesting this amount..."}
            rows="4"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 transition"
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading || isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            {loading || isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {t("casePayment.sending") || "Sending..."}
              </>
            ) : (
              <>
                <DollarSign className="w-5 h-5" />
                {t("casePayment.sendRequest") || "Send Payment Request"}
              </>
            )}
          </button>
        </div>

        {/* Terms */}
        <p className="text-xs text-gray-600 text-center">
          {t("casePayment.bySubmitting") ||
            "By submitting, you agree that this payment reflects the fair value of your legal services."}
        </p>
      </form>
    </div>
  );
};

export default CreatePaymentRequestForm;
