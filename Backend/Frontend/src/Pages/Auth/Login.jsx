import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { GoLaw } from "react-icons/go";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import loginImage from "../../assets/login image.jpg";
import { loginValidationSchema } from "../utils/LoginValidation";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { loginUser, clearError } from "../slices/auth";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);

  const { loading, error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      remember: false,
    },
   validationSchema: loginValidationSchema,
    onSubmit: async (values) => {
      const payload = {
        email: values.email,
        password: values.password,
      };

      const result = await dispatch(loginUser(payload));

      if (loginUser.fulfilled.match(result)) {
        toast.success("Login successful!");
        // User data is in result.payload.Result.user
        const user = result.payload.Result?.user;
        const userRole = user?.role;

        // // For debugging purposes
        // console.log("User role:", userRole);
        
        if (userRole === "Client") {
          navigate("/clientdashboard");
        } else if (userRole === "Lawyer") {
          navigate("/lawyerdashboard");
        } else {
          navigate("/");
        }
      }
    },
  });

  return (
    <>
      <Header />

      {/* MAIN WRAPPER */}
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        {/* CARD */}
        <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl/30 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">

            {/* IMAGE */}
            <div className="hidden lg:block">
              <img
                src={loginImage}
                alt="Login"
                className="w-full h-full object-cover"
              />
            </div>

            {/* FORM SIDE */}
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

              {/* TITLE */}
              <h2 className="text-xl font-semibold text-center mb-2">
                Welcome Back
              </h2>
              <p className="text-sm text-gray-600 text-center mb-6">
                Enter your credentials to access your account
              </p>

            

              {/* FORM */}
              <form onSubmit={formik.handleSubmit}>
                {/* EMAIL */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-1">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
                </div>

                {/* PASSWORD */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
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
                </div>

                {/* REMEMBER ME & FORGOT PASSWORD */}
                <div className="flex items-center justify-between mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="remember"
                      checked={formik.values.remember}
                      onChange={formik.handleChange}
                      className="mr-2 w-4 h-4 text-blue-900 border-gray-300 rounded focus:ring-blue-900"
                    />
                    <span className="text-sm text-gray-600">Remember me</span>
                  </label>
                  <span
                    onClick={() => navigate("/forgot-password")}
                    className="text-sm text-yellow-500 font-semibold cursor-pointer hover:underline"
                  >
                    Forgot password?
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-blue-900 text-white rounded-lg font-semibold"
                >
                  {loading ? "Logging in..." : "Login →"}
                </button>
              </form>

              {/* REGISTER LINK */}
              <p className="text-center text-gray-600 text-sm mt-6">
                Don’t have an account?{" "}
                <span
                  onClick={() => navigate("/register")}
                  className="text-yellow-500 font-semibold cursor-pointer"
                >
                  Create account
                </span>
              </p>

            </div>
          </div>
        </div>
      </div>
      <Footer />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
};

export default Login;
