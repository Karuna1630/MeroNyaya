import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import { clientValidationSchema, lawyerValidationSchema } from '../Utils/RegisterValidation';
import { GoLaw } from "react-icons/go";

const Register = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('Client');
  const [currentStep, setCurrentStep] = useState(1);

  // Formik
  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    },
    validationSchema: userType === 'Client' ? clientValidationSchema : lawyerValidationSchema,
    onSubmit: (values) => {
      console.log('Form Submitted:', { userType, ...values });
    },
  });

  // Handlers
  const handleUserTypeChange = (type) => {
    setUserType(type);
    setCurrentStep(1);
    formik.resetForm();
  };

  const handleContinue = () => {
    formik.setTouched({
      name: true,
      email: true,
      phone: true
    });

    const hasErrors = formik.errors.name || formik.errors.email || formik.errors.phone;
    if (!hasErrors) {
      setCurrentStep(2);
    }
  };

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
              <span className="text-yellow-500">Naya</span>
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
                Join as a{' '}
                <span className="text-yellow-500 font-semibold">
                  {userType}
                </span>
              </p>

              {/* Role Switch */}
              <div className="flex gap-4 mb-8">
                {['Client', 'Lawyer'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleUserTypeChange(type)}
                    className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                      userType === type
                        ? 'bg-white text-gray-900 border-2 border-blue-900'
                        : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:border-blue-900'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {/* Step Indicator */}
              <div className="flex items-center gap-4 mb-8">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    currentStep >= 1
                      ? 'bg-blue-900 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  1
                </div>
                <div
                  className={`flex-1 h-1 ${
                    currentStep >= 2 ? 'bg-blue-900' : 'bg-gray-200'
                  }`}
                />
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    currentStep >= 2
                      ? 'bg-blue-900 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  2
                </div>
              </div>

              {/* Step 1 */}
              {currentStep === 1 && (
                <div className="mb-8">
                  {/* Name Field */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {userType === 'Client' ? 'Full Name' : 'Lawyer Name'}
                    </label>
                    <input
                      name="name"
                      type="text"
                      placeholder="Enter your name"
                      value={formik.values.name}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-1 transition-colors ${
                        formik.touched.name && formik.errors.name
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:border-blue-900 focus:ring-blue-900'
                      }`}
                    />
                    {formik.touched.name && formik.errors.name && (
                      <p className="text-red-500 text-sm mt-1">{formik.errors.name}</p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-1 transition-colors ${
                        formik.touched.email && formik.errors.email
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:border-blue-900 focus:ring-blue-900'
                      }`}
                    />
                    {formik.touched.email && formik.errors.email && (
                      <p className="text-red-500 text-sm mt-1">{formik.errors.email}</p>
                    )}
                  </div>

                  {/* Phone Field */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      name="phone"
                      type="tel"
                      placeholder="+977 9845656421"
                      value={formik.values.phone}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-1 transition-colors ${
                        formik.touched.phone && formik.errors.phone
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:border-blue-900 focus:ring-blue-900'
                      }`}
                    />
                    {formik.touched.phone && formik.errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{formik.errors.phone}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2 */}
              {currentStep === 2 && (
                <div className="mb-8">
                  {/* Password Field */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      name="password"
                      type="password"
                      placeholder="Create a strong password"
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-1 transition-colors ${
                        formik.touched.password && formik.errors.password
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:border-blue-900 focus:ring-blue-900'
                      }`}
                    />
                    {formik.touched.password && formik.errors.password && (
                      <p className="text-red-500 text-sm mt-1">{formik.errors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <input
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={formik.values.confirmPassword}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-1 transition-colors ${
                        formik.touched.confirmPassword && formik.errors.confirmPassword
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:border-blue-900 focus:ring-blue-900'
                      }`}
                    />
                    {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">{formik.errors.confirmPassword}</p>
                    )}
                  </div>

                  <div className="flex items-start gap-3 pt-2">
                    <input type="checkbox" className="mt-1 w-4 h-4 rounded border-gray-300" />
                    <span className="text-sm text-gray-700">
                      I agree to the{' '}
                      <span className="text-yellow-500 hover:underline cursor-pointer">
                        Terms of Service
                      </span>{' '}
                      and{' '}
                      <span className="text-yellow-500 hover:underline cursor-pointer">
                        Privacy Policy
                      </span>
                    </span>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-4">
                {currentStep === 2 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="flex-1 py-3 px-6 border-2 border-gray-300 text-gray-900 rounded-lg font-semibold"
                  >
                    ← Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={currentStep === 1 ? handleContinue : formik.handleSubmit}
                  className="flex-1 py-3 px-6 rounded-lg font-semibold text-white bg-blue-900 hover:bg-blue-800"
                >
                  {currentStep === 1 ? 'Continue →' : 'Create Account →'}
                </button>
              </div>

              {/* Login */}
              <p className="text-center text-gray-600 text-sm mt-6">
                Already have an account?{' '}
                <span
                  onClick={() => navigate('/login')}
                  className="text-yellow-500 hover:underline cursor-pointer font-semibold"
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