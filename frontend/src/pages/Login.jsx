import React from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff } from 'lucide-react';
import API from "../api/axios";
import { toast } from "react-toastify";

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post('/auth/login', formData);

      if (response.data && response.data.token) {



        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
          navigate("/");
        

      }

      toast.success(response.data.message);

    } catch (error) {
      // console.log("error is appearing but not showing in toast", error.response?.data?.message);
      // toast.error(response.data.message || "Login failed. Please try again.");

      // console.log("Error:", error.response?.data?.message);

      console.error(error);
      console.error(error.stack);
      toast.error(
        error.response?.data?.message || "Login failed. Please try again."
      );
    }


  }
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">

      {/* <Navbar /> */}
      <div className="flex items-center justify-center pt-10 pb-4">
        <span className="text-xl font-bold text-indigo-600 tracking-tight">CareerGuide</span>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-8">

        <div className="w-full max-w-sm bg-white border border-slate-200 p-8 rounded-xl shadow-sm">

          <h2 className="text-xl font-semibold text-center text-slate-900 mb-1">
            Welcome back
          </h2>
          <p className="text-slate-500 text-sm text-center mb-6">Sign in to your account</p>

          {/* Email */}
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email
              </label>
              <input
                name="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                type="email"
                placeholder="you@example.com"
                className="w-full px-3 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 text-sm"
              />
            </div>

            {/* Password */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="flex relative">
                <input
                  name="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="w-full px-3 py-2.5 rounded-lg bg-white border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200 text-sm"
                />
                <button className="absolute right-3 top-2.5 cursor-pointer text-slate-400 hover:text-slate-600 transition-colors duration-200" type="button" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>

            </div>

            {/* Login Button */}
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-medium transition-colors duration-200 text-sm shadow-sm">
              Sign In
            </button>

          </form>

          {/* Footer */}
          <p className="text-sm text-slate-500 text-center mt-5">
            Don't have an account?{" "}
            <span onClick={() => navigate('/register')} className="text-indigo-600 cursor-pointer hover:text-indigo-700 font-medium transition-colors duration-200">
              Sign Up
            </span>
          </p>

        </div>

      </div>
    </div>
  );
}