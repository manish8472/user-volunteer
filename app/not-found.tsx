import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center mb-4">
          <span className="text-9xl font-bold text-primary">
            404
          </span>
        </div>

        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Page Not Found
        </h1>

        <p className="text-slate-600 dark:text-slate-400">
          Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link
            href="/"
            className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-light text-white font-semibold transition-all inline-flex items-center justify-center"
          >
            Back to Home
          </Link>
          <Link
            href="/jobs"
            className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all inline-flex items-center justify-center"
          >
            Browse Opportunities
          </Link>
        </div>
      </div>
    </div>
  );
}
