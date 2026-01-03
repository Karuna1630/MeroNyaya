import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { GoLaw } from "react-icons/go";

import { useAppDispatch, useAppSelector } from "../store/hooks";
import { verifyOtp, clearError } from "../slices/auth";

const otpValidationSchema = Yup.object({
  otp: Yup.string()
    .required("OTP is required")
    .matches(/^[0-9]{6}$/, "OTP must be 6 digits"),
});

const VerifyOtp = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { verifyLoading, verifyError } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const formik = useFormik({
    initialValues: { otp: "" },
    validationSchema: otpValidationSchema,
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
        actions.resetForm();
        navigate("/login");
      }
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8">

        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-blue-900 text-yellow-400 p-3 rounded-xl mb-2">
            <GoLaw className="size-7" />
          </div>
          <h1 className="text-2xl font-bold">
            <span className="text-blue-900">Mero</span>
            <span className="text-yellow-500">Nyaya</span>
          </h1>
        </div>

        {/* Heading */}
        <h2 className="text-xl font-bold text-center text-gray-900 mb-2">
          Verify Email
        </h2>
        <p className="text-sm text-gray-600 text-center mb-6">
          Enter the 6-digit OTP sent to your email
        </p>

        {/* Form */}
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

            {/* Redux API error */}
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
            {verifyLoading ? "Verifying..." : "Verify OTP →"}
          </button>
        </form>

        {/* Back */}
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
