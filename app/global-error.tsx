"use client";

// Catches errors thrown in the root layout itself. When this renders, the root
// layout (and its global CSS) is bypassed — so everything here is styled inline
// with the app's palette to stay on-brand without Tailwind.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FFFBEF",
          color: "#3C3C3C",
          fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
          padding: "24px",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: "28rem" }}>
          <div style={{ fontSize: "44px" }}>⚠️</div>
          <h1 style={{ margin: "12px 0 0", fontSize: "26px", fontWeight: 800 }}>
            Algo quebrou de vez
          </h1>
          <p style={{ margin: "8px 0 0", color: "#777777", lineHeight: 1.4 }}>
            Tivemos um erro grave ao carregar o app. Tenta recarregar.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: "24px",
              background: "#58CC02",
              color: "#fff",
              border: "none",
              borderBottom: "4px solid #58A700",
              borderRadius: "16px",
              padding: "14px 24px",
              fontWeight: 800,
              fontSize: "16px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              cursor: "pointer",
            }}
          >
            Recarregar
          </button>
          {error.digest && (
            <p style={{ marginTop: "20px", fontSize: "12px", color: "#AFAFAF", fontFamily: "monospace" }}>
              ref: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
