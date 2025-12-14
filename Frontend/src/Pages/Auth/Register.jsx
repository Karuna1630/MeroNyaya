import React, { useState} from 'react';
import { useNavigate } from 'react-router-dom'
import { useFormik } from 'formik';
import { clientValidationSchema, lawyerValidationSchema } from '../Utils/RegisterValidation';
import { GoLaw } from "react-icons/go";

const Register = () => {
    const navigate = useNavigate()
  const [userType, setUserType] = useState('Client');
  const [currentStep, setCurrentStep] = useState(1);

  // Fields for each role
  const clientFields = [
    { id: 'name', label: 'Full Name', type: 'text', placeholder: 'Enter your full name' },
    { id: 'email', label: 'Email Address', type: 'email', placeholder: 'Enter your email' },
    { id: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+977 9845656421' },
  ];

  const lawyerFields = [
    { id: 'name', label: 'Lawyer Name', type: 'text', placeholder: 'Enter your name' },
    { id: 'email', label: 'Email Address', type: 'email', placeholder: 'Enter your email' },
    { id: 'phone', label: 'Phone Number', type: 'tel', placeholder: '+977 9845656421' },
  ];

  const passwordFields = [
    { id: 'password', label: 'Password', type: 'password', placeholder: 'Create a strong password' },
    { id: 'confirmPassword', label: 'Confirm Password', type: 'password', placeholder: 'Confirm your password' },
  ];

  // Decide which fields and validation schema to use
  const step1Fields = userType === 'Client' ? clientFields : lawyerFields;
  const validationSchema = userType === 'Client' ? clientValidationSchema : lawyerValidationSchema;

  // Default form values (defined locally so schemas stay focused)
  const initialValues = { name: '', email: '', phone: '', password: '', confirmPassword: '' };

  // Formik configuration
  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: (values) => {
      const submitData = { role: userType.toLowerCase(), ...values };
      console.log('Account created:', submitData);
    },
  });

  // Event handlers
  const handleUserTypeChange = (type) => {
    setUserType(type);
    setCurrentStep(1);
    formik.resetForm();
  };

  const handleContinue = () => {
    const step1 = ['name', 'email', 'phone'];
    step1.forEach(f => formik.setFieldTouched(f, true));
    formik.validateForm().then(errs => { if (!step1.some(f => errs[f])) setCurrentStep(2); });
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleCreateAccount = () => {
    const step2 = ['password', 'confirmPassword'];
    step2.forEach(f => formik.setFieldTouched(f, true));
    formik.validateForm().then(errs => { if (!step2.some(f => errs[f])) formik.handleSubmit(); });
  };

  // Small reusable input component
  const Input = ({ id, label, type, placeholder }) => {
    const hasError = formik.touched[id] && formik.errors[id];
    return (
      <div className="mb-4" key={id}>
        <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
        <input
          id={id}
          name={id}
          type={type}
          placeholder={placeholder}
          value={formik.values[id]}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-1 transition-colors ${hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-900 focus:ring-blue-900'}`}
        />
        {hasError && <p className="text-red-500 text-sm mt-1">{formik.errors[id]}</p>}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-6">
           
            <div className="bg-blue-900 text-yellow-400 p-2 rounded-lg text-m font-bold">
               <GoLaw className=''/>
            </div>
            <span className="text-2xl font-bold">
              <span className="text-blue-900">Mero</span><span className="text-yellow-500">Naya</span>
            </span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left Side - Decorative Section */}
            <div className="hidden lg:flex items-center justify-center p-0">
              <img 
                src="https://lnplawoffice.id/wp-content/uploads/2025/10/still-life-world-intellectual-property-day-1024x1536.jpg"
                alt="Justice & Legal Services"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Right Side - Form Section */}
            <div className="p-8 lg:p-12">
              {/* Header */}
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
              <p className="text-gray-600 mb-6">
                Join as a <span className="text-yellow-500 font-semibold">{userType}</span>
              </p>

              {/* User Type Selection */}
              <div className="flex gap-4 mb-8">
                {[
                  { type: 'Client', label: 'Client' },
                  { type: 'Lawyer', label: 'Lawyer' }
                ].map((option) => (
                  <button
                    key={option.type}
                    onClick={() => handleUserTypeChange(option.type)}
                    className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                      userType === option.type
                        ? 'bg-white text-gray-900 border-2 border-blue-900'
                        : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:border-blue-900'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {/* Progress Indicator */}
              <div className="flex items-center gap-4 mb-8">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                    currentStep >= 1
                      ? 'bg-blue-900 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  1
                </div>
                <div
                  className={`flex-1 h-1 transition-colors ${
                    currentStep >= 2 ? 'bg-blue-900' : 'bg-gray-200'
                  }`}
                />
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                    currentStep >= 2
                      ? 'bg-blue-900 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  2
                </div>
              </div>

              {/* Form Content - Step 1 */}
              {currentStep === 1 && (
                <div className="mb-8">
                  {step1Fields.map(field => (
                    <Input key={field.id} id={field.id} label={field.label} type={field.type} placeholder={field.placeholder} />
                  ))}
                </div>
              )}

              {/* Form Content - Step 2 */}
              {currentStep === 2 && (
                <div className="mb-8">
                  {passwordFields.map(field => (
                    <Input key={field.id} id={field.id} label={field.label} type={field.type} placeholder={field.placeholder} />
                  ))}

                  {/* Terms & Conditions */}
                  <div className="flex items-start gap-3 pt-2">
                    <input
                      type="checkbox"
                      id="terms"
                      className="mt-1 w-4 h-4 rounded border-gray-300"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-700">
                      I agree to the{' '}
                      <span className="text-yellow-500 hover:underline cursor-pointer">
                        Terms of Service
                      </span>{' '}
                      and{' '}
                      <span className="text-yellow-500 hover:underline cursor-pointer">
                        Privacy Policy
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                {currentStep === 2 && (
                  <button
                    onClick={handleBack}
                    className="flex-1 py-3 px-6 border-2 border-gray-300 text-gray-900 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                  >
                    ← Back
                  </button>
                )}
                <button
                  onClick={currentStep === 1 ? handleContinue : handleCreateAccount}
                  className="flex-1 py-3 px-6 rounded-lg font-semibold text-white bg-blue-900 hover:bg-blue-800 transition-all"
                >
                  {currentStep === 1 ? 'Continue →' : 'Create Account →'}
                </button>
              </div>

              {/* Login Link */}
              <p className="text-center text-gray-600 text-sm mt-6">
                Already have an account?{' '}
                <span onClick={() => navigate('/login')} className="text-yellow-500 hover:underline cursor-pointer font-semibold">
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