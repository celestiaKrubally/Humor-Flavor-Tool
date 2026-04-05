"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

type Flavor = { id: string; name: string; slug?: string; description?: string };

export default function FlavorsClient({ mode, flavor }: { mode: "create-btn" | "edit-delete"; flavor?: Flavor }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: flavor?.name ?? "", slug: flavor?.slug ?? "", description: flavor?.description ?? "" });
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const handleSave = async () => {
    setLoading(true);
    if (flavor) {
      await supabase.from("humor_flavors").update(form).eq("id", flavor.id);
    } else {
      await supabase.from("humor_flavors").insert(form);
    }
    setLoading(false);
    setShowModal(false);
    router.refresh();
  };

  const handleDelete = async () => {
    if (!flavor) return;
    if (!confirm("Delete this humor flavor and all its steps?")) return;
    await supabase.from("humor_flavors").delete().eq("id", flavor.id);
    router.push("/admin");
  };

  if (mode === "create-btn") {
    return (
      <>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Flavor</button>
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h2 style={{ fontWeight: 700, marginBottom: "1.5rem" }}>Create Humor Flavor</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div><label style={{ fontSize: "0.8rem", color: "var(--text3)", display: "block", marginBottom: "0.4rem" }}>Name *</label>
                  <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Dry Wit" /></div>
                <div><label style={{ fontSize: "0.8rem", color: "var(--text3)", display: "block", marginBottom: "0.4rem" }}>Slug</label>
                  <input className="input" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="e.g. dry-wit" /></div>
                <div><label style={{ fontSize: "0.8rem", color: "var(--text3)", display: "block", marginBottom: "0.4rem" }}>Description</label>
                  <textarea className="input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What kind of humor does this flavor produce?" /></div>
              </div>
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem", justifyContent: "flex-end" }}>
                <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSave} disabled={loading || !form.name}>{loading ? "Saving..." : "Create"}</button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(true)}>Edit</button>
        <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete</button>
      </div>
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontWeight: 700, marginBottom: "1.5rem" }}>Edit Humor Flavor</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div><label style={{ fontSize: "0.8rem", color: "var(--text3)", display: "block", marginBottom: "0.4rem" }}>Name *</label>
                <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div><label style={{ fontSize: "0.8rem", color: "var(--text3)", display: "block", marginBottom: "0.4rem" }}>Slug</label>
                <input className="input" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} /></div>
              <div><label style={{ fontSize: "0.8rem", color: "var(--text3)", display: "block", marginBottom: "0.4rem" }}>Description</label>
                <textarea className="input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem", justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={loading || !form.name}>{loading ? "Saving..." : "Save"}</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
