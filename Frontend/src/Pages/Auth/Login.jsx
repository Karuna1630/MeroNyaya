import { useState } from "react"
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg grid grid-cols-1 md:grid-cols-2 overflow-hidden">

        {/* Left Section */}
        <div className="p-10">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-10">
            <div className="bg-primary text-white p-2 rounded-md">⚖️</div>
            <h1 className="text-xl font-bold">
              Mero<span className="text-accent">Naya</span>
            </h1>
          </div>

          <h2 className="text-2xl font-semibold mb-1">Welcome Back</h2>
          <p className="text-gray-500 mb-6">
            Enter your credentials to access your account
          </p>

          {/* Email */}
          <div className="mb-4">
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              placeholder="example@gmail.com"
              className="w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Password */}
          <div className="mb-2">
            <label className="text-sm font-medium">Password</label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-500"
                type="button"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className="text-right mb-6">
            <a href="#" className="text-sm text-accent hover:underline">
              Forgot password?
            </a>
          </div>

          {/* Login Button */}
          <button className="w-full bg-primary text-white py-2 rounded-md hover:bg-opacity-90 transition">
            Login →
          </button>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-grow h-px bg-gray-300"></div>
            <span className="px-3 text-sm text-gray-500">
              Or continue with
            </span>
            <div className="flex-grow h-px bg-gray-300"></div>
          </div>

          {/* Social Login */}
          <div className="flex gap-4">
            <button className="flex-1 border py-2 rounded-md hover:bg-gray-50">
              Google
            </button>
            <button className="flex-1 border py-2 rounded-md hover:bg-gray-50">
              Facebook
            </button>
          </div>

          {/* Signup */}
          <p className="text-sm text-center mt-6">
            Don’t have an account?{' '}
            <span onClick={() => navigate('/register')} className="text-accent font-medium cursor-pointer">
              Create account
            </span>
          </p>

          {/* Footer */}
          <p className="text-xs text-center text-gray-400 mt-6">
            By continuing, you agree to our{" "}
            <span className="underline">Terms of Service</span> and{" "}
            <span className="underline">Privacy Policy</span>
          </p>
        </div>

        {/* Right Section */}
        <div className="hidden md:block">
          <img
            src="/login-law.jpg"
            alt="Law"
            className="h-full w-full object-cover"
          />
        </div>

      </div>
    </div>
  )
}
