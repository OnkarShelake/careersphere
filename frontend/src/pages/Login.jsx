import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import API from "../api/axios";
import { toast } from "react-toastify";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const response = await API.post("/auth/login", formData);

      if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        toast.success(`Welcome back, ${response.data.user.name}!`);

        if (response.data.user.role === "mentor") {
          navigate("/mentor");
        } else {
          navigate("/mentors");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Link to="/" className="inline-flex items-center gap-2 font-bold text-lg text-slate-900">
          <div className="w-6 h-6 rounded bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
            CS
          </div>
          <span>CareerSphere</span>
        </Link>
        <h2 className="mt-4 text-xl font-bold text-slate-900">Sign in to your account</h2>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 border border-slate-200 rounded-xl sm:px-8">
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Email address</label>
              <input
                required
                name="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                type="email"
                placeholder="you@example.com"
                className="w-full px-3 py-2 rounded-md bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 transition"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Password</label>
              <div className="relative">
                <input
                  required
                  name="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  className="w-full px-3 py-2 rounded-md bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-md font-medium transition cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500">
            Don't have an account?{" "}
            <Link to="/register" className="text-slate-900 font-semibold hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}