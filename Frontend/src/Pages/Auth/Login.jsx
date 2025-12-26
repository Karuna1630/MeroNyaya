import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import { GoLaw } from 'react-icons/go';

import { loginValidationSchema } from '../utils/LoginValidation';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginUser, clearError } from '../slices/auth';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { loading, error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      remember: false,
    },
    validationSchema: loginValidationSchema,
    onSubmit: async (values) => {
      const payload = {
        email: values.email,
        password: values.password,
      };

      const result = await dispatch(loginUser(payload));

      // ✅ SAME FORMAT AS REGISTER / VERIFY OTP
      if (loginUser.fulfilled.match(result)) {
        navigate('/');
      }
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
            <div className="bg-blue-900 text-yellow-400 p-4 rounded-xl">
              <GoLaw className="size-8" />
            </div>
            <span className="text-2xl font-bold">
              <span className="text-blue-900">Mero</span>
              <span className="text-yellow-500">Nyaya</span>
            </span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">

            {/* Form */}
            <div className="p-8 lg:p-12">
              <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
              <p className="text-gray-600 mb-6">
                Enter your credentials to access your account
              </p>

              {/* Redux Error */}
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={formik.handleSubmit}>
                {/* Email */}
                <div className="mb-4">
                  <label className="font-semibold block mb-2">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-3 border rounded-lg"
                  />
                </div>

                {/* Password */}
                <div className="mb-6">
                  <label className="font-semibold block mb-2">Password</label>
                  <input
                    name="password"
                    type="password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-3 border rounded-lg"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-900 text-white rounded-lg"
                >
                  {loading ? 'Logging in...' : 'Login →'}
                </button>
              </form>

              <p className="text-center text-sm mt-6">
                Don’t have an account?{' '}
                <span
                  onClick={() => navigate('/register')}
                  className="text-yellow-500 font-semibold cursor-pointer"
                >
                  Create account
                </span>
              </p>
            </div>

            {/* Image */}
            <div className="hidden lg:flex">
              <img
                src="https://images.unsplash.com/photo-1589994965851-a8f479c573a9"
                alt="Justice"
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
