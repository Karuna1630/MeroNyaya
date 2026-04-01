import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { DollarSign, AlertCircle, Info, ChevronRight, Briefcase } from "lucide-react";
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
      newErrors.amount = t("casePayment.enterValidAmount");
    }

    if (parseFloat(amount) > 999999) {
      newErrors.amount = t("casePayment.amountTooLarge");
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
      const response = await createCasePaymentRequest(
        caseId,
        parseFloat(amount),
        description
      );

      if (response.data.IsSuccess) {
        toast.success(t("casePayment.requestCreated"));
        setAmount("");
        setDescription("");
        onSuccess(response.data.Result.payment_request);
      }
    } catch (error) {
      let errorMsg = t("casePayment.errorCreating");
      let isAlreadyExists = false;
      
      if (error.response?.data) {
        const data = error.response.data;
        if (data.ErrorMessage) {
          if (typeof data.ErrorMessage === 'object') {
            const innerError = data.ErrorMessage.error || JSON.stringify(data.ErrorMessage);
            isAlreadyExists = innerError.includes("already exists");
            errorMsg = innerError;
          } else {
            errorMsg = data.ErrorMessage;
          }
        } else if (data.error_message) {
          errorMsg = data.error_message;
        }
      }
      
      if (isAlreadyExists) {
        onSuccess();
      } else {
        toast.error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
      }
    } finally {
      setLoading(false);
    }
  };

  const earnings = amount ? (parseFloat(amount) * 0.9).toFixed(2) : "0.00";

  return (
    <div className="bg-white rounded-xl shadow-md border-2 border-blue-500 overflow-hidden max-w-2xl mx-auto font-sans">
      {/* Simple Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Briefcase className="w-6 h-6 text-blue-600" />
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {t("casePayment.requestPayment")}
            </h3>
            <p className="text-sm text-gray-500">{caseTitle}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Info Banner */}
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex gap-3">
          <Info className="w-5 h-5 text-blue-600 shrink-0" />
          <div>
             <h4 className="text-xs font-bold text-blue-900 uppercase mb-1">{t("casePayment.paymentGuide")}</h4>
             <p className="text-[11px] text-blue-800 leading-tight">
               One-time total billing • 10% Platform Fee • Secure handling
             </p>
          </div>
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <label htmlFor="amount" className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {t("casePayment.proposedAmount")}
            </label>
            {errors.amount && (
              <span className="text-[10px] font-bold text-red-500 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.amount}
              </span>
            )}
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold text-gray-400">Rs.</span>
            <input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={loading || isLoading}
              placeholder="0.00"
              className={`w-full pl-14 pr-4 py-4 bg-gray-50 border-2 rounded-lg text-2xl font-black text-gray-900 focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all ${
                errors.amount ? "border-red-200" : "border-transparent focus:border-blue-500"
              }`}
            />
          </div>
        </div>

        {/* Breakdown Card */}
        <div className="p-4 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-between">
           <div className="flex items-center gap-3">
              <DollarSign size={20} className="text-emerald-600" />
              <div>
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t("casePayment.yourNetEarning")}</p>
                 <p className="text-lg font-black text-emerald-600">Rs. {parseFloat(earnings).toLocaleString()}</p>
              </div>
           </div>
           <div className="text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t("casePayment.platformFee")}</p>
              <p className="text-xs font-bold text-red-500">- Rs. {(amount ? parseFloat(amount) * 0.1 : 0).toLocaleString()}</p>
           </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label htmlFor="description" className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
            {t("casePayment.justificationOptional")}
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading || isLoading}
            placeholder={t("casePayment.explainAmountBrief")}
            rows="3"
            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent rounded-lg text-sm font-medium text-gray-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all resize-none"
          />
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading || isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
          >
            {loading || isLoading ? (
              <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span className="uppercase tracking-widest text-sm">{t("casePayment.sendPaymentRequest")}</span>
                <ChevronRight size={18} />
              </>
            )}
          </button>
        </div>

        <p className="text-[10px] font-bold text-gray-400 text-center uppercase tracking-wider">
          {t("casePayment.termsDisclaimer")}
        </p>
      </form>
    </div>
  );
};

export default CreatePaymentRequestForm;
