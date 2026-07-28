import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, ArrowRight } from "lucide-react";
import api from "../services/api";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };
const handleSubmit = async (event) => {
  event.preventDefault();

  setError("");
  setSuccess("");
  setLoading(true);

  try {
    const response = await api.post(
      "/api/auth/signup",
      {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      }
    );

    const {
      message,
      access_token,
      user,
    } = response.data;

    if (!access_token || !user) {
      setSuccess(
        "Account created. Please verify your email, then log in."
      );

      setTimeout(() => {
        navigate("/login");
      }, 1800);

      return;
    }

    localStorage.setItem(
      "gigora_access_token",
      access_token
    );

    localStorage.setItem(
      "gigora_user",
      JSON.stringify(user)
    );

    localStorage.setItem(
      "showOnboarding",
      "true"
    );

    setSuccess(
      message || "Account created successfully."
    );

    setTimeout(() => {
      navigate("/onboarding");
    }, 1000);

  } catch (err) {
    console.error(
      "Signup error:",
      err.response?.status,
      err.response?.data || err.message
    );

    setError(
      err.response?.data?.detail ||
        "Unable to create account. Please try again."
    );
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6 py-10">

      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">

        {/* Logo */}

        <div className="mb-8 text-center">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EFF6FF]">

            <span className="text-2xl font-bold text-[#1A56DB]">
              G
            </span>

          </div>

          <h1 className="mt-6 text-3xl font-bold text-[#1E3A5F]">
            Create Account
          </h1>

          <p className="mt-2 text-[#6B7280]">
            Join Gigora and start winning more freelance projects.
          </p>

        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-[#059669]">
            {success}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          {/* Name */}

          <div className="relative">

            <User
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 outline-none transition focus:border-[#1A56DB] focus:ring-4 focus:ring-blue-100"
            />

          </div>

          {/* Email */}

          <div className="relative">

            <Mail
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 outline-none transition focus:border-[#1A56DB] focus:ring-4 focus:ring-blue-100"
            />

          </div>

          {/* Password */}

          <div className="relative">

            <Lock
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 outline-none transition focus:border-[#1A56DB] focus:ring-4 focus:ring-blue-100"
            />

          </div>

          {/* Sign Up */}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1A56DB] py-3 font-semibold text-white transition hover:bg-[#1E3A5F] disabled:cursor-not-allowed disabled:opacity-60"
          >

            {loading ? (
              "Creating Account..."
            ) : (
              <>
                Sign Up
                <ArrowRight size={18} />
              </>
            )}

          </button>

          {/* Google */}

          <button
            type="button"
            disabled
            className="w-full rounded-xl border border-gray-300 bg-white py-3 font-medium text-gray-500"
          >
            Continue with Google
          </button>

        </form>

        <div className="mt-8 text-center text-sm text-[#6B7280]">

          Already have an account?{" "}

          <Link
            to="/login"
            className="font-semibold text-[#1A56DB] hover:text-[#1E3A5F]"
          >
            Login
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Signup;