import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import FlavorsClient from "../../flavors/FlavorsClient";
import StepsClient from "./StepsClient";
import TestClient from "./TestClient";

export default async function FlavorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: flavor } = await supabase
    .from("humor_flavors")
    .select("*")
    .eq("id", id)
    .single();

  if (!flavor) notFound();

  const { data: steps } = await supabase
    .from("humor_flavor_steps")
    .select("*")
    .eq("humor_flavor_id", id)
    .order("step_order", { ascending: true });

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ marginBottom: "1.5rem" }}>
        <Link href="/admin" style={{ color: "var(--text3)", textDecoration: "none", fontSize: "0.85rem" }}>← All Flavors</Link>
      </div>

      {/* Flavor header */}
      <div className="card" style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.3rem" }}>{flavor.name}</h1>
            {flavor.slug && <div style={{ fontSize: "0.75rem", color: "var(--text3)", fontFamily: "DM Mono, monospace", marginBottom: "0.5rem" }}>{flavor.slug}</div>}
            {flavor.description && <p style={{ color: "var(--text2)", fontSize: "0.9rem", maxWidth: 600 }}>{flavor.description}</p>}
          </div>
          <FlavorsClient mode="edit-delete" flavor={flavor} />
        </div>
      </div>

      {/* Two column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", alignItems: "start" }}>
        {/* Steps */}
        <div>
          <StepsClient flavorId={id} initialSteps={steps ?? []} />
        </div>

        {/* Test panel */}
        <div>
          <TestClient flavorId={id} flavorName={flavor.name} />
        </div>
      </div>
    </div>
  );
}
