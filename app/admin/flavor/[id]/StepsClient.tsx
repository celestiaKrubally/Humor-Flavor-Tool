"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

type Step = {
  id: string;
  humor_flavor_id: string;
  step_order: number;
  description?: string;
  system_prompt?: string;
  user_prompt?: string;
};

const emptyForm = { description: "", system_prompt: "", user_prompt: "" };

export default function StepsClient({ flavorId, initialSteps }: { flavorId: string; initialSteps: Step[] }) {
  const [steps, setSteps] = useState<Step[]>(initialSteps);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Step | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (s: Step) => { setEditing(s); setForm({ description: s.description ?? "", system_prompt: s.system_prompt ?? "", user_prompt: s.user_prompt ?? "" }); setShowModal(true); };

  const handleSave = async () => {
    setLoading(true);
    if (editing) {
      const { data } = await supabase.from("humor_flavor_steps").update(form).eq("id", editing.id).select().single();
      if (data) setSteps(steps.map(s => s.id === editing.id ? data : s));
    } else {
      const newOrder = steps.length + 1;
      const { data } = await supabase.from("humor_flavor_steps")
        .insert({ ...form, humor_flavor_id: flavorId, step_order: newOrder })
        .select().single();
      if (data) setSteps([...steps, data]);
    }
    setLoading(false);
    setShowModal(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this step?")) return;
    await supabase.from("humor_flavor_steps").delete().eq("id", id);
    const updated = steps.filter(s => s.id !== id).map((s, i) => ({ ...s, step_order: i + 1 }));
    setSteps(updated);
    // Reorder in DB
    for (const s of updated) {
      await supabase.from("humor_flavor_steps").update({ step_order: s.step_order }).eq("id", s.id);
    }
  };

  const moveStep = async (id: string, direction: "up" | "down") => {
    const idx = steps.findIndex(s => s.id === id);
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === steps.length - 1) return;

    const newSteps = [...steps];
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    [newSteps[idx], newSteps[swapIdx]] = [newSteps[swapIdx], newSteps[idx]];
    const reordered = newSteps.map((s, i) => ({ ...s, step_order: i + 1 }));
    setSteps(reordered);

    for (const s of reordered) {
      await supabase.from("humor_flavor_steps").update({ step_order: s.step_order }).eq("id", s.id);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ fontWeight: 700, fontSize: "1.1rem" }}>Steps</h2>
          <p className="page-subtitle">{steps.length} steps in order</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={openCreate}>+ Add Step</button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {steps.map((step, idx) => (
          <div key={step.id} className="step-card">
            <div className="step-number">{step.step_order}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              {step.description && <div style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.3rem" }}>{step.description}</div>}
              {step.system_prompt && (
                <div style={{ fontSize: "0.75rem", color: "var(--text3)", marginBottom: "0.2rem" }}>
                  <span style={{ fontFamily: "DM Mono, monospace" }}>system: </span>{step.system_prompt.slice(0, 80)}{step.system_prompt.length > 80 ? "..." : ""}
                </div>
              )}
              {step.user_prompt && (
                <div style={{ fontSize: "0.75rem", color: "var(--text3)" }}>
                  <span style={{ fontFamily: "DM Mono, monospace" }}>user: </span>{step.user_prompt.slice(0, 80)}{step.user_prompt.length > 80 ? "..." : ""}
                </div>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", flexShrink: 0 }}>
              <button className="btn btn-ghost btn-sm" onClick={() => moveStep(step.id, "up")} disabled={idx === 0}>↑</button>
              <button className="btn btn-ghost btn-sm" onClick={() => moveStep(step.id, "down")} disabled={idx === steps.length - 1}>↓</button>
              <button className="btn btn-ghost btn-sm" onClick={() => openEdit(step)}>Edit</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(step.id)}>Del</button>
            </div>
          </div>
        ))}
        {steps.length === 0 && <div className="empty-state">No steps yet. Add your first step!</div>}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontWeight: 700, marginBottom: "1.5rem" }}>{editing ? `Edit Step ${editing.step_order}` : "Add Step"}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--text3)", display: "block", marginBottom: "0.4rem" }}>Description</label>
                <input className="input" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What does this step do?" />
              </div>
              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--text3)", display: "block", marginBottom: "0.4rem" }}>System Prompt</label>
                <textarea className="input" value={form.system_prompt} onChange={e => setForm({ ...form, system_prompt: e.target.value })} placeholder="You are a..." style={{ minHeight: 100 }} />
              </div>
              <div>
                <label style={{ fontSize: "0.8rem", color: "var(--text3)", display: "block", marginBottom: "0.4rem" }}>User Prompt</label>
                <textarea className="input" value={form.user_prompt} onChange={e => setForm({ ...form, user_prompt: e.target.value })} placeholder="Given this image..." style={{ minHeight: 100 }} />
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem", justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={loading}>{loading ? "Saving..." : "Save"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
