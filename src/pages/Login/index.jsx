import { useState } from "react";

const VALID_USERS = [
  { email: "admin", password: "Astrikos2026", name: "Administrator" },
  { email: "product@astrikos.ai", password: "Astrikos2026", name: "Product Team" },
];

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("Username and password are required.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const user = VALID_USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password);
      if (user) {
        onLogin({ email: user.email, name: user.name });
      } else {
        setError("Invalid username or password.");
        setLoading(false);
      }
    }, 600);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--ds-bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
      }}
    >
      {/* ── Card ──────────────────────────────────────────────── */}
      <div
        className="animate-fade-in"
        style={{
          width: "100%",
          maxWidth: 380,
          background: "var(--ds-panel)",
          border: "1px solid var(--ds-panel-border)",
          borderRadius: 16,
          boxShadow: "var(--ds-shadow-lg)",
          padding: "32px 32px 28px",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 28 }}>
          <img
            src="/Astrikos Logo Transparent perfect 1.png"
            alt="Astrikos"
            style={{
              height: 46,
              objectFit: "contain",
              filter: "var(--ds-logo-filter)",
              marginBottom: 14,
            }}
          />
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ds-text)", letterSpacing: "-0.01em" }}>Real Estate Strategy Intelligence</div>
          <div style={{ fontSize: 11, color: "var(--ds-text-faint)", marginTop: 3 }}>Sign in to your workspace</div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Username */}
          <div>
            <label htmlFor="login-email" style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--ds-text-muted)", marginBottom: 5 }}>
              USERNAME
            </label>
            <input
              id="login-email"
              type="text"
              autoComplete="username"
              autoFocus
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder=""
              style={{
                width: "100%",
                height: 36,
                background: "var(--ds-bg)",
                border: `1px solid ${error ? "var(--ds-danger-border)" : "var(--ds-border)"}`,
                borderRadius: 8,
                padding: "0 12px",
                fontSize: 13,
                color: "var(--ds-text)",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.14s",
              }}
              onFocus={(e) => {
                if (!error) e.target.style.borderColor = "var(--ds-accent-border)";
              }}
              onBlur={(e) => {
                if (!error) e.target.style.borderColor = "var(--ds-border)";
              }}
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="login-password"
              style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--ds-text-muted)", marginBottom: 5 }}
            >
              PASSWORD
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="login-password"
                type={showPw ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  height: 36,
                  background: "var(--ds-bg)",
                  border: `1px solid ${error ? "var(--ds-danger-border)" : "var(--ds-border)"}`,
                  borderRadius: 8,
                  padding: "0 38px 0 12px",
                  fontSize: 13,
                  color: "var(--ds-text)",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.14s",
                }}
                onFocus={(e) => {
                  if (!error) e.target.style.borderColor = "var(--ds-accent-border)";
                }}
                onBlur={(e) => {
                  if (!error) e.target.style.borderColor = "var(--ds-border)";
                }}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                aria-label={showPw ? "Hide password" : "Show password"}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  color: "var(--ds-text-faint)",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {showPw ? (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              style={{
                fontSize: 11,
                color: "var(--ds-danger)",
                background: "var(--ds-danger-bg)",
                border: "1px solid var(--ds-danger-border)",
                borderRadius: 6,
                padding: "7px 10px",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              width: "100%",
              height: 38,
              fontSize: 13,
              fontWeight: 600,
              marginTop: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? (
              <>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  style={{ animation: "spin 0.8s linear infinite" }}
                >
                  <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0" opacity="0.25" />
                  <path d="M21 12a9 9 0 00-9-9" />
                </svg>
                Signing in…
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Footer hint */}
        <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid var(--ds-border-soft)", textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "var(--ds-text-faint)" }}>Authorised access only · Astrikos AI Platform</div>
        </div>
      </div>

      <div style={{ marginTop: 20, fontSize: 10, color: "var(--ds-text-faint)", textAlign: "center" }}>
        © {new Date().getFullYear()} Astrikos AI · Real Estate Strategy Intelligence
      </div>
    </div>
  );
}
