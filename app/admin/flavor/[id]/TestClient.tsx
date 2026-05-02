"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

type Caption = { id: string; text?: string; content?: string; created_at?: string };

export default function TestClient({ flavorId, flavorName }: { flavorId: string; flavorName: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const supabase = createClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setCaptions([]);
    setError("");
  };

  const handleGenerate = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setCaptions([]);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Not authenticated");

      setStatus("Getting upload URL...");
      const presignedRes = await fetch("https://api.almostcrackd.ai/pipeline/generate-presigned-url", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: file.type }),
      });
      if (!presignedRes.ok) throw new Error("Failed to get upload URL");
      const { presignedUrl, cdnUrl } = await presignedRes.json();

      setStatus("Uploading image...");
      await fetch(presignedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      setStatus("Registering image...");
      const registerRes = await fetch("https://api.almostcrackd.ai/pipeline/upload-image-from-url", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: cdnUrl, isCommonUse: false }),
      });
      if (!registerRes.ok) throw new Error("Failed to register image");
      const { imageId } = await registerRes.json();

      setStatus("Generating captions...");
      const captionRes = await fetch("https://api.almostcrackd.ai/pipeline/generate-captions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ imageId, humorFlavorId: flavorId }),
      });
      if (!captionRes.ok) throw new Error("Failed to generate captions");
      const data = await captionRes.json();

      const result = Array.isArray(data) ? data : data.captions ?? [];
      setCaptions(result);
      setStatus("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStatus("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ fontWeight: 700, fontSize: "1.1rem" }}>Test Flavor</h2>
          <p className="page-subtitle">generate captions with {flavorName}</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: "1rem" }}>
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ fontSize: "0.8rem", color: "var(--text3)", display: "block", marginBottom: "0.4rem" }}>Upload test image</label>
          <input type="file" accept="image/*" onChange={handleFileChange} style={{ color: "var(--text2)", fontSize: "0.85rem" }} />
        </div>

        {preview && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="preview" style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 8, marginBottom: "1rem", border: "1px solid var(--border)" }} />
          </>
        )}

        {error && (
          <div style={{ background: "#c1121f18", border: "1px solid #c1121f44", borderRadius: 7, padding: "0.75rem", color: "var(--red)", fontSize: "0.85rem", marginBottom: "1rem", fontFamily: "DM Mono, monospace" }}>
            {error}
          </div>
        )}

        {status && (
          <div style={{ color: "var(--text3)", fontSize: "0.8rem", marginBottom: "0.75rem", fontFamily: "DM Mono, monospace" }}>
            ⏳ {status}
          </div>
        )}

        <button
          className="btn btn-primary"
          onClick={handleGenerate}
          disabled={!file || loading}
          style={{ width: "100%", justifyContent: "center" }}
        >
          {loading ? "Generating..." : "Generate Captions"}
        </button>
      </div>

      {captions.length > 0 && (
        <div>
          <h3 style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: "0.75rem", color: "var(--text2)" }}>
            Generated Captions ({captions.length})
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {captions.map((c, i) => (
              <div key={c.id ?? i} className="card" style={{ padding: "0.875rem 1rem" }}>
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                  <span style={{ fontFamily: "DM Mono, monospace", fontSize: "0.7rem", color: "var(--text3)", paddingTop: 2, minWidth: 20 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span style={{ fontSize: "0.9rem", color: "var(--text)", lineHeight: 1.5 }}>
                    {c.text ?? c.content ?? JSON.stringify(c)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}