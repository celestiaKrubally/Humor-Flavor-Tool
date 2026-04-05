import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import FlavorsClient from "./flavors/FlavorsClient";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: flavors } = await supabase
    .from("humor_flavors")
    .select("*, humor_flavor_steps(count)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Humor Flavors</h1>
          <p className="page-subtitle">{flavors?.length ?? 0} flavors · click to manage steps</p>
        </div>
        <FlavorsClient mode="create-btn" />
      </div>

      <div style={{ display: "grid", gap: "1rem" }}>
        {(flavors ?? []).map(f => (
          <Link key={f.id} href={`/admin/flavor/${f.id}`} style={{ textDecoration: "none" }}>
            <div className="card" style={{ cursor: "pointer", transition: "border-color 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--accent)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--text)", marginBottom: "0.3rem" }}>{f.name}</div>
                  {f.slug && <div style={{ fontSize: "0.75rem", color: "var(--text3)", fontFamily: "DM Mono, monospace", marginBottom: "0.5rem" }}>{f.slug}</div>}
                  {f.description && <div style={{ fontSize: "0.875rem", color: "var(--text2)", maxWidth: 600 }}>{f.description}</div>}
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0, marginLeft: "1rem" }}>
                  <span className="badge badge-green">{f.humor_flavor_steps?.[0]?.count ?? 0} steps</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
        {(!flavors || flavors.length === 0) && (
          <div className="empty-state">
            <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>🧪</div>
            <div>No humor flavors yet. Create your first one!</div>
          </div>
        )}
      </div>
    </div>
  );
}
