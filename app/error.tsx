"use client";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-heading text-secondary mb-4">Something Went Wrong</h1>
        <p className="text-stone mb-8">
          We encountered an unexpected error. Please try again.
        </p>
        <button
          onClick={reset}
          className="inline-block bg-secondary hover:bg-secondary-light text-cream font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    </main>
  );
}
