import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { GoLaw } from "react-icons/go";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { clearError, requestPasswordResetOtp } from "../slices/auth";
import { forgotPasswordSchema } from "../utils/ForgotPasswordValidation";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { forgotPasswordLoading, forgotPasswordError } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (forgotPasswordError) {
      toast.error(forgotPasswordError);
    }
  }, [forgotPasswordError]);

  const formik = useFormik({
    initialValues: { email: "" },
    validationSchema: forgotPasswordSchema,
    onSubmit: async (values) => {
      const result = await dispatch(requestPasswordResetOtp(values));

      if (requestPasswordResetOtp.fulfilled.match(result)) {
        localStorage.setItem("forgotPasswordEmail", values.email);
        toast.success("OTP sent to your email.");
        navigate("/forgot-password/verify-otp");
      }
    },
  });

  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          <div className="flex flex-col items-center mb-6">
            <div className="bg-blue-900 text-yellow-400 p-4 rounded-xl mb-3">
              <GoLaw className="size-8" />
            </div>
            <h1 className="text-2xl font-bold">
              <span className="text-blue-900">Mero</span>
              <span className="text-yellow-500">Nyaya</span>
            </h1>
          </div>

          <h2 className="text-xl font-semibold text-center mb-2">
            Forgot Password
          </h2>
          <p className="text-sm text-gray-600 text-center mb-6">
            Enter your email address and we will send you an OTP.
          </p>

          <form onSubmit={formik.handleSubmit}>
            <div className="mb-5">
              <label className="block text-sm font-semibold mb-1">Email</label>
              <input
                name="email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 ${formik.touched.email && formik.errors.email ? "border-red-500" : "border-gray-300"}`}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="mt-1 text-xs text-red-600">{formik.errors.email}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={forgotPasswordLoading}
              className="w-full py-3 bg-blue-900 text-white rounded-lg font-semibold disabled:opacity-60"
            >
              {forgotPasswordLoading ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 mt-6">
            Remembered your password?{" "}
            <span
              onClick={() => navigate("/login")}
              className="text-yellow-500 font-semibold cursor-pointer hover:underline"
            >
              Login
            </span>
          </p>
        </div>
      </div>
      <Footer />
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default ForgotPassword;