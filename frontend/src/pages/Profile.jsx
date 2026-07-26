import { useMemo } from "react";
import {
  BadgeCheck,
  CalendarDays,
  Crown,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";

function getSavedUser() {
  try {
    const savedUser = localStorage.getItem("gigora_user");
    return savedUser ? JSON.parse(savedUser) : {};
  } catch {
    return {};
  }
}

function getInitials(name = "") {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "U"
  );
}

function ProfileInfoCard({
  icon: Icon,
  label,
  value,
  badge,
}) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 transition duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md">
      <div className="flex items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-100">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <div className="mt-1 flex flex-wrap items-center gap-2">
            <p className="truncate text-base font-semibold text-slate-900">
              {value}
            </p>

            {badge && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                <BadgeCheck
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                />
                {badge}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Profile() {
  const user = useMemo(() => getSavedUser(), []);

  const name = user.name || "Gigora User";
  const email = user.email || "No email available";
  const plan = user.plan || "free";
  const initials = getInitials(name);
  const isPro = plan.toLowerCase() === "pro";

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div
          className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-100 blur-3xl"
          aria-hidden="true"
        />

        <div
          className="absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-indigo-100 blur-3xl"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
              <div className="relative">
                <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 text-3xl font-bold text-white shadow-xl shadow-blue-200">
                  {initials}
                </div>

                <span
                  className={`absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white ${
                    isPro
                      ? "bg-amber-400 text-amber-950"
                      : "bg-slate-200 text-slate-700"
                  }`}
                  aria-label={`${plan} plan`}
                >
                  {isPro ? (
                    <Crown
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                  ) : (
                    <User
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                  )}
                </span>
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                    {name}
                  </h1>

                  {isPro && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-800">
                      <Crown
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                      Pro Member
                    </span>
                  )}
                </div>

                <p className="mt-2 text-base text-slate-600">
                  Manage your Gigora account, subscription, and profile
                  details.
                </p>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500 sm:justify-start">
                  <span className="inline-flex items-center gap-2">
                    <Mail
                      className="h-4 w-4 text-blue-600"
                      aria-hidden="true"
                    />
                    {email}
                  </span>

                  <span className="inline-flex items-center gap-2">
                    <ShieldCheck
                      className="h-4 w-4 text-emerald-600"
                      aria-hidden="true"
                    />
                    Secure account
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              {!isPro && (
                <Link
                  to="/pricing"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <Crown className="h-5 w-5" aria-hidden="true" />
                  Upgrade to Pro
                </Link>
              )}

              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
          <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                  Account details
                </p>

                <h2 className="mt-2 text-2xl font-bold text-slate-900">
                  Personal information
                </h2>
              </div>

              <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 sm:flex">
                <User className="h-6 w-6" aria-hidden="true" />
              </div>
            </div>

            <div className="mt-8 grid gap-4">
              <ProfileInfoCard
                icon={User}
                label="Full name"
                value={name}
              />

              <ProfileInfoCard
                icon={Mail}
                label="Email address"
                value={email}
                badge="Verified"
              />

              <ProfileInfoCard
                icon={Crown}
                label="Current plan"
                value={plan.charAt(0).toUpperCase() + plan.slice(1)}
              />
            </div>
          </article>

          <aside className="space-y-6">
            <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-blue-950 p-6 text-white shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                  <Sparkles
                    className="h-6 w-6 text-blue-200"
                    aria-hidden="true"
                  />
                </div>

                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-100">
                  {isPro ? "Active" : "Free plan"}
                </span>
              </div>

              <h2 className="mt-6 text-2xl font-bold">
                {isPro
                  ? "Your Pro plan is active"
                  : "Unlock the full Gigora experience"}
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-300">
                {isPro
                  ? "You have access to premium AI tools, unlimited requests, and proposal comparison."
                  : "Upgrade to Pro for unlimited AI requests, faster responses, and premium features."}
              </p>

              {!isPro && (
                <Link
                  to="/pricing"
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 font-semibold text-slate-900 transition hover:bg-blue-50"
                >
                  View Pricing
                </Link>
              )}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <ShieldCheck
                    className="h-5 w-5"
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <h2 className="font-bold text-slate-900">
                    Account security
                  </h2>

                  <p className="text-sm text-slate-500">
                    Your account is protected.
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <CalendarDays
                    className="h-5 w-5 text-slate-500"
                    aria-hidden="true"
                  />

                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      Account status
                    </p>

                    <p className="text-sm text-slate-500">
                      Active and ready to use
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default Profile;