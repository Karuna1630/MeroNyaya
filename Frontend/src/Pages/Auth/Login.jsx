import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { GoLaw } from "react-icons/go";
import loginImage from "../../assets/login image.jpg";
import { loginValidationSchema } from "../utils/LoginValidation";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { loginUser, clearError } from "../slices/auth";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { loading, error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

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

              {/* ERROR */}
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                  <p className="text-red-600 text-sm text-center">{error}</p>
                </div>
              )}

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
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-1">
                    Password
                  </label>
                  <input
                    name="password"
                    type="password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                  />
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
    </>
  );
};

export default Login;
