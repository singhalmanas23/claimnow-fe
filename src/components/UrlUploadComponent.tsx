"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api-client";

type SubmitResult = {
  batch_id: string;
  accepted: number;
  rejected: number;
  results: Array<{ claim_id?: string; ref?: string | null; url?: string; status: string; error?: string }>;
};

export default function UrlUploadComponent() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [authHeader, setAuthHeader] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [result, setResult] = useState<SubmitResult | null>(null);

  const parseUrls = (raw: string): string[] =>
    raw
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

  const handleSubmit = async () => {
    setError("");
    setResult(null);
    const urls = parseUrls(text);
    if (urls.length === 0) {
      setError("Add at least one URL (one per line, or comma-separated).");
      return;
    }
    const invalid = urls.filter((u) => !/^https?:\/\//i.test(u));
    if (invalid.length > 0) {
      setError(`These don't look like http(s) URLs:\n${invalid.slice(0, 3).join("\n")}${invalid.length > 3 ? `\n…and ${invalid.length - 3} more` : ""}`);
      return;
    }

    setSubmitting(true);
    try {
      const body: {
        pdfs: Array<{ url: string; ref: string | null; auth_header: string | null }>;
        webhook_url?: string;
        webhook_secret?: string;
      } = {
        pdfs: urls.map((url) => ({
          url,
          ref: url.split("/").pop()?.split("?")[0] || null,
          auth_header: authHeader.trim() || null,
        })),
      };
      // Optional: push signed results to the client's webhook when provided.
      if (webhookUrl.trim()) {
        body.webhook_url = webhookUrl.trim();
        if (webhookSecret.trim()) body.webhook_secret = webhookSecret.trim();
      }
      const resp = await apiClient.post<SubmitResult>("/api/v1/claims/extract-from-urls", body);
      setResult(resp.data);
      if (resp.data.batch_id) {
        try {
          sessionStorage.setItem("lastBatchId", resp.data.batch_id);
        } catch {}
        router.push(`/dashboard?highlight=${resp.data.batch_id}`);
      }
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || "URL submission failed."
          : "URL submission failed.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const urlCount = parseUrls(text).length;

  return (
    <div className="w-full p-5">
      <div className="mb-3">
        <label className="block text-[13px] font-medium text-[#1D2433] mb-1.5">
          PDF URLs <span className="text-[rgba(29,36,51,0.6)] font-normal">(one per line, or comma-separated)</span>
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={6}
          placeholder="https://acme.com/api/claims/12345/pdf&#10;https://acme.com/api/claims/12346/pdf&#10;..."
          className="w-full px-3 py-2 border border-[#D8DDE7] rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2F5FED] focus:border-transparent"
          spellCheck={false}
        />
        <p className="mt-1 text-[12px] text-[rgba(29,36,51,0.55)]">
          {urlCount > 0 ? `${urlCount} URL${urlCount === 1 ? "" : "s"} parsed` : "Paste links above"}
        </p>
      </div>

      <div className="mb-3">
        <label className="block text-[13px] font-medium text-[#1D2433] mb-1.5">
          Authorization header{" "}
          <span className="text-[rgba(29,36,51,0.6)] font-normal">(optional — used at fetch time only, not stored)</span>
        </label>
        <input
          type="text"
          value={authHeader}
          onChange={(e) => setAuthHeader(e.target.value)}
          placeholder="Bearer eyJhbGc..."
          className="w-full px-3 py-2 border border-[#D8DDE7] rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2F5FED] focus:border-transparent"
          autoComplete="off"
        />
        <p className="mt-1 text-[12px] text-[rgba(29,36,51,0.55)]">
          Tip: for full review UX with PDF preview, prefer pre-signed URLs (S3, GCS) — the auth lives in the URL itself.
        </p>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[13px] font-medium text-[#1D2433] mb-1.5">
            Webhook URL{" "}
            <span className="text-[rgba(29,36,51,0.6)] font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="http://127.0.0.1:9500/hook"
            className="w-full px-3 py-2 border border-[#D8DDE7] rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2F5FED] focus:border-transparent"
            autoComplete="off"
          />
          <p className="mt-1 text-[12px] text-[rgba(29,36,51,0.55)]">
            We POST signed results here when the batch finishes.
          </p>
        </div>
        <div>
          <label className="block text-[13px] font-medium text-[#1D2433] mb-1.5">
            Webhook secret{" "}
            <span className="text-[rgba(29,36,51,0.6)] font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={webhookSecret}
            onChange={(e) => setWebhookSecret(e.target.value)}
            placeholder="testsecret123"
            className="w-full px-3 py-2 border border-[#D8DDE7] rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2F5FED] focus:border-transparent"
            autoComplete="off"
          />
          <p className="mt-1 text-[12px] text-[rgba(29,36,51,0.55)]">
            Used to HMAC-sign the payload (X-Mediclaim-Signature).
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-3 p-3 rounded-lg bg-red-50 border border-red-200 text-[13px] text-red-700 whitespace-pre-wrap">
          {error}
        </div>
      )}

      {result && (
        <div className="mb-3 p-3 rounded-lg bg-green-50 border border-green-200 text-[13px] text-green-800">
          batch_id <code className="font-mono">{result.batch_id}</code>: accepted {result.accepted}, rejected {result.rejected}
        </div>
      )}

      <div className="flex items-center justify-between">
        <span className="text-[12px] text-[rgba(29,36,51,0.55)]">
          After submit → you'll land on the dashboard
        </span>
        <button
          onClick={handleSubmit}
          disabled={submitting || urlCount === 0}
          className="flex items-center gap-2 bg-gradient-to-br from-[#2F5FED] to-[#60B6F7] text-white px-5 py-2.5 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:from-[#2854D6] hover:to-[#4B7AE8] transition-all"
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium">Submitting…</span>
            </>
          ) : (
            <span className="text-sm font-medium">Submit {urlCount > 0 ? `${urlCount} URL${urlCount === 1 ? "" : "s"}` : "URLs"}</span>
          )}
        </button>
      </div>
    </div>
  );
}
