"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { claimsService } from "@/services/claims.service";
import type { DashboardResponse } from "@/lib/api-types";

type Window = "today" | "week" | "all";

const WINDOW_LABEL: Record<Window, string> = {
  today: "Today",
  week: "This week",
  all: "All time",
};

const TILES: Array<{
  key: keyof DashboardResponse["counts"];
  label: string;
  tone: string;
  badgeTone: string;
}> = [
  { key: "in_flight", label: "In flight", tone: "border-blue-200 bg-blue-50 text-blue-800", badgeTone: "bg-blue-100 text-blue-700" },
  { key: "needs_review", label: "Needs review", tone: "border-amber-200 bg-amber-50 text-amber-800", badgeTone: "bg-amber-100 text-amber-800" },
  { key: "completed", label: "Auto-processed", tone: "border-green-200 bg-green-50 text-green-800", badgeTone: "bg-green-100 text-green-700" },
  { key: "failed", label: "Failed", tone: "border-red-200 bg-red-50 text-red-800", badgeTone: "bg-red-100 text-red-700" },
];

function pct(part: number, total: number) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const t = new Date(iso).getTime();
  const diffSec = Math.max(0, (Date.now() - t) / 1000);
  if (diffSec < 60) return `${Math.floor(diffSec)}s ago`;
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
}

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightBatchId = searchParams?.get("highlight") ?? null;
  const [window, setWindow] = useState<Window>("today");

  const { data, isLoading, isError, error, dataUpdatedAt } = useQuery({
    queryKey: ["dashboard", window],
    queryFn: () => claimsService.getDashboard(window, 20),
    refetchInterval: 10_000,
    staleTime: 0,
  });

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
            <button onClick={() => router.push("/claims")} className="px-3 py-1.5 rounded-full hover:bg-[#F7F8FA] text-[#1D2433]">Claims</button>
            <span className="px-3 py-1.5 rounded-full bg-[#EEF2FF] text-[#2F5FED] font-medium">Dashboard</span>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[12px] uppercase tracking-wider text-[rgba(29,36,51,0.55)]">Pipeline</p>
            <h1 className="font-poppins text-[28px] font-semibold text-[#1D2433]">Claims Dashboard</h1>
            <p className="mt-1 text-[13px] text-[rgba(29,36,51,0.6)]">
              Live overview across all your batches
              {dataUpdatedAt > 0 && (
                <span className="ml-2 inline-flex items-center gap-1">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                  updated {timeAgo(new Date(dataUpdatedAt).toISOString())}
                </span>
              )}
            </p>
          </div>

          <div className="inline-flex rounded-full border border-[#E5E7EB] p-1 bg-white">
            {(Object.keys(WINDOW_LABEL) as Window[]).map((w) => (
              <button
                key={w}
                onClick={() => setWindow(w)}
                className={`px-4 py-1.5 text-sm rounded-full transition-colors ${
                  window === w ? "bg-[#2F5FED] text-white" : "text-[#1D2433] hover:bg-[#F7F8FA]"
                }`}
              >
                {WINDOW_LABEL[w]}
              </button>
            ))}
          </div>
        </div>

        {isError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-[14px] text-red-700">
            Failed to load dashboard: {(error as Error)?.message ?? "unknown error"}
          </div>
        )}

        {isLoading && !data && (
          <div className="rounded-lg border border-[#E5E7EB] bg-white p-6 text-[14px] text-[rgba(29,36,51,0.7)]">
            Loading dashboard...
          </div>
        )}

        {data && (
          <>
            {/* KPI tiles — clickable, drill into /inbox/{bucket} */}
            <section className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {TILES.map((t) => {
                const value = data.counts[t.key];
                const disabled = value === 0;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => !disabled && router.push(`/inbox/${t.key}`)}
                    disabled={disabled}
                    className={`text-left rounded-xl border p-5 transition-all ${t.tone} ${
                      disabled
                        ? "opacity-60 cursor-default"
                        : "cursor-pointer hover:shadow-md hover:scale-[1.01]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[12px] uppercase tracking-wider opacity-80">{t.label}</p>
                      {!disabled && (
                        <span className="text-[11px] opacity-70">view all →</span>
                      )}
                    </div>
                    <p className="font-poppins text-[36px] font-semibold leading-tight">{value}</p>
                    <p className="text-[12px] opacity-70">
                      {pct(value, data.counts.total)}% of {data.counts.total}
                    </p>
                  </button>
                );
              })}
            </section>

            {/* Secondary metrics */}
            <section className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
                <p className="text-[12px] uppercase tracking-wider text-[rgba(29,36,51,0.55)]">Auto-processed rate</p>
                <p className="font-poppins text-[28px] font-semibold text-[#1D2433]">
                  {data.auto_rate_percent != null ? `${data.auto_rate_percent}%` : "—"}
                </p>
                <p className="text-[12px] text-[rgba(29,36,51,0.6)]">of completed + failed</p>
              </div>
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
                <p className="text-[12px] uppercase tracking-wider text-[rgba(29,36,51,0.55)]">Throughput</p>
                <p className="font-poppins text-[28px] font-semibold text-[#1D2433]">
                  {data.throughput.claims_per_hour} <span className="text-[14px] font-normal text-[rgba(29,36,51,0.6)]">claims/hr</span>
                </p>
                <p className="text-[12px] text-[rgba(29,36,51,0.6)]">over last {data.throughput.window_hours.toFixed(1)}h</p>
              </div>
              <div className="rounded-xl border border-[#E5E7EB] bg-white p-5">
                <p className="text-[12px] uppercase tracking-wider text-[rgba(29,36,51,0.55)]">Window</p>
                <p className="font-poppins text-[28px] font-semibold text-[#1D2433]">{WINDOW_LABEL[data.window]}</p>
                <p className="text-[12px] text-[rgba(29,36,51,0.6)]">
                  {data.since ? `from ${new Date(data.since).toLocaleString()}` : "all time"}
                </p>
              </div>
            </section>

            {/* Recent batches table */}
            <section className="rounded-xl border border-[#E5E7EB] bg-white overflow-hidden">
              <header className="flex items-center justify-between border-b border-[#F1F2F4] px-5 py-3">
                <h2 className="font-poppins text-[16px] font-medium text-[#1D2433]">
                  Recent batches{" "}
                  <span className="text-[rgba(29,36,51,0.5)]">({data.recent_batches.length})</span>
                </h2>
                <span className="text-[12px] text-[rgba(29,36,51,0.6)]">Click a row to drill in</span>
              </header>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-[#F7F8FA] text-[12px] uppercase tracking-wider text-[rgba(29,36,51,0.55)]">
                    <tr>
                      <th className="text-left px-5 py-2 font-medium">Submitted</th>
                      <th className="text-left px-5 py-2 font-medium">Batch ID</th>
                      <th className="text-right px-3 py-2 font-medium">Total</th>
                      <th className="text-right px-3 py-2 font-medium">In flight</th>
                      <th className="text-right px-3 py-2 font-medium">Needs review</th>
                      <th className="text-right px-3 py-2 font-medium">Auto</th>
                      <th className="text-right px-3 py-2 font-medium">Failed</th>
                      <th className="text-right px-5 py-2 font-medium">Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent_batches.length === 0 && (
                      <tr>
                        <td colSpan={8} className="text-center px-5 py-10 text-[rgba(29,36,51,0.55)]">
                          No batches in this window.
                        </td>
                      </tr>
                    )}
                    {data.recent_batches.map((b) => {
                      const terminal = b.completed + b.failed + b.needs_review;
                      const progress = b.total ? Math.round((terminal / b.total) * 100) : 0;
                      const isHighlighted = highlightBatchId === b.batch_id;
                      return (
                        <tr
                          key={b.batch_id}
                          onClick={() => router.push(`/batches/${b.batch_id}`)}
                          className={`border-t border-[#F1F2F4] cursor-pointer transition-colors ${
                            isHighlighted
                              ? "bg-blue-50 ring-2 ring-inset ring-blue-300"
                              : "hover:bg-[#F7F8FA]"
                          }`}
                        >
                          <td className="px-5 py-3 text-[#1D2433]">
                            <div className="font-medium flex items-center gap-2">
                              {timeAgo(b.submitted_at)}
                              {isHighlighted && (
                                <span className="inline-flex items-center rounded-full bg-blue-600 text-white px-2 py-0.5 text-[10px] font-medium">
                                  Just submitted
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[rgba(29,36,51,0.5)]">
                              {b.submitted_at ? new Date(b.submitted_at).toLocaleString() : ""}
                            </div>
                          </td>
                          <td className="px-5 py-3 text-[12px] font-mono text-[rgba(29,36,51,0.7)] truncate max-w-[200px]">
                            {b.batch_id}
                          </td>
                          <td className="px-3 py-3 text-right font-medium text-[#1D2433]">{b.total}</td>
                          <td className="px-3 py-3 text-right">
                            <Badge tone="bg-blue-100 text-blue-700" hideIfZero value={b.in_flight} />
                          </td>
                          <td className="px-3 py-3 text-right">
                            <Badge tone="bg-amber-100 text-amber-800" hideIfZero value={b.needs_review} />
                          </td>
                          <td className="px-3 py-3 text-right">
                            <Badge tone="bg-green-100 text-green-700" hideIfZero value={b.completed} />
                          </td>
                          <td className="px-3 py-3 text-right">
                            <Badge tone="bg-red-100 text-red-700" hideIfZero value={b.failed} />
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2 justify-end">
                              <div className="w-20 h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#2F5FED] transition-all"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <span className="text-[12px] text-[rgba(29,36,51,0.6)] w-10 text-right">{progress}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function Badge({ value, tone, hideIfZero }: { value: number; tone: string; hideIfZero?: boolean }) {
  if (hideIfZero && value === 0) {
    return <span className="text-[rgba(29,36,51,0.3)]">—</span>;
  }
  return (
    <span className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[12px] font-medium ${tone}`}>
      {value}
    </span>
  );
}
