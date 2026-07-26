import { Link } from "react-router-dom";
import { Home, SearchX } from "lucide-react";

function NotFound() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-xl w-full text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-100">
          <SearchX
            className="h-10 w-10 text-blue-600"
            aria-hidden="true"
          />
        </div>

        <p className="text-sm font-semibold uppercase tracking-widest text-blue-600">
          Error 404
        </p>

        <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight text-slate-900">
          Oops! Page not found
        </h1>

        <p className="mt-4 text-base sm:text-lg leading-7 text-slate-600">
          The page you are looking for does not exist, may have been moved,
          or the address may be incorrect.
        </p>

        <Link
          to="/"
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Home className="h-5 w-5" aria-hidden="true" />
          Go Home
        </Link>
      </div>
    </main>
  );
}

export default NotFound;