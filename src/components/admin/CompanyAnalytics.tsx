"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, RefreshCw, Building2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  adminService,
  AnalyticsWindow,
  CompanyAnalyticsRow,
} from "@/services/admin.service";

const WINDOWS: { value: AnalyticsWindow; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "Last 7 days" },
  { value: "all", label: "All time" },
];

function pct(n?: number | null): string {
  return n === null || n === undefined ? "—" : `${n}%`;
}

export function CompanyAnalytics() {
  const [window, setWindow] = useState<AnalyticsWindow>("all");

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["admin", "company-analytics", window],
    queryFn: () => adminService.getCompanyAnalytics(window),
    refetchInterval: 30_000,
  });

  const totals = data?.totals;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-600" /> Company Analytics
        </h2>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
            {WINDOWS.map((w) => (
              <button
                key={w.value}
                onClick={() => setWindow(w.value)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                  window === w.value
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {w.label}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Totals strip */}
      {totals && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard label="Total claims" value={totals.total} tone="text-gray-900" />
          <StatCard label="Completed" value={totals.completed} tone="text-green-700" />
          <StatCard label="Needs review" value={totals.needs_review} tone="text-amber-700" />
          <StatCard label="Failed" value={totals.failed} tone="text-red-700" />
          <StatCard label="In flight" value={totals.in_flight} tone="text-blue-700" />
          <StatCard label="Auto-rate" value={pct(totals.auto_rate_percent)} tone="text-gray-900" />
        </div>
      )}

      {isLoading && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600">
          Loading analytics…
        </div>
      )}

      {isError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          Failed to load analytics: {(error as Error)?.message ?? "unknown error"}
        </div>
      )}

      {data && !isLoading && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-gray-500">
                <th className="px-4 py-3 font-medium">Company</th>
                <th className="px-4 py-3 font-medium text-right">Total</th>
                <th className="px-4 py-3 font-medium text-right">Completed</th>
                <th className="px-4 py-3 font-medium text-right">Needs review</th>
                <th className="px-4 py-3 font-medium text-right">Failed</th>
                <th className="px-4 py-3 font-medium text-right">In flight</th>
                <th className="px-4 py-3 font-medium text-right">Auto-rate</th>
              </tr>
            </thead>
            <tbody>
              {data.companies.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    No companies yet.
                  </td>
                </tr>
              )}
              {data.companies.map((row: CompanyAnalyticsRow) => (
                <tr key={row.company_id} className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{row.name}</span>
                      {row.status !== "active" && (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">
                          {row.status}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">{row.total}</td>
                  <td className="px-4 py-3 text-right text-green-700">{row.completed}</td>
                  <td className="px-4 py-3 text-right text-amber-700">{row.needs_review}</td>
                  <td className="px-4 py-3 text-right text-red-700">{row.failed}</td>
                  <td className="px-4 py-3 text-right text-blue-700">{row.in_flight}</td>
                  <td className="px-4 py-3 text-right text-gray-900">{pct(row.auto_rate_percent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3">
      <p className="text-[11px] uppercase tracking-wider text-gray-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${tone}`}>{value}</p>
    </div>
  );
}
