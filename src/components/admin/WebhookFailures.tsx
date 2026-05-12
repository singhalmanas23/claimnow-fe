"use client";

import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, AlertTriangle, RotateCcw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { adminService, WebhookFailure } from "@/services/admin.service";

function ago(iso?: string | null): string {
  if (!iso) return "—";
  const sec = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (sec < 60) return `${Math.floor(sec)}s ago`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
}

export function WebhookFailures() {
  const qc = useQueryClient();
  const [onlyUndelivered, setOnlyUndelivered] = useState(true);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin", "webhook-failures", onlyUndelivered],
    queryFn: () => adminService.listWebhookFailures({ only_undelivered: onlyUndelivered }),
    refetchInterval: 15_000,
  });

  const redeliver = useMutation({
    mutationFn: (batchId: string) => adminService.redeliverWebhook(batchId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "webhook-failures"] }),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-600" /> Webhook Delivery Queue
        </h2>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyUndelivered}
              onChange={(e) => setOnlyUndelivered(e.target.checked)}
              className="rounded"
            />
            Only undelivered
          </label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <p className="text-sm text-gray-600">
        Batches with a webhook configured. Use this view to monitor delivery and manually
        re-fire a webhook after fixing a customer-side outage (resets attempts counter).
        Auto-refresh every 15s.
      </p>

      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        {isLoading && !data ? (
          <div className="flex items-center justify-center py-12 text-gray-400">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        ) : (data || []).length === 0 ? (
          <div className="px-5 py-14 text-center text-sm text-gray-500">
            {onlyUndelivered ? (
              <>
                <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                No undelivered webhooks. All caught up.
              </>
            ) : (
              <>No webhook-configured batches.</>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="text-left px-5 py-2 font-medium">Batch / Company</th>
                  <th className="text-left px-3 py-2 font-medium">Webhook URL</th>
                  <th className="text-right px-3 py-2 font-medium">Attempts</th>
                  <th className="text-left px-3 py-2 font-medium">Last status</th>
                  <th className="text-left px-3 py-2 font-medium">Last attempt</th>
                  <th className="text-right px-5 py-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {(data || []).map((row: WebhookFailure) => {
                  const isDelivered = !!row.delivered_at;
                  return (
                    <tr key={row.batch_id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-5 py-3 align-top">
                        <div className="font-mono text-xs text-gray-700 break-all">{row.batch_id}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          company={row.company_id} · {row.source_type} · {ago(row.submitted_at)}
                        </div>
                      </td>
                      <td className="px-3 py-3 align-top">
                        <div className="text-xs font-mono text-gray-700 break-all max-w-[260px]">{row.webhook_url}</div>
                      </td>
                      <td className="px-3 py-3 align-top text-right">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          row.delivery_attempts === 0 ? "bg-gray-100 text-gray-600"
                          : row.delivery_attempts < 6 ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-700"
                        }`}>
                          {row.delivery_attempts}
                        </span>
                      </td>
                      <td className="px-3 py-3 align-top">
                        {isDelivered ? (
                          <span className="inline-flex items-center gap-1 text-xs text-green-700">
                            <CheckCircle2 className="h-3 w-3" /> {row.last_delivery_status_code} delivered
                          </span>
                        ) : row.last_delivery_status_code ? (
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium bg-red-100 text-red-700">
                            HTTP {row.last_delivery_status_code}
                          </span>
                        ) : row.last_delivery_error ? (
                          <span className="text-xs text-red-700 break-words max-w-[220px] inline-block">
                            {row.last_delivery_error.slice(0, 80)}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">never attempted</span>
                        )}
                      </td>
                      <td className="px-3 py-3 align-top text-xs text-gray-600">
                        {ago(row.last_attempt_at)}
                      </td>
                      <td className="px-5 py-3 align-top text-right">
                        <button
                          onClick={() => {
                            if (
                              confirm(
                                `Redeliver webhook for batch ${row.batch_id.slice(0, 8)}…?\n\nResets attempts to 0 and re-fires the POST to:\n${row.webhook_url}`
                              )
                            ) {
                              redeliver.mutate(row.batch_id);
                            }
                          }}
                          disabled={redeliver.isPending}
                          className="inline-flex items-center gap-1 text-xs rounded-full bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 font-medium disabled:opacity-50"
                        >
                          <RotateCcw className="h-3 w-3" />
                          {isDelivered ? "Redeliver" : "Retry"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
