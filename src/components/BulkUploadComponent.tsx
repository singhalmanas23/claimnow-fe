"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useExtractBulkClaim } from "@/hooks/use-claims";
import type { BulkExtractItem, BulkExtractResponse } from "@/lib/api-types";

const MAX_BULK_FILES = 500;

interface BulkUploadComponentProps {
  className?: string;
}

export default function BulkUploadComponent({ className = "" }: BulkUploadComponentProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bulkMutation = useExtractBulkClaim();

  const [selected, setSelected] = useState<File[]>([]);
  const [result, setResult] = useState<BulkExtractResponse | null>(null);
  const [error, setError] = useState<string>("");

  const handleChoose = () => fileInputRef.current?.click();

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const incoming = Array.from(files).filter((f) => f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf"));
    if (!incoming.length) {
      setError("Please select PDF files only.");
      return;
    }
    setError("");
    setSelected((prev) => {
      const seen = new Set(prev.map((f) => `${f.name}-${f.size}`));
      const merged = [...prev];
      for (const f of incoming) {
        const key = `${f.name}-${f.size}`;
        if (!seen.has(key)) {
          merged.push(f);
          seen.add(key);
        }
      }
      if (merged.length > MAX_BULK_FILES) {
        setError(`Limit is ${MAX_BULK_FILES} files per batch. Trimming.`);
        return merged.slice(0, MAX_BULK_FILES);
      }
      return merged;
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    addFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const removeAt = (idx: number) => {
    setSelected((prev) => prev.filter((_, i) => i !== idx));
  };

  const reset = () => {
    setSelected([]);
    setResult(null);
    setError("");
    bulkMutation.reset();
  };

  const handleUpload = async () => {
    if (!selected.length) {
      setError("Add at least one PDF.");
      return;
    }
    setError("");
    try {
      const res = await bulkMutation.mutateAsync(selected);
      setResult(res);
      if (res.batch_id) {
        // Stash the just-submitted batch so the dashboard can highlight it
        try { sessionStorage.setItem("lastBatchId", res.batch_id); } catch {}
        router.push(`/dashboard?highlight=${res.batch_id}`);
      }
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail ||
            "Bulk upload failed."
          : "Bulk upload failed.";
      setError(msg);
    }
  };

  const totalSizeMB = selected.reduce((s, f) => s + f.size, 0) / (1024 * 1024);

  return (
    <div className={`w-full ${className}`}>
      {!result && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="w-full rounded-[20px] border border-dashed border-[#B2B5BC] bg-white/60 px-6 py-8 transition-colors hover:border-[#2F5FED]"
        >
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-white shadow-[4px_4px_12px_0px_rgba(0,0,0,0.08)]">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M3.33337 15V33.3333C3.33337 34.2174 3.68456 35.0652 4.30969 35.6904C4.93481 36.3155 5.78265 36.6667 6.66671 36.6667H33.3334C34.2174 36.6667 35.0653 36.3155 35.6904 35.6904C36.3155 35.0652 36.6667 34.2174 36.6667 33.3333V15"
                  fill="rgba(29, 36, 51, 0.65)"
                  opacity="0.5"
                />
                <path
                  d="M13.75 2.08337L20 8.33337L26.25 2.08337M20 8.33337V26.25"
                  stroke="rgba(29, 36, 51, 0.65)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="font-satoshi text-[16px] font-medium text-[rgba(29,36,51,0.8)]">
              Drag &amp; drop PDFs or{" "}
              <button
                type="button"
                onClick={handleChoose}
                className="text-[#2F5FED] underline"
              >
                Choose Files
              </button>
            </p>
            <p className="mt-1 font-satoshi text-[13px] text-[rgba(29,36,51,0.65)]">
              Up to {MAX_BULK_FILES} PDFs per batch.
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            multiple
            onChange={handleInputChange}
            className="hidden"
          />

          {selected.length > 0 && (
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-poppins text-[14px] font-medium text-[#1D2433]">
                  {selected.length} file{selected.length !== 1 ? "s" : ""} selected
                  <span className="ml-2 text-[rgba(29,36,51,0.6)]">
                    ({totalSizeMB.toFixed(2)} MB total)
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => setSelected([])}
                  className="text-[13px] text-[rgba(29,36,51,0.6)] underline hover:text-[#1D2433]"
                >
                  Clear all
                </button>
              </div>
              <ul className="max-h-[260px] overflow-auto rounded-lg border border-[#E5E7EB] bg-white">
                {selected.map((f, idx) => (
                  <li
                    key={`${f.name}-${f.size}-${idx}`}
                    className="flex items-center justify-between border-b border-[#F1F2F4] px-3 py-2 text-[13px] last:border-b-0"
                  >
                    <span className="truncate pr-3 text-[#1D2433]">{f.name}</span>
                    <span className="flex items-center gap-3">
                      <span className="text-[rgba(29,36,51,0.6)]">
                        {(f.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                      <button
                        type="button"
                        onClick={() => removeAt(idx)}
                        className="text-[rgba(29,36,51,0.6)] hover:text-red-600"
                        aria-label="Remove file"
                      >
                        ✕
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-[13px] text-red-700">
              {error}
            </div>
          )}

          <div className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={handleChoose}
              className="rounded-full border border-[#D8DDE7] bg-white px-4 py-2 font-satoshi text-[14px] font-medium text-[#1D2433] hover:bg-[#F7F8FA]"
            >
              Add more
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={bulkMutation.isPending || !selected.length}
              className="rounded-full bg-gradient-to-br from-[#2F5FED] to-[#60B6F7] px-5 py-2 font-satoshi text-[14px] font-medium text-white transition-opacity hover:opacity-95 disabled:opacity-50"
            >
              {bulkMutation.isPending
                ? `Uploading ${selected.length}...`
                : `Upload ${selected.length || ""} ${selected.length === 1 ? "file" : "files"}`}
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className="w-full rounded-[20px] border border-[#D8DDE7] bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-poppins text-[18px] font-semibold text-[#1D2433]">
              Bulk upload results
            </h3>
            <button
              type="button"
              onClick={reset}
              className="text-[13px] text-[#2F5FED] underline"
            >
              Upload another batch
            </button>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-green-200 bg-green-50 p-3">
              <p className="text-[12px] uppercase tracking-wide text-green-700">Accepted</p>
              <p className="font-poppins text-[24px] font-semibold text-green-800">
                {result.accepted}
              </p>
            </div>
            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-[12px] uppercase tracking-wide text-red-700">Rejected</p>
              <p className="font-poppins text-[24px] font-semibold text-red-800">
                {result.rejected}
              </p>
            </div>
          </div>

          <ul className="max-h-[320px] overflow-auto rounded-lg border border-[#E5E7EB]">
            {result.results.map((r: BulkExtractItem, idx: number) => (
              <li
                key={`${r.claim_id || r.filename || idx}`}
                className="flex items-center justify-between border-b border-[#F1F2F4] px-3 py-2 text-[13px] last:border-b-0"
              >
                <div className="min-w-0 flex-1 pr-3">
                  <p className="truncate text-[#1D2433]">{r.filename || "(unknown filename)"}</p>
                  {r.claim_id && (
                    <p className="truncate text-[12px] text-[rgba(29,36,51,0.5)]">
                      claim_id: {r.claim_id}
                    </p>
                  )}
                  {r.error && (
                    <p className="truncate text-[12px] text-red-600">{r.error}</p>
                  )}
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                    r.status === "queued"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {r.status}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push("/claims")}
              className="rounded-full border border-[#D8DDE7] bg-white px-4 py-2 font-satoshi text-[14px] font-medium text-[#1D2433] hover:bg-[#F7F8FA]"
            >
              View all claims
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded-full bg-gradient-to-br from-[#2F5FED] to-[#60B6F7] px-5 py-2 font-satoshi text-[14px] font-medium text-white hover:opacity-95"
            >
              Upload another batch
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
