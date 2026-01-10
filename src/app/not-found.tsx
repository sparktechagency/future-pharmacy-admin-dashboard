import Link from "next/link";
import "./globals.css";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-600 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-500 mb-8">
          Sorry, we couldn&apos;t find the page you&apos;re looking for.
        </p>
        <Link
          href="/"
          className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-black/80 transition-colors"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
}
