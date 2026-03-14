import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { GoLaw } from "react-icons/go";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { clearError, verifyPasswordResetOtp } from "../slices/auth";

const otpValidationSchema = Yup.object({
  otp: Yup.string()
    .required("OTP is required")
    .matches(/^[0-9]{6}$/, "OTP must be 6 digits"),
});

const ForgotPasswordOtp = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { verifyLoading, verifyError } = useAppSelector((state) => state.auth);
  const storedEmail = localStorage.getItem("forgotPasswordEmail") || "";

  useEffect(() => {
    dispatch(clearError());
    if (!storedEmail) {
      navigate("/forgot-password", { replace: true });
    }
  }, [dispatch, navigate, storedEmail]);

  useEffect(() => {
    if (verifyError) {
      toast.error(verifyError);
    }
  }, [verifyError]);

  const formik = useFormik({
    initialValues: { otp: "" },
    validationSchema: otpValidationSchema,
    onSubmit: async (values, actions) => {
      const result = await dispatch(
        verifyPasswordResetOtp({
          email: storedEmail,
          otp: values.otp,
        })
      );

      if (verifyPasswordResetOtp.fulfilled.match(result)) {
        const resetToken = result.payload?.Result?.reset_token;
        const resetEmail = result.payload?.Result?.email || storedEmail;

        if (resetToken) {
          localStorage.setItem("passwordResetToken", resetToken);
        }
        if (resetEmail) {
          localStorage.setItem("forgotPasswordEmail", resetEmail);
        }

        actions.resetForm();
        toast.success("OTP verified successfully.");
        navigate("/reset-password");
      }
    },
  });

  return (
    <>
      <Header />
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
            Verify OTP
          </h2>
          <p className="text-sm text-gray-600 text-center mb-2">
            Enter the 6-digit OTP sent to your email.
          </p>
          <p className="text-xs text-center text-gray-500 mb-6">{storedEmail}</p>

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
                className={`w-full px-4 py-3 text-center tracking-widest text-lg border rounded-lg focus:outline-none focus:ring-1 ${formik.touched.otp && formik.errors.otp ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-900"}`}
              />
              {formik.touched.otp && formik.errors.otp && (
                <p className="text-red-500 text-sm mt-1 text-center">{formik.errors.otp}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={verifyLoading}
              className="w-full py-3 rounded-lg font-semibold text-white bg-blue-900 hover:bg-blue-800 disabled:opacity-60"
            >
              {verifyLoading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Wrong email?{" "}
            <span
              onClick={() => navigate("/forgot-password")}
              className="text-yellow-500 font-semibold cursor-pointer hover:underline"
            >
              Go back
            </span>
          </p>
        </div>
      </div>
      <Footer />
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default ForgotPasswordOtp;