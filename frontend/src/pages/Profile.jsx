import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";


function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("gigora_access_token");

    if (!token) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        const result = data.user || data.data;

        if (!response.ok) {
          throw new Error(data.detail || "Unable to load profile.");
        }

        setProfile(result);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

 return (
  <div className="min-h-screen bg-slate-50 p-6 lg:p-10">
    <div className="mx-auto max-w-6xl">

      {/* Header */}

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[#1E3A5F]">
          User Profile
        </h1>

        <p className="mt-2 text-[#6B7280]">
          Manage your account information and subscription details.
        </p>
      </div>

      {/* Card */}

      <div className="rounded-3xl bg-white p-8 shadow-lg">

        {loading ? (

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="h-28 animate-pulse rounded-2xl bg-slate-200"
              />
            ))}

          </div>

        ) : profile ? (

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {/* Name */}

            <div className="rounded-2xl border border-slate-200 p-6 transition hover:shadow-md">
              <p className="text-sm font-medium text-[#6B7280]">
                Full Name
              </p>

              <h2 className="mt-3 text-xl font-bold text-[#1E3A5F]">
                {profile.name}
              </h2>
            </div>

            {/* Email */}

            <div className="rounded-2xl border border-slate-200 p-6 transition hover:shadow-md">
              <p className="text-sm font-medium text-[#6B7280]">
                Email Address
              </p>

              <h2 className="mt-3 break-all text-lg font-semibold text-[#111827]">
                {profile.email}
              </h2>
            </div>

            {/* Plan */}

            <div className="rounded-2xl border border-slate-200 p-6 transition hover:shadow-md">
              <p className="text-sm font-medium text-[#6B7280]">
                Current Plan
              </p>

              <span className="mt-4 inline-flex rounded-full bg-[#EFF6FF] px-4 py-2 text-sm font-semibold text-[#1A56DB]">
                {profile.plan?.toUpperCase()}
              </span>
            </div>

            {/* Join Date */}

            <div className="rounded-2xl border border-slate-200 p-6 transition hover:shadow-md">
              <p className="text-sm font-medium text-[#6B7280]">
                Join Date
              </p>

              <h2 className="mt-3 text-lg font-semibold text-[#111827]">
                {formatDate(profile.created_at || profile.join_date)}
              </h2>
            </div>

            {/* Used */}

            <div className="rounded-2xl border border-slate-200 p-6 transition hover:shadow-md">
              <p className="text-sm font-medium text-[#6B7280]">
                Requests Used
              </p>

              <h2 className="mt-3 text-3xl font-bold text-[#1A56DB]">
                {profile.requests_used ?? 0}
              </h2>
            </div>

            {/* Remaining */}

            <div className="rounded-2xl border border-slate-200 p-6 transition hover:shadow-md">
              <p className="text-sm font-medium text-[#6B7280]">
                Remaining Requests
              </p>

              <h2 className="mt-3 text-3xl font-bold text-[#059669]">
                {profile.remaining_requests ?? 0}
              </h2>
            </div>

          </div>

        ) : (

          <div className="rounded-2xl border border-red-100 bg-red-50 p-10 text-center">

            <h2 className="text-2xl font-bold text-red-600">
              Unable to load profile
            </h2>

            <p className="mt-3 text-gray-600">
              Check your session or login again.
            </p>

          </div>

        )}

      </div>

    </div>
  </div>
);
}

export default Profile;
