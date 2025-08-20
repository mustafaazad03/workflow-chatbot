'use client';
import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Something went wrong!</h1>
        <p className="text-xl text-gray-600 mb-4">An error occurred while loading this page</p>
        <div className="space-x-4">
          <button
            onClick={reset}
            className="text-blue-500 hover:text-blue-700 underline"
          >
            Try again
          </button>
          <Link href="/" className="text-blue-500 hover:text-blue-700 underline">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
