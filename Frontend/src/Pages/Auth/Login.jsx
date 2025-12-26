import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import { loginValidationSchema } from '../utils/LoginValidation';
import { GoLaw } from 'react-icons/go';

const Login = () => {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      remember: false,
    },
    validationSchema: loginValidationSchema,
    onSubmit: (values) => {
      console.log('Login submitted:', values);
    },
  });

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: '#FFFAFA' }}
    >
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

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left Form */}
            <div className="p-8 lg:p-12">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Welcome Back
              </h1>
              <p className="text-gray-600 mb-8">
                Enter your credentials to access your account
              </p>

              <form onSubmit={formik.handleSubmit}>
                {/* Email */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    placeholder="example@gmail.com"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-1 transition-colors ${
                      formik.touched.email && formik.errors.email
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-900'
                    }`}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Password
                    </label>
                    <Link
                      to="#"
                      className="text-sm text-yellow-500 hover:underline"
                    >
                      forgot password ?
                    </Link>
                  </div>
                  <input
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-1 transition-colors ${
                      formik.touched.password && formik.errors.password
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-900'
                    }`}
                  />
                  {formik.touched.password && formik.errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {formik.errors.password}
                    </p>
                  )}
                </div>

                {/* Remember me */}
                <div className="flex items-center gap-2 mb-6">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={formik.values.remember}
                    onChange={formik.handleChange}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Remember me</span>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full py-3 px-6 rounded-lg font-semibold text-white bg-blue-900 hover:bg-blue-800 transition-all"
                >
                  Login →
                </button>
              </form>

              {/* Register link */}
              <p className="text-center text-gray-600 text-sm mt-6">
                Don't have an account?{' '}
                <span
                  onClick={() => navigate('/register')}
                  className="text-yellow-500 hover:underline cursor-pointer font-semibold"
                >
                  Create account
                </span>
              </p>

              <p className="text-xs text-center text-gray-500 mt-6">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>

            {/* Right Image */}
            <div className="hidden lg:flex">
              <img
                src="https://images.unsplash.com/photo-1589994965851-a8f479c573a9"
                alt="Justice Scale"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
