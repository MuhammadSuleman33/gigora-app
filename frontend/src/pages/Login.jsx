import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  ShieldCheck,
  Search,
  FileText,
  Mail,
  Lock,
  ArrowRight,
} from "lucide-react";

import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

function Login() {
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/api/auth/login", {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      const {
        access_token,
        refresh_token,
        user,
      } = response.data;

      if (!access_token || !refresh_token || !user) {
        throw new Error(
          "The login response did not include the required authentication information."
        );
      }

      localStorage.setItem(
        "gigora_access_token",
        access_token
      );

      localStorage.setItem(
        "gigora_refresh_token",
        refresh_token
      );

      localStorage.setItem(
        "gigora_user",
        JSON.stringify(user)
      );

      setUser(user);

      navigate("/dashboard", {
        replace: true,
      });
    } catch (err) {
      console.error(
        "Login error:",
        err.response?.status,
        err.response?.data || err.message
      );

      setError(
        err.response?.data?.detail ||
          err.message ||
          "Unable to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left side */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-[#1A56DB] to-[#1E3A5F] text-white lg:flex">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-blue-300/10 blur-3xl" />

        <div className="relative flex flex-col justify-center px-16">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-5 py-2 backdrop-blur">
            <Sparkles size={18} />

            <span className="font-semibold">
              AI Powered Platform
            </span>
          </div>

          <h1 className="mt-8 text-6xl font-extrabold leading-tight">
            Welcome
            <br />
            Back
          </h1>

          <p className="mt-8 max-w-lg text-lg leading-8 text-blue-100">
            Continue building your freelance career with
            AI-powered Profile Analysis, Gig SEO optimization,
            and Proposal Generation.
          </p>

          <div className="mt-14 space-y-6">
            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-white/10 p-3">
                <ShieldCheck size={22} />
              </div>

              <div>
                <h3 className="font-semibold">
                  Profile Analyzer
                </h3>

                <p className="text-blue-100">
                  Improve your freelancer profile.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-white/10 p-3">
                <Search size={22} />
              </div>

              <div>
                <h3 className="font-semibold">
                  Gig SEO
                </h3>

                <p className="text-blue-100">
                  Rank higher on Fiverr and Upwork.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="rounded-xl bg-white/10 p-3">
                <FileText size={22} />
              </div>

              <div>
                <h3 className="font-semibold">
                  Proposal Generator
                </h3>

                <p className="text-blue-100">
                  Write winning proposals instantly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center justify-center bg-slate-50 px-6 py-12">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md rounded-3xl bg-white p-10 shadow-xl"
        >
          <div className="text-center">
            <h2 className="text-4xl font-bold text-[#111827]">
              Welcome Back
            </h2>

            <p className="mt-3 text-[#6B7280]">
              Log in to continue using Gigora.
            </p>
          </div>

          {error && (
            <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-600">
              {error}
            </div>
          )}

          {/* Email */}
          <div className="mt-8">
            <label
              htmlFor="email"
              className="mb-2 block font-semibold text-[#111827]"
            >
              Email Address
            </label>

            <div className="flex items-center rounded-xl border border-gray-300 px-4 focus-within:border-[#1A56DB] focus-within:ring-4 focus-within:ring-blue-100">
              <Mail
                size={18}
                className="text-gray-400"
              />

              <input
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required
                className="w-full bg-transparent px-3 py-4 outline-none"
              />
            </div>
          </div>

          {/* Password */}
          <div className="mt-6">
            <label
              htmlFor="password"
              className="mb-2 block font-semibold text-[#111827]"
            >
              Password
            </label>

            <div className="flex items-center rounded-xl border border-gray-300 px-4 focus-within:border-[#1A56DB] focus-within:ring-4 focus-within:ring-blue-100">
              <Lock
                size={18}
                className="text-gray-400"
              />

              <input
                id="password"
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
                className="w-full bg-transparent px-3 py-4 outline-none"
              />
            </div>
          </div>

          {/* Login button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1A56DB] py-4 font-semibold text-white transition hover:bg-[#1E3A5F] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Logging in..." : "Login"}

            {!loading && <ArrowRight size={18} />}
          </button>

          <button
            type="button"
            disabled
            className="mt-4 w-full rounded-xl border border-gray-300 py-4 font-semibold text-gray-500"
          >
            Continue with Google
          </button>

          <p className="mt-8 text-center text-[#6B7280]">
            Don&apos;t have an account?

            <Link
              to="/signup"
              className="ml-2 font-semibold text-[#1A56DB] hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;