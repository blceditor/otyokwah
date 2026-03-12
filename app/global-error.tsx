"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: "#F5F0E8", fontFamily: "sans-serif" }}>
        <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ textAlign: "center", maxWidth: "28rem" }}>
            <h1 style={{ fontSize: "2rem", color: "#2F4F3D", marginBottom: "1rem" }}>Something Went Wrong</h1>
            <p style={{ color: "#8A8A7A", marginBottom: "2rem" }}>
              We encountered an unexpected error. Please try again.
            </p>
            <button
              onClick={reset}
              style={{
                backgroundColor: "#2F4F3D",
                color: "#F5F0E8",
                fontWeight: 600,
                padding: "0.75rem 1.5rem",
                borderRadius: "0.5rem",
                border: "none",
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
