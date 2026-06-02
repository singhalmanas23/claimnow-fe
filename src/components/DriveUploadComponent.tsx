"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";

type SubmitResult = {
  batch_id: string;
  accepted: number;
  rejected: number;
  results: Array<{ claim_id?: string; ref?: string | null; status: string }>;
};

export default function DriveUploadComponent() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async () => {
    setError("");
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Paste a Google Drive folder or file URL.");
      return;
    }
    if (!trimmed.startsWith("https://drive.google.com/")) {
      setError("That doesn't look like a drive.google.com URL.");
      return;
    }

    setSubmitting(true);
    try {
      const resp = await apiClient.post<SubmitResult>(
        "/api/v1/claims/extract-from-drive",
        { drive_url: trimmed },
        { timeout: 600_000 }, // gdown can take a while
      );
      if (resp.data.batch_id) {
        try { sessionStorage.setItem("lastBatchId", resp.data.batch_id); } catch {}
        router.push(`/dashboard?highlight=${resp.data.batch_id}`);
      }
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || "Drive fetch failed."
          : "Drive fetch failed.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full p-5">
      <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-50 border border-amber-200 px-3 py-1">
        <span className="text-[11px] uppercase tracking-wider text-amber-800 font-medium">Testing helper</span>
        <span className="text-[11px] text-amber-700">PDFs are downloaded briefly to disk. For production, use “By URL”.</span>
      </div>

      <label className="block text-[13px] font-medium text-[#1D2433] mb-1.5">
        Google Drive folder URL
      </label>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://drive.google.com/drive/folders/..."
        className="w-full px-3 py-2 border border-[#D8DDE7] rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2F5FED] focus:border-transparent"
        autoComplete="off"
        spellCheck={false}
      />
      <p className="mt-1 text-[12px] text-[rgba(29,36,51,0.55)]">
        Folder must be shared as <strong>“Anyone with the link → Viewer”</strong>. Every PDF inside is pulled in one batch. Large folders may take a minute or two.
      </p>

      {error && (
        <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-[13px] text-red-700 whitespace-pre-wrap">
          {error}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <span className="text-[12px] text-[rgba(29,36,51,0.55)]">
          After submit → you'll land on the dashboard
        </span>
        <button
          onClick={handleSubmit}
          disabled={submitting || !url.trim()}
          className="flex items-center gap-2 bg-gradient-to-br from-[#2F5FED] to-[#60B6F7] text-white px-5 py-2.5 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:from-[#2854D6] hover:to-[#4B7AE8] transition-all"
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">Pulling from Drive…</span>
            </>
          ) : (
            <span className="text-sm font-medium">Pull and process</span>
          )}
        </button>
      </div>
    </div>
  );
}
