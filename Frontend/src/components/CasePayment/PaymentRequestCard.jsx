import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { DollarSign, Calendar, Clock, CheckCircle, AlertCircle, XCircle } from "lucide-react";
import { respondToCasePayment, initiateEsewaPayment, initiateKhaltiPayment } from "../../axios/casePaymentAPI";
import { redirectToEsewa } from "../../utils/esewaRedirect";
import { getImageUrl } from "../../utils/imageUrl";
import { toast } from "react-toastify";

const PaymentRequestCard = ({ paymentRequest, currentUser, onResponseSuccess }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [loadingEsewa, setLoadingEsewa] = useState(false);
  const [loadingKhalti, setLoadingKhalti] = useState(false);

  const isLawyer = currentUser?.id === paymentRequest?.lawyer_id;
  const isClient = currentUser?.id === paymentRequest?.client_id;

  const formatCurrency = (amount) => {
    return `Rs. ${parseFloat(amount).toLocaleString("en-NP", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
        icon: <Clock className="w-4 h-4" />,
        label: t("casePayment.pending")
      },
      agreed: {
        bg: "bg-emerald-50",
        text: "text-emerald-700",
        border: "border-emerald-200",
        icon: <CheckCircle className="w-4 h-4" />,
        label: t("casePayment.accepted")
      },
      paid: {
        bg: "bg-emerald-100",
        text: "text-emerald-800",
        border: "border-emerald-300",
        icon: <CheckCircle className="w-4 h-4" />,
        label: t("casePayment.paid")
      },
      expired: {
        bg: "bg-red-50",
        text: "text-red-700",
        border: "border-red-200",
        icon: <XCircle className="w-4 h-4" />,
        label: t("casePayment.expired")
      }
    };
    return configs[status] || configs.pending;
  };

  const statusConfig = getStatusConfig(paymentRequest.status);

  const handleAccept = async () => {
    setLoading(true);
    try {
      const response = await respondToCasePayment(paymentRequest.id, "accept");
      if (response.data.IsSuccess) {
        toast.success(t("casePayment.acceptedSuccessfully"));
        onResponseSuccess();
      }
    } catch (error) {
      toast.error(error.response?.data?.ErrorMessage?.[0] || t("casePayment.errorAccepting"));
    } finally {
      setLoading(false);
    }
  };

  const handleEsewaPayment = async () => {
    setLoadingEsewa(true);
    try {
      const response = await initiateEsewaPayment(paymentRequest.id);
      if (response.data.IsSuccess) {
        const { esewa_url, params } = response.data.Result;
        redirectToEsewa(esewa_url, params);
      }
    } catch (error) {
      const backendMessage =
        error?.response?.data?.ErrorMessage?.error ||
        error?.response?.data?.ErrorMessage?.[0] ||
        error?.response?.data?.error ||
        error?.message;
      toast.error(backendMessage || t("casePayment.errorInitiatingEsewa"));
    } finally {
      setLoadingEsewa(false);
    }
  };

  const handleKhaltiPayment = async () => {
    setLoadingKhalti(true);
    try {
      const response = await initiateKhaltiPayment(paymentRequest.id);
      if (response.data.IsSuccess) {
        const { khalti_payment_url } = response.data.Result;
        window.location.href = khalti_payment_url;
      }
    } catch (error) {
      const backendMessage =
        error?.response?.data?.ErrorMessage?.error ||
        error?.response?.data?.ErrorMessage?.[0] ||
        error?.response?.data?.error ||
        error?.message;
      toast.error(backendMessage || t("casePayment.errorInitiatingKhalti"));
    } finally {
      setLoadingKhalti(false);
    }
  };

  if (!paymentRequest) return null;

  return (
    <div className="w-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {t("casePayment.paymentRequest")}
            </h3>
            <p className="text-sm text-slate-500">{paymentRequest.case_title}</p>
          </div>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
          {statusConfig.icon}
          <span>{statusConfig.label}</span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="text-center py-5 bg-linear-to-br from-slate-50 to-blue-50/40 rounded-2xl border border-slate-200">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            {t("casePayment.requestedAmount")}
          </p>
          <p className="text-4xl font-black text-[#0F1A3D]">
            {formatCurrency(paymentRequest.proposed_amount)}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <img
              src={getImageUrl(paymentRequest.lawyer_profile_image, paymentRequest.lawyer_name)}
              alt={paymentRequest.lawyer_name}
              className="w-12 h-12 rounded-full object-cover shadow-sm"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">{t("casePayment.lawyer")}</p>
              <p className="text-sm font-bold text-slate-900 truncate">{paymentRequest.lawyer_name}</p>
              <p className="text-[11px] text-slate-500 truncate">{paymentRequest.lawyer_email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <img
              src={getImageUrl(paymentRequest.client_profile_image, paymentRequest.client_name)}
              alt={paymentRequest.client_name}
              className="w-12 h-12 rounded-full object-cover shadow-sm"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">{t("casePayment.client")}</p>
              <p className="text-sm font-bold text-slate-900 truncate">{paymentRequest.client_name}</p>
              <p className="text-[11px] text-slate-500 truncate">{paymentRequest.client_email}</p>
            </div>
          </div>
        </div>

        {paymentRequest.description && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-xs font-bold text-slate-500 uppercase mb-2">{t("casePayment.notes")}</p>
            <p className="text-sm text-slate-700 italic">"{paymentRequest.description}"</p>
          </div>
        )}

        <div className="flex flex-wrap justify-between items-center gap-3 text-[11px] font-bold text-slate-500 uppercase pt-4 border-t border-slate-100">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
            <Calendar size={14} className="text-slate-500" />
            <span>{t("casePayment.requested")}: {new Date(paymentRequest.created_at).toLocaleDateString()}</span>
          </div>
          {paymentRequest.status === 'paid' && paymentRequest.paid_at && (
            <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              <CheckCircle size={14} />
              <span>{t("casePayment.paidOn")}: {new Date(paymentRequest.paid_at).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="pt-2">
          {isClient && paymentRequest.status === "pending" && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
                <p className="text-xs font-medium text-blue-800">
                  {t("casePayment.pleaseConfirmInfo")}
                </p>
              </div>
              <button
                onClick={handleAccept}
                disabled={loading}
                className="w-full bg-[#0F1A3D] hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold py-3.5 rounded-xl shadow-sm transition-all"
              >
                {loading ? t("casePayment.loading") : t("casePayment.confirmAndProceed")}
              </button>
            </div>
          )}

          {isLawyer && paymentRequest.status === "pending" && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center">
              <p className="text-xs font-bold text-slate-500 uppercase flex items-center justify-center gap-2">
                <Clock size={14} /> {t("casePayment.waitingForClient")}
              </p>
            </div>
          )}

          {paymentRequest.status === "agreed" && (
            <div className="space-y-4 text-center">
              <p className="text-sm font-bold text-emerald-700 bg-emerald-50 py-2.5 rounded-xl border border-emerald-100 uppercase tracking-tighter">
                {t("casePayment.amountConfirmed")}
              </p>
              {isClient && (
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={handleEsewaPayment}
                    disabled={loadingEsewa || loadingKhalti}
                    className="flex flex-col items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-[#60bb46] text-[#60bb46] py-3 rounded-xl font-bold transition-all"
                  >
                    <img src="https://esewa.com.np/common/images/esewa_logo.png" alt="eSewa" className="h-6" />
                    <span className="text-[10px] uppercase">{t("casePayment.payWithEsewa")}</span>
                  </button>
                  <button
                    onClick={handleKhaltiPayment}
                    disabled={loadingEsewa || loadingKhalti}
                    className="flex flex-col items-center justify-center gap-2 bg-white hover:bg-slate-50 border border-[#5d2e8e] text-[#5d2e8e] py-3 rounded-xl font-bold transition-all"
                  >
                    <img src="https://khalti.com/static/img/logo1.png" alt="Khalti" className="h-6" />
                    <span className="text-[10px] uppercase">{t("casePayment.payWithKhalti")}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {paymentRequest.status === "paid" && (
            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <CheckCircle size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-900 uppercase tracking-tighter">{t("casePayment.paymentSuccess")}</p>
                <p className="text-xs font-medium text-emerald-700">{t("casePayment.transactionVerified")}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentRequestCard;
