import React, { useEffect, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Building2, Loader2 } from "lucide-react";
import { useLoginMutation, useCheckLoginQuery } from "../../Reduxe/Api";
import toast from "react-hot-toast";
import { APP_NAME, APP_TAGLINE } from "../../config/brand";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const [login, result] = useLoginMutation();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill all fields!");
      return;
    }

    login({ email, password });
  };

  useEffect(() => {
    if (result?.isSuccess && result?.data?.token) {
      toast.success("Login Successful!");
      localStorage.setItem("token", result?.data?.token);
      navigate("/dashboard");
    }

    if (result?.isError) {
      toast.error(result?.error?.data?.message || "Incorrect Credentials");
    }
  }, [result, navigate]);

  const token = localStorage.getItem("token");
  const { data, isLoading, isError } = useCheckLoginQuery();

  if (token && isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-slate-300 gap-3">
        <Loader2 className="animate-spin" size={28} />
        <p className="text-sm font-medium">Checking authentication...</p>
      </div>
    );
  }

  if (token && isError) {
    localStorage.removeItem("token");
  }

  if (data) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 px-4">
      {/* Decorative glow blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/40 border border-white/10 p-8 sm:p-10">
        <div className="flex flex-col items-center mb-6">
          {/* <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-indigo-900/40 mb-4"> */}
            {/* <Building2 size={28} /> */}
            <img src="/logoss.png" alt="Logo" className="w-24 h-24 object-contain mb-4" />
          {/* </div> */}
          <h2 className="text-2xl font-bold text-gray-900">{APP_NAME}</h2>

          <p className="text-sm text-gray-500 mt-1">{APP_TAGLINE} — Welcome back</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Email</label>
            <div className="relative">
              <Mail size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-800"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block mb-1.5 text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <Lock size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-11 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-800"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={result?.isLoading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 disabled:opacity-70 text-white py-3 rounded-xl font-semibold shadow-lg shadow-indigo-900/20 transition-all"
          >
            {result?.isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Signing in...
              </>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-8">
          © {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
