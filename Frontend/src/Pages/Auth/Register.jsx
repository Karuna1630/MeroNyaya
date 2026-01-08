import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { GoLaw } from "react-icons/go";
import { FiEye, FiEyeOff } from "react-icons/fi";

import register from "../../assets/register.jpg";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { registerUser, clearError } from "../slices/auth";

import {
  clientValidationSchema,
  lawyerValidationSchema,
} from "../utils/RegisterValidation";

import Header from "../../components/Header";
import Footer from "../../components/Footer";

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { registerLoading, registerError } = useAppSelector(
    (state) => state.auth
  );

  const [userType, setUserType] = useState("Client");
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validationSchema =
    userType === "Client" ? clientValidationSchema : lawyerValidationSchema;

  const initialValues = {
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    terms: false,
  };

  const stepMeta = [
    { number: 1, label: "Profile" },
    { number: 2, label: "Security" },
  ];

  const handleSubmit = async (values, actions) => {
    const payload = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      password: values.password,
      is_lawyer: userType === "Lawyer",
    };

    const result = await dispatch(registerUser(payload));

    if (registerUser.fulfilled.match(result)) {
      actions.resetForm();
      navigate("/verify-otp");
    }
  };

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch, userType]);


  return (
    <>
      <Header />

      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-20">
        <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl/30 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* IMAGE */}
            <div className="hidden lg:block">
              <img
                src={register}
                alt="Register"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            {/* FORM */}
            <div className="p-8 lg:p-12">
              {/* LOGO */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="bg-yellow-500 text-[#0F1A3D] p-2 rounded-lg">
                  <GoLaw className="size-6" />
                </div>
                <h1 className="text-2xl font-bold">
                  <span className="text-[#0F1A3D]">Mero</span>
                  <span className="text-yellow-500">Nyaya</span>
                </h1>
              </div>

              <h2 className="text-xl font-semibold text-center mb-2">
                Create Account
              </h2>

              <p className="text-sm text-gray-600 text-center mb-6">
                Join as{" "}
                <span className="text-yellow-500 font-semibold">
                  {userType}
                </span>
              </p>

              {/* ERROR */}
              {registerError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                  <p className="text-red-600 text-sm text-center">
                    {registerError}
                  </p>
                </div>
              )}

              {/* ROLE SWITCH */}
              <div className="flex gap-3 mb-6">
                {["Client", "Lawyer"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setUserType(type);
                      setCurrentStep(1);
                    }}
                    className={`flex-1 py-2 rounded-lg font-semibold text-sm transition ${
                      userType === type
                        ? "bg-[#0F1A3D] text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                validateOnMount={true} 
                onSubmit={handleSubmit}
              >
                {({ validateForm, setTouched }) => (
                  <Form>
                    {/* STEP INDICATOR */}
                    <div className="flex items-center gap-8 mb-6">
                      {stepMeta.map((step, index) => {
                        const isActive = currentStep === step.number;
                        const isCompleted = currentStep > step.number;
                        return (
                          <div key={step.number} className="flex items-center gap-8">
                            <div
                              className={`h-10 w-10 rounded-full border-2 flex items-center justify-center font-bold text-lg transition ${
                                isActive
                                  ? "bg-yellow-500 text-[#0F1A3D] border-yellow-500"
                                  : isCompleted
                                  ? "bg-[#0F1A3D] text-white border-[#0F1A3D]"
                                  : "bg-gray-100 text-gray-700 border-gray-300"
                              }`}
                            >
                              {step.number}
                            </div>
                            {index < stepMeta.length - 1 && (
                              <div className="h-1 w-16 bg-gray-300"></div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* STEP 1 */}
                    {currentStep === 1 && (
                      <>
                        {["name", "email", "phone"].map((field) => (
                          <div className="mb-4" key={field}>
                            <label className="block text-sm font-semibold mb-1">
                              {field === "name"
                                ? userType === "Client"
                                  ? "Full Name"
                                  : "Lawyer Name"
                                : field.charAt(0).toUpperCase() +
                                  field.slice(1)}
                            </label>

                            <Field
                              name={field}
                              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0F1A3D]"
                            />

                            <ErrorMessage
                              name={field}
                              component="p"
                              className="text-red-500 text-xs mt-1"
                            />
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={async () => {
                            const errors = await validateForm();

                            setTouched({
                              name: true,
                              email: true,
                              phone: true,
                            });

                            const hasErrors = ["name", "email", "phone"].some(
                              (field) => errors[field]
                            );

                            if (!hasErrors) {
                              setCurrentStep(2);
                            }
                          }}
                          className="w-full py-2.5 bg-[#0F1A3D] text-white rounded-lg font-semibold"
                        >
                          Continue →
                        </button>
                      </>
                    )}

                    {/* STEP 2 */}
                    {currentStep === 2 && (
                      <>
                        <div className="mb-4">
                          <label className="block text-sm font-semibold mb-1">
                            Password
                          </label>
                          <div className="relative">
                            <Field
                              name="password"
                              type={showPassword ? "text" : "password"}
                              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                            </button>
                          </div>
                          <ErrorMessage
                            name="password"
                            component="p"
                            className="text-red-500 text-xs mt-1"
                          />
                        </div>

                        <div className="mb-4">
                          <label className="block text-sm font-semibold mb-1">
                            Confirm Password
                          </label>
                          <div className="relative">
                            <Field
                              name="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                              {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                            </button>
                          </div>
                          <ErrorMessage
                            name="confirmPassword"
                            component="p"
                            className="text-red-500 text-xs mt-1"
                          />
                        </div>

                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => setCurrentStep(1)}
                            className="w-1/2 py-2.5 bg-yellow-500 text-[#0F1A3D] rounded-lg font-semibold border border-yellow-500"
                          >
                            ← Back
                          </button>

                          <button
                            type="submit"
                            disabled={registerLoading}
                            className="w-1/2 py-2.5 bg-[#0F1A3D] text-white rounded-lg font-semibold"
                          >
                            {registerLoading
                              ? "Creating Account..."
                              : "Create Account →"}
                          </button>
                        </div>
                      </>
                    )}
                  </Form>
                )}
              </Formik>

              {/* LOGIN */}
              <p className="text-center text-gray-600 text-sm mt-6">
                Already have an account?{" "}
                <span
                  onClick={() => navigate("/login")}
                  className="text-yellow-500 cursor-pointer font-semibold"
                >
                  Login here
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default Register;
