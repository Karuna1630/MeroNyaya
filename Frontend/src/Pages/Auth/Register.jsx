import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { GoLaw } from "react-icons/go";

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
                  <p className="text-red-600 text-sm text-center mb-2">
                    {registerError}
                  </p>
                  {currentStep === 2 && (
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="px-3 py-1 text-xs font-semibold text-blue-900 border border-blue-900 rounded"
                      >
                        Go back and edit details
                      </button>
                    </div>
                  )}
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
                        ? "bg-blue-900 text-white"
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
                                  ? "bg-yellow-500 text-blue-900 border-yellow-500"
                                  : isCompleted
                                  ? "bg-blue-900 text-white border-blue-900"
                                  : "bg-gray-100 text-gray-700 border-gray-300"
                              }`}
                            >
                              {step.number}
                            </div>
                            {index < stepMeta.length - 1 && (
                              <div className="h-1 w-8 bg-gray-300"></div>
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
                              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
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
                          className="w-full py-2.5 bg-blue-900 text-white rounded-lg font-semibold"
                        >
                          Continue →
                        </button>
                      </>
                    )}

                    {/* STEP 2 */}
                    {currentStep === 2 && (
                      <>
                        {["password", "confirmPassword"].map((field) => (
                          <div className="mb-4" key={field}>
                            <label className="block text-sm font-semibold mb-1">
                              {field === "password"
                                ? "Password"
                                : "Confirm Password"}
                            </label>

                            <Field
                              name={field}
                              type="password"
                              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                            />

                            <ErrorMessage
                              name={field}
                              component="p"
                              className="text-red-500 text-xs mt-1"
                            />
                          </div>
                        ))}

                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => setCurrentStep(1)}
                            className="w-1/2 py-2.5 bg-gray-100 text-gray-800 rounded-lg font-semibold border border-gray-300"
                          >
                            ← Back
                          </button>

                          <button
                            type="submit"
                            disabled={registerLoading}
                            className="w-1/2 py-2.5 bg-blue-900 text-white rounded-lg font-semibold"
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
