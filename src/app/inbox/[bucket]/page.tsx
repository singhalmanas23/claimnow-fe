"use client";

import React from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { claimsService } from "@/services/claims.service";
import type { ClaimRecord } from "@/lib/api-types";

const VALID_BUCKETS = ["in_flight", "needs_review", "completed", "auto_processed", "failed"] as const;
type Bucket = (typeof VALID_BUCKETS)[number];

const BUCKET_LABEL: Record<Bucket, string> = {
  in_flight: "In flight",
  needs_review: "Needs review",
  completed: "Auto-processed",
  auto_processed: "Auto-processed",
  failed: "Failed",
};

const BUCKET_TONE: Record<Bucket, string> = {
  in_flight: "border-blue-200 bg-blue-50 text-blue-800",
  needs_review: "border-amber-200 bg-amber-50 text-amber-800",
  completed: "border-green-200 bg-green-50 text-green-800",
  auto_processed: "border-green-200 bg-green-50 text-green-800",
  failed: "border-red-200 bg-red-50 text-red-800",
};

const BADGE_TONE: Record<Bucket, string> = {
  in_flight: "bg-blue-100 text-blue-700",
  needs_review: "bg-amber-100 text-amber-800",
  completed: "bg-green-100 text-green-700",
  auto_processed: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  const diffSec = Math.max(0, (Date.now() - t) / 1000);
  if (diffSec < 60) return `${Math.floor(diffSec)}s ago`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

export default function InboxPage() {
  const router = useRouter();
  const params = useParams<{ bucket: string }>();
  const rawBucket = params?.bucket ?? "";
  const bucket = (VALID_BUCKETS as readonly string[]).includes(rawBucket)
    ? (rawBucket as Bucket)
    : null;

  const { data, isLoading, isError, error, refetch, dataUpdatedAt } = useQuery({
    queryKey: ["inbox", bucket],
    queryFn: () => claimsService.getClaimsByBucket(bucket!, 200),
    enabled: !!bucket,
    refetchInterval: bucket === "in_flight" ? 5_000 : 15_000,
    staleTime: 0,
  });

  if (!bucket) {
    return (
      <div className="min-h-screen bg-white p-10">
        <h1 className="text-2xl font-semibold mb-4">Unknown inbox</h1>
        <p className="text-gray-600">
          Path <code>/inbox/{rawBucket}</code> isn't a valid bucket. Try one of:{" "}
          {VALID_BUCKETS.join(", ")}.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-6 inline-flex items-center gap-2 text-blue-700 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </button>
      </div>
    );
  }

  const handleClaimClick = async (claim: ClaimRecord) => {
    if (bucket === "needs_review") {
      sessionStorage.setItem("currentClaimId", claim.claim_id);
      sessionStorage.setItem("uploadedFileName", claim.original_pdf_filename || "");
      if (claim.batch_id) sessionStorage.setItem("currentBatchId", claim.batch_id);
      try {
        const extracted = await claimsService.getExtractedData(claim.claim_id);
        sessionStorage.setItem("extractedClaimData", JSON.stringify(extracted));
      } catch (e) {
        console.error("Inbox: failed to fetch extracted data", e);
        sessionStorage.removeItem("extractedClaimData");
      }
      router.push("/review");
    } else if (bucket === "completed" || bucket === "auto_processed") {
      router.push(`/claims/${claim.claim_id}`);
    } else if (bucket === "failed" && claim.batch_id) {
      // Failed: jump to the batch context so user can retry / inspect
      router.push(`/batches/${claim.batch_id}`);
    }
  };

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
          <nav className="flex items-center gap-2 text-sm">
            <button onClick={() => router.push("/upload")} className="px-3 py-1.5 rounded-full hover:bg-[#F7F8FA] text-[#1D2433]">Upload</button>
            <button onClick={() => router.push("/dashboard")} className="px-3 py-1.5 rounded-full hover:bg-[#F7F8FA] text-[#1D2433]">Dashboard</button>
            <span className="px-3 py-1.5 rounded-full bg-[#EEF2FF] text-[#2F5FED] font-medium">Inbox</span>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-8 py-10">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-[rgba(29,36,51,0.7)] hover:text-[#1D2433]"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <p className="text-[12px] uppercase tracking-wider text-[rgba(29,36,51,0.55)]">Inbox</p>
            <h1 className="font-poppins text-[28px] font-semibold text-[#1D2433]">
              {BUCKET_LABEL[bucket]}
            </h1>
            <p className="mt-1 text-[13px] text-[rgba(29,36,51,0.6)]">
              {data ? `${data.length} claim${data.length !== 1 ? "s" : ""}` : "Loading..."}
              {dataUpdatedAt > 0 && (
                <span className="ml-2 inline-flex items-center gap-1">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                  updated {timeAgo(new Date(dataUpdatedAt).toISOString())}
                </span>
              )}
            </p>
          </div>
        </div>

        {isError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-[14px] text-red-700">
            Failed to load inbox: {(error as Error)?.message ?? "unknown error"}
            <button onClick={() => refetch()} className="ml-3 underline">retry</button>
          </div>
        )}

        {isLoading && !data && (
          <div className="rounded-lg border border-[#E5E7EB] bg-white p-6 text-[14px] text-[rgba(29,36,51,0.7)]">
            Loading...
          </div>
        )}

        {data && data.length === 0 && (
          <div className={`rounded-xl border p-10 text-center ${BUCKET_TONE[bucket]}`}>
            <p className="text-[18px] font-medium">Nothing here.</p>
            <p className="text-[13px] opacity-70 mt-1">
              No claims currently in <strong>{BUCKET_LABEL[bucket]}</strong>.
            </p>
          </div>
        )}

        {data && data.length > 0 && (
          <div className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#F7F8FA] text-[12px] uppercase tracking-wider text-[rgba(29,36,51,0.55)]">
                  <tr>
                    <th className="text-left px-5 py-2 font-medium">File</th>
                    <th className="text-left px-3 py-2 font-medium">Source</th>
                    <th className="text-left px-3 py-2 font-medium">Batch</th>
                    <th className="text-left px-3 py-2 font-medium">Submitted</th>
                    <th className="text-right px-5 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((c) => {
                    const clickable =
                      bucket === "needs_review" ||
                      bucket === "completed" ||
                      bucket === "auto_processed" ||
                      (bucket === "failed" && !!c.batch_id);
                    const sourceType = (c as ClaimRecord & { source_type?: string }).source_type;
                    return (
                      <tr
                        key={c.claim_id}
                        onClick={clickable ? () => handleClaimClick(c) : undefined}
                        className={`border-t border-[#F1F2F4] transition-colors ${
                          clickable ? "cursor-pointer hover:bg-[#F7F8FA]" : ""
                        }`}
                      >
                        <td className="px-5 py-3 align-top">
                          <div className="font-medium text-[#1D2433] truncate max-w-[420px]">
                            {c.original_pdf_filename || "(no filename)"}
                          </div>
                          <div className="text-[11px] font-mono text-[rgba(29,36,51,0.5)] truncate max-w-[420px]">
                            {c.claim_id}
                          </div>
                          {bucket === "failed" && c.last_error && (
                            <div className="text-[12px] text-red-600 mt-1 break-words max-w-[420px]">
                              ⚠ {c.last_error}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-3 align-top text-[rgba(29,36,51,0.7)]">
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-gray-100 text-gray-700">
                            {sourceType === "url" ? "URL" : "upload"}
                          </span>
                        </td>
                        <td className="px-3 py-3 align-top text-[12px] font-mono text-[rgba(29,36,51,0.7)]">
                          {c.batch_id ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/batches/${c.batch_id}`);
                              }}
                              className="hover:underline text-blue-700"
                            >
                              {c.batch_id.slice(0, 8)}…
                            </button>
                          ) : (
                            <span className="text-[rgba(29,36,51,0.3)]">—</span>
                          )}
                        </td>
                        <td className="px-3 py-3 align-top text-[rgba(29,36,51,0.7)]">
                          <div>{timeAgo(c.created_at)}</div>
                          <div className="text-[11px] text-[rgba(29,36,51,0.4)]">
                            {c.created_at ? new Date(c.created_at).toLocaleString() : ""}
                          </div>
                        </td>
                        <td className="px-5 py-3 align-top text-right">
                          <span
                            className={`inline-flex items-center justify-center rounded-full px-2.5 py-1 text-[11px] font-medium ${BADGE_TONE[bucket]}`}
                          >
                            {c.status || bucket}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
