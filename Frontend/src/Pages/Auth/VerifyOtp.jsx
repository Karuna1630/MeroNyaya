import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { GoLaw } from "react-icons/go";
import { toast } from "react-toastify";

import { useAppDispatch, useAppSelector } from "../store/hooks";
import { verifyOtp, resendOtp, clearError } from "../slices/auth";
import { registerOTPSchema } from "../Utils/RegisterOTPValidation";

const RESEND_COOLDOWN_SECONDS = 120;

const VerifyOtp = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [resendCountdown, setResendCountdown] = useState(() => {
    const registeredData = JSON.parse(
      localStorage.getItem("registeredData") || "{}"
    );
    const otpSentAt = Number(registeredData.otpSentAt);

    if (!Number.isFinite(otpSentAt) || otpSentAt <= 0) {
      return 0;
    }

    const elapsedSeconds = Math.floor((Date.now() - otpSentAt) / 1000);
    return Math.max(RESEND_COOLDOWN_SECONDS - elapsedSeconds, 0);
  });

  const { verifyLoading, verifyError, resendLoading, resendError } =
    useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    const registeredData = JSON.parse(
      localStorage.getItem("registeredData") || "{}"
    );

    if (!registeredData.email) {
      navigate("/register");
    }
  }, [navigate]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (resendCountdown <= 0) return;

    const timer = setInterval(() => {
      setResendCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCountdown]);

  const formik = useFormik({
    initialValues: { otp: "" },
    validationSchema: registerOTPSchema,
    onSubmit: async (values, actions) => {
      const registeredData = JSON.parse(
        localStorage.getItem("registeredData") || "{}"
      );

      const payload = {
        email: registeredData.email,
        otp: values.otp,
      };

      const result = await dispatch(verifyOtp(payload));

      if (verifyOtp.fulfilled.match(result)) {
        toast.success("Email verified successfully!");
        actions.resetForm();
        navigate("/login");
      }
    },
  });

  const handleResendOtp = async () => {
    const registeredData = JSON.parse(
      localStorage.getItem("registeredData") || "{}"
    );

    if (!registeredData.email) {
      console.error("Email not found in session");
      return;
    }

    if (resendCountdown > 0) {
      return;
    }

    const result = await dispatch(resendOtp({ email: registeredData.email }));

    if (resendOtp.fulfilled.match(result)) {
      setResendCountdown(RESEND_COOLDOWN_SECONDS);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-blue-900 text-yellow-400 p-3 rounded-xl mb-2">
            <GoLaw className="size-7" />
          </div>
          <h1 className="text-2xl font-bold">
            <span className="text-blue-900">Mero</span>
            <span className="text-yellow-500">Nyaya</span>
          </h1>
        </div>

        <h2 className="text-xl font-bold text-center text-gray-900 mb-2">
          Verify Email
        </h2>
        <p className="text-sm text-gray-600 text-center mb-6">
          Enter the 6-digit OTP sent to your email
        </p>

        <form onSubmit={formik.handleSubmit}>
          <div className="mb-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2 text-center">
              OTP Code
            </label>

            <input
              name="otp"
              type="text"
              maxLength="6"
              placeholder="------"
              value={formik.values.otp}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`w-full px-4 py-3 text-center tracking-widest text-lg border rounded-lg focus:outline-none focus:ring-1 ${
                formik.touched.otp && formik.errors.otp
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-900"
              }`}
            />

            {formik.touched.otp && formik.errors.otp && (
              <p className="text-red-500 text-sm mt-1 text-center">
                {formik.errors.otp}
              </p>
            )}

            {verifyError && (
              <p className="text-red-500 text-sm mt-1 text-center">
                {typeof verifyError === "string"
                  ? verifyError
                  : "OTP verification failed"}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={verifyLoading}
            className="w-full py-3 rounded-lg font-semibold text-white bg-blue-900 hover:bg-blue-800 disabled:opacity-60"
          >
            {verifyLoading ? "Verifying..." : "Verify OTP ->"}
          </button>

          <button
            type="button"
            onClick={handleResendOtp}
            disabled={resendLoading || resendCountdown > 0}
            className="w-full py-3 rounded-lg font-semibold text-white bg-yellow-500 hover:bg-yellow-600 disabled:opacity-60 mt-3"
          >
            {resendCountdown > 0
              ? `Resend OTP in ${resendCountdown}s`
              : resendLoading
              ? "Sending..."
              : "Resend OTP"}
          </button>

          {resendError && (
            <p className="text-red-500 text-sm mt-2 text-center">
              {typeof resendError === "string"
                ? resendError
                : "Failed to resend OTP"}
            </p>
          )}
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Wrong email?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-yellow-500 font-semibold cursor-pointer hover:underline"
          >
            Go back
          </span>
        </p>
      </div>
    </div>
  );
};

export default VerifyOtp;