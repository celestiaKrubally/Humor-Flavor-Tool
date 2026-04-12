"use client";
import { createDbClient } from "@/utils/supabase/client";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const handleLogin = async () => {
    const supabase = createDbClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)", padding: "1rem" }}>
      <div style={{ width: "100%", maxWidth: "380px" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🧪</div>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 800 }}>Humor Flavor Tool</h1>
          <p style={{ color: "var(--text3)", fontSize: "0.85rem", marginTop: "0.3rem", fontFamily: "DM Mono, monospace" }}>superadmin · matrix_admin only</p>
        </div>
        <div className="card">
          {error === "unauthorized" && (
            <div style={{ background: "#c1121f18", border: "1px solid #c1121f44", borderRadius: 7, padding: "0.75rem 1rem", color: "var(--red)", fontSize: "0.85rem", marginBottom: "1.25rem" }}>
              Your account is not authorized to access this tool.
            </div>
          )}
          <button onClick={handleLogin} className="btn btn-primary" style={{ width: "100%", justifyContent: "center", padding: "0.75rem" }}>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--bg)" }} />}><LoginContent /></Suspense>;
}
