"use client";

import React, { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useBatchStatus } from "@/hooks/use-claims";
import { claimsService } from "@/services/claims.service";
import type { BatchClaimItem, BatchBucket } from "@/lib/api-types";

const BUCKET_LABEL: Record<BatchBucket, string> = {
  auto_processed: "Auto-processed",
  needs_review: "Needs review",
  failed: "Failed",
  in_flight: "In flight",
};

const BUCKET_ORDER: BatchBucket[] = [
  "needs_review",
  "in_flight",
  "auto_processed",
  "failed",
];

const BUCKET_TONES: Record<BatchBucket, string> = {
  auto_processed: "border-green-200 bg-green-50 text-green-800",
  needs_review: "border-amber-200 bg-amber-50 text-amber-800",
  failed: "border-red-200 bg-red-50 text-red-800",
  in_flight: "border-blue-200 bg-blue-50 text-blue-800",
};

const BADGE_TONES: Record<BatchBucket, string> = {
  auto_processed: "bg-green-100 text-green-700",
  needs_review: "bg-amber-100 text-amber-800",
  failed: "bg-red-100 text-red-700",
  in_flight: "bg-blue-100 text-blue-700",
};

export default function BatchTrackerPage() {
  const router = useRouter();
  const params = useParams<{ batchId: string }>();
  const batchId = params?.batchId ?? null;
  const { data, isLoading, isError, error } = useBatchStatus(batchId);

  const grouped = useMemo(() => {
    const map: Record<BatchBucket, BatchClaimItem[]> = {
      auto_processed: [],
      needs_review: [],
      failed: [],
      in_flight: [],
    };
    if (!data) return map;
    for (const item of data.items) {
      map[item.bucket].push(item);
    }
    return map;
  }, [data]);

  if (!batchId) return null;

  return (
    <div className="min-h-screen bg-white">
      <header className="w-full h-[72px] border-b border-[#D8DDE7] bg-white/90 backdrop-blur-sm">
        <div className="flex items-center justify-between h-full px-16">
          <button
            onClick={() => router.push("/upload")}
            className="font-satoshi font-bold text-[20px] leading-[27px] bg-gradient-to-r from-[#2F5FED] to-[#60B6F7] bg-clip-text text-transparent"
          >
            ClaimNow.ai
          </button>
          <button
            onClick={() => router.push("/upload")}
            className="rounded-full border border-[#D8DDE7] bg-white px-4 py-2 font-satoshi text-[14px] font-medium text-[#1D2433] hover:bg-[#F7F8FA]"
          >
            New batch
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-8 py-10">
        <div className="mb-8">
          <p className="text-[12px] uppercase tracking-wider text-[rgba(29,36,51,0.55)]">Batch</p>
          <h1 className="font-poppins text-[28px] font-semibold text-[#1D2433] break-all">{batchId}</h1>
          {data && (
            <p className="mt-1 text-[13px] text-[rgba(29,36,51,0.6)]">
              {data.counts.total} claim{data.counts.total !== 1 ? "s" : ""} in this batch
              {data.counts.in_flight > 0 && (
                <span className="ml-2 inline-flex items-center gap-1">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                  live polling
                </span>
              )}
            </p>
          )}
          {data && batchId && (
            <BatchDownloadButtons batchId={batchId} inFlight={data.counts.in_flight} />
          )}
        </div>

        {isLoading && (
          <div className="rounded-lg border border-[#E5E7EB] bg-white p-6 text-[14px] text-[rgba(29,36,51,0.7)]">
            Loading batch...
          </div>
        )}

        {isError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-[14px] text-red-700">
            Failed to load batch: {(error as Error)?.message ?? "unknown error"}
          </div>
        )}

        {data && (
          <>
            <section className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {BUCKET_ORDER.map((b) => (
                <div key={b} className={`rounded-xl border p-4 ${BUCKET_TONES[b]}`}>
                  <p className="text-[12px] uppercase tracking-wider opacity-80">{BUCKET_LABEL[b]}</p>
                  <p className="font-poppins text-[32px] font-semibold leading-tight">
                    {data.counts[b]}
                  </p>
                  <p className="text-[12px] opacity-70">
                    {data.counts.total ? Math.round((data.counts[b] / data.counts.total) * 100) : 0}%
                  </p>
                </div>
              ))}
            </section>

            <section className="space-y-6">
              {BUCKET_ORDER.map((b) => {
                const rows = grouped[b];
                if (!rows.length) return null;
                return (
                  <div key={b} className="rounded-xl border border-[#E5E7EB] bg-white">
                    <header className="flex items-center justify-between border-b border-[#F1F2F4] px-5 py-3">
                      <h2 className="font-poppins text-[16px] font-medium text-[#1D2433]">
                        {BUCKET_LABEL[b]}{" "}
                        <span className="text-[rgba(29,36,51,0.5)]">({rows.length})</span>
                      </h2>
                      {b === "needs_review" && (
                        <span className="text-[12px] text-[rgba(29,36,51,0.6)]">
                          Click a row to review &amp; adjudicate
                        </span>
                      )}
                      {b === "failed" && batchId && (
                        <RetryFailedButton batchId={batchId} count={rows.length} />
                      )}
                    </header>
                    <ul>
                      {rows.map((item) => {
                        const clickable = b === "needs_review" || b === "auto_processed";
                        const handleClick = async () => {
                          if (b === "needs_review") {
                            sessionStorage.setItem("currentClaimId", item.claim_id);
                            sessionStorage.setItem("uploadedFileName", item.filename || "");
                            sessionStorage.setItem("currentBatchId", batchId);
                            try {
                              const extracted = await claimsService.getExtractedData(item.claim_id);
                              sessionStorage.setItem("extractedClaimData", JSON.stringify(extracted));
                            } catch (e) {
                              console.error("Batch: failed to fetch extracted data", e);
                              sessionStorage.removeItem("extractedClaimData");
                            }
                            router.push("/review");
                          } else if (b === "auto_processed") {
                            router.push(`/claims/${item.claim_id}`);
                          }
                        };
                        return (
                          <li
                            key={item.claim_id}
                            onClick={clickable ? handleClick : undefined}
                            className={`flex items-center justify-between border-b border-[#F1F2F4] px-5 py-3 last:border-b-0 ${
                              clickable ? "cursor-pointer hover:bg-[#F7F8FA]" : ""
                            }`}
                          >
                            <div className="min-w-0 flex-1 pr-3">
                              <p className="truncate text-[14px] text-[#1D2433]">
                                {item.filename || "(no filename)"}
                              </p>
                              <p className="truncate text-[12px] text-[rgba(29,36,51,0.5)]">
                                claim_id: {item.claim_id}
                              </p>
                              {item.last_error && (
                                <p className="truncate text-[12px] text-red-600">{item.last_error}</p>
                              )}
                            </div>
                            <span
                              className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${BADGE_TONES[b]}`}
                            >
                              {item.status}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </section>
          </>
        )}
      </main>
    </div>
  );
}


function BatchDownloadButtons({ batchId, inFlight }: { batchId: string; inFlight: number }) {
  const [busy, setBusy] = useState<"csv" | "xlsx" | null>(null);
  const [error, setError] = useState<string>("");

  const download = async (format: "csv" | "xlsx") => {
    setError("");
    setBusy(format);
    try {
      const blob = await claimsService.getBatchResults(batchId, format);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `batch-${batchId}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "response" in e
          ? (e as { response?: { data?: { detail?: string } } }).response?.data?.detail || "download failed"
          : "download failed";
      setError(msg);
    } finally {
      setBusy(null);
    }
  };

  const baseBtn =
    "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-satoshi text-[13px] font-medium transition disabled:opacity-50";

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <button
        onClick={() => download("csv")}
        disabled={busy !== null}
        className={`${baseBtn} border-[#D8DDE7] bg-white text-[#1D2433] hover:bg-[#F7F8FA]`}
      >
        {busy === "csv" ? "Preparing…" : "↓ Download CSV"}
      </button>
      <button
        onClick={() => download("xlsx")}
        disabled={busy !== null}
        className={`${baseBtn} border-green-200 bg-green-50 text-green-800 hover:bg-green-100`}
      >
        {busy === "xlsx" ? "Preparing…" : "↓ Download Excel"}
      </button>
      {inFlight > 0 && (
        <span className="text-[12px] text-[rgba(29,36,51,0.55)]">
          {inFlight} still processing — export reflects current results
        </span>
      )}
      {error && <span className="text-[12px] text-red-600">{error}</span>}
    </div>
  );
}


function RetryFailedButton({ batchId, count }: { batchId: string; count: number }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ retried: number; message?: string } | null>(null);
  const [error, setError] = useState<string>("");

  const handleClick = async () => {
    setError("");
    setDone(null);
    setBusy(true);
    try {
      const r = await claimsService.retryFailedInBatch(batchId);
      setDone({ retried: r.retried, message: r.message });
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "response" in e
          ? (e as { response?: { data?: { detail?: string } } }).response?.data?.detail || "retry failed"
          : "retry failed";
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <span className="text-[12px] text-green-700">
        ✓ {done.retried} re-enqueued{done.message ? ` — ${done.message}` : ""}
      </span>
    );
  }
  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-[12px] text-red-600">{error}</span>}
      <button
        onClick={handleClick}
        disabled={busy}
        className="text-[12px] rounded-full bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 font-medium disabled:opacity-50"
      >
        {busy ? "Retrying…" : `Retry all ${count} failed`}
      </button>
    </div>
  );
}
