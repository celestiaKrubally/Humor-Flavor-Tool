import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <header style={{
        background: "var(--bg2)", borderBottom: "1px solid var(--border)",
        padding: "0.75rem 2rem", display: "flex", alignItems: "center",
        justifyContent: "space-between", position: "sticky", top: 0, zIndex: 40,
      }}>
        <Link href="/admin" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <span style={{ fontSize: "1.2rem" }}>🧪</span>
          <span style={{ fontWeight: 800, color: "var(--text)", fontSize: "1rem" }}>Humor Flavor Tool</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--text3)", fontFamily: "DM Mono, monospace" }}>{user.email}</span>
          <ThemeToggle />
          <SignOutButton />
        </div>
      </header>
      <main style={{ padding: "2rem", maxWidth: 1100, margin: "0 auto" }}>{children}</main>
    </div>
  );
}
