import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { GoLaw } from "react-icons/go";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { clearError, resetPassword } from "../slices/auth";
import { resetPasswordSchema } from "../utils/ResetPasswordValidation";

const ResetPassword = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetCompleted, setResetCompleted] = useState(false);
  const resetEmail = localStorage.getItem("forgotPasswordEmail") || "";
  const resetToken = localStorage.getItem("passwordResetToken") || "";
  const { resetPasswordLoading, resetPasswordError } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    dispatch(clearError());
    if (!resetCompleted && (!resetEmail || !resetToken)) {
      navigate("/forgot-password", { replace: true });
    }
  }, [dispatch, navigate, resetCompleted, resetEmail, resetToken]);

  useEffect(() => {
    if (resetPasswordError) {
      toast.error(resetPasswordError);
    }
  }, [resetPasswordError]);

  const formik = useFormik({
    initialValues: {
      new_password: "",
      confirm_password: "",
    },
    validationSchema: resetPasswordSchema,
    onSubmit: async (values, actions) => {
      const result = await dispatch(
        resetPassword({
          email: resetEmail,
          reset_token: resetToken,
          ...values,
        })
      );

      if (resetPassword.fulfilled.match(result)) {
        setResetCompleted(true);
        localStorage.removeItem("forgotPasswordEmail");
        localStorage.removeItem("passwordResetToken");
        actions.resetForm();
        navigate("/login", {
          replace: true,
          state: {
            toastMessage: "Password reset successful. Please login.",
          },
        });
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
            Reset Password
          </h2>
          <p className="text-sm text-gray-600 text-center mb-6">
            Enter your new password to complete recovery.
          </p>

          <form onSubmit={formik.handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  name="new_password"
                  type={showNewPassword ? "text" : "password"}
                  value={formik.values.new_password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 ${formik.touched.new_password && formik.errors.new_password ? "border-red-500" : "border-gray-300"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showNewPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
              {formik.touched.new_password && formik.errors.new_password && (
                <p className="mt-1 text-xs text-red-600">{formik.errors.new_password}</p>
              )}
            </div>

            <div className="mb-5">
              <label className="block text-sm font-semibold mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  name="confirm_password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formik.values.confirm_password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 ${formik.touched.confirm_password && formik.errors.confirm_password ? "border-red-500" : "border-gray-300"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
              {formik.touched.confirm_password && formik.errors.confirm_password && (
                <p className="mt-1 text-xs text-red-600">{formik.errors.confirm_password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={resetPasswordLoading}
              className="w-full py-3 bg-blue-900 text-white rounded-lg font-semibold disabled:opacity-60"
            >
              {resetPasswordLoading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
      <Footer />
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default ResetPassword;