import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { GoLaw } from 'react-icons/go';

import { useAppDispatch, useAppSelector } from '../store/hooks';
import { registerUser, clearError } from '../slices/auth';

import {
  clientValidationSchema,
  lawyerValidationSchema,
} from '../utils/RegisterValidation';

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { registerLoading, registerError } = useAppSelector(
    (state) => state.auth
  );

  const [userType, setUserType] = useState("Client");
  const [currentStep, setCurrentStep] = useState(1);

  const validationSchema =
    userType === "Client"
      ? clientValidationSchema
      : lawyerValidationSchema;

  const initialValues = {
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    terms: false,
  };

  const handleSubmit = async (values, actions) => {
    const payload = {
      name: values.name,
      email: values.email,
      phone_number: values.phone,
      password: values.password,
      role: userType.toLowerCase(),
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="bg-blue-900 text-yellow-400 p-4 rounded-xl font-bold">
              <GoLaw className="size-8" />
            </div>
            <span className="text-2xl font-bold">
              <span className="text-blue-900">Mero</span>
              <span className="text-yellow-500">Nyaya</span>
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image */}
            <div className="hidden lg:flex">
              <img
                src="https://lnplawoffice.id/wp-content/uploads/2025/10/still-life-world-intellectual-property-day-1024x1536.jpg"
                alt="Legal"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Form */}
            <div className="p-8 lg:p-12">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Create Account
              </h1>
              <p className="text-gray-600 mb-6">
                Join as a{" "}
                <span className="text-yellow-500 font-semibold">
                  {userType}
                </span>
              </p>

              {/* Error from Redux */}
              {registerError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                  <p className="text-red-600 text-sm">
                    {registerError}
                  </p>
                </div>
              )}

              {/* Role Switch */}
              <div className="flex gap-4 mb-8">
                {["Client", "Lawyer"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setUserType(type);
                      setCurrentStep(1);
                    }}
                    className={`flex-1 py-3 px-6 rounded-lg font-semibold ${
                      userType === type
                        ? "bg-white border-2 border-blue-900"
                        : "bg-gray-100"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ values, setTouched, errors }) => (
                  <Form>
                    {/* STEP 1 */}
                    {currentStep === 1 && (
                      <>
                        {["name", "email", "phone"].map((field) => (
                          <div className="mb-4" key={field}>
                            <label className="block font-semibold mb-2">
                              {field === "name"
                                ? userType === "Client"
                                  ? "Full Name"
                                  : "Lawyer Name"
                                : field.charAt(0).toUpperCase() +
                                  field.slice(1)}
                            </label>
                            <Field
                              name={field}
                              className="w-full px-4 py-3 border rounded-lg"
                            />
                            <ErrorMessage
                              name={field}
                              component="p"
                              className="text-red-500 text-sm mt-1"
                            />
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => {
                            setTouched({
                              name: true,
                              email: true,
                              phone: true,
                            });
                            if (!errors.name && !errors.email && !errors.phone) {
                              setCurrentStep(2);
                            }
                          }}
                          className="w-full py-3 bg-blue-900 text-white rounded-lg"
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
                            <label className="block font-semibold mb-2">
                              {field === "password"
                                ? "Password"
                                : "Confirm Password"}
                            </label>
                            <Field
                              name={field}
                              type="password"
                              className="w-full px-4 py-3 border rounded-lg"
                            />
                            <ErrorMessage
                              name={field}
                              component="p"
                              className="text-red-500 text-sm mt-1"
                            />
                          </div>
                        ))}

                        <button
                          type="submit"
                          disabled={registerLoading}
                          className="w-full py-3 bg-blue-900 text-white rounded-lg"
                        >
                          {registerLoading
                            ? "Creating Account..."
                            : "Create Account →"}
                        </button>
                      </>
                    )}
                  </Form>
                )}
              </Formik>

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
    </div>
  );
};

export default Register;
