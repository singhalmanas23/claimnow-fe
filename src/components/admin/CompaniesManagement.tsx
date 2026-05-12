"use client";

import React, { useState } from "react";
import { Plus, RefreshCw, KeyRound, Building2, ChevronRight, AlertCircle, Copy, Check } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/Button";
import { adminService, Company, ApiKey, ApiKeyCreated } from "@/services/admin.service";

function ago(iso?: string | null): string {
  if (!iso) return "—";
  const sec = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (sec < 60) return `${Math.floor(sec)}s ago`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return `${Math.floor(sec / 86400)}d ago`;
}

export function CompaniesManagement() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Company | null>(null);
  const [showCreateCompany, setShowCreateCompany] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newCompanySlug, setNewCompanySlug] = useState("");
  const [newCompanyEmail, setNewCompanyEmail] = useState("");
  const [createCompanyError, setCreateCompanyError] = useState("");

  const { data: companies, isLoading, refetch } = useQuery({
    queryKey: ["admin", "companies"],
    queryFn: () => adminService.listCompanies(),
  });

  const createCompany = useMutation({
    mutationFn: (payload: { name: string; slug: string; contact_email?: string | null }) =>
      adminService.createCompany(payload),
    onSuccess: (created) => {
      qc.invalidateQueries({ queryKey: ["admin", "companies"] });
      setShowCreateCompany(false);
      setNewCompanyName("");
      setNewCompanySlug("");
      setNewCompanyEmail("");
      setCreateCompanyError("");
      setSelected(created);
    },
    onError: (err: unknown) => {
      const msg =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail || "Create failed"
          : "Create failed";
      setCreateCompanyError(msg);
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Building2 className="h-5 w-5" /> Companies & API Keys
        </h2>
        <div className="flex gap-2">
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
          <Button
            size="sm"
            onClick={() => setShowCreateCompany(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" /> New company
          </Button>
        </div>
      </div>

      {showCreateCompany && (
        <div className="rounded-lg border border-blue-200 bg-blue-50/30 p-4 space-y-3">
          <h3 className="text-sm font-medium text-gray-900">Create a new tenant</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Display name</label>
              <input
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
                placeholder="Acme Insurance"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Slug (URL-safe)</label>
              <input
                value={newCompanySlug}
                onChange={(e) => setNewCompanySlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
                placeholder="acme"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Contact email (optional)</label>
              <input
                value={newCompanyEmail}
                onChange={(e) => setNewCompanyEmail(e.target.value)}
                placeholder="tech@acme.example"
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          {createCompanyError && (
            <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              {createCompanyError}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setShowCreateCompany(false);
                setCreateCompanyError("");
              }}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() =>
                createCompany.mutate({
                  name: newCompanyName.trim(),
                  slug: newCompanySlug.trim(),
                  contact_email: newCompanyEmail.trim() || null,
                })
              }
              disabled={
                createCompany.isPending || !newCompanyName.trim() || !newCompanySlug.trim()
              }
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {createCompany.isPending ? "Creating…" : "Create"}
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Left — companies list */}
        <div className="lg:col-span-2 rounded-lg border border-gray-200 bg-white overflow-hidden">
          {isLoading && !companies ? (
            <div className="flex items-center justify-center py-12 text-gray-400">
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>
          ) : (companies || []).length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-gray-500">
              No companies yet. Create one to get started.
            </div>
          ) : (
            <ul>
              {(companies || []).map((c) => {
                const isSel = selected?.company_id === c.company_id;
                return (
                  <li
                    key={c.company_id}
                    onClick={() => setSelected(c)}
                    className={`flex items-center justify-between px-5 py-3 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0 ${
                      isSel ? "bg-blue-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900 truncate">{c.name}</div>
                      <div className="text-xs text-gray-500 font-mono truncate">
                        {c.slug} · id={c.company_id} · {c.status}
                      </div>
                    </div>
                    <ChevronRight className={`h-4 w-4 flex-shrink-0 ${isSel ? "text-blue-600" : "text-gray-300"}`} />
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Right — selected company's API keys */}
        <div className="lg:col-span-3">
          {selected ? (
            <CompanyApiKeysPanel company={selected} />
          ) : (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-16 text-center text-sm text-gray-500">
              Select a company on the left to manage its API keys.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Per-company panel
// -----------------------------------------------------------------------------
function CompanyApiKeysPanel({ company }: { company: Company }) {
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<ApiKeyCreated | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: keys, isLoading } = useQuery({
    queryKey: ["admin", "api-keys", company.company_id],
    queryFn: () => adminService.listApiKeys(company.company_id),
  });

  const create = useMutation({
    mutationFn: (name: string) => adminService.createApiKey(company.company_id, name),
    onSuccess: (key) => {
      qc.invalidateQueries({ queryKey: ["admin", "api-keys", company.company_id] });
      setCreatedKey(key);
      setNewKeyName("");
      setShowCreate(false);
    },
  });

  const revoke = useMutation({
    mutationFn: (apiKeyId: number) => adminService.revokeApiKey(company.company_id, apiKeyId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "api-keys", company.company_id] });
    },
  });

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* swallow */
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
        <div>
          <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
            <KeyRound className="h-4 w-4" /> API keys · {company.name}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">company_id {company.company_id}</p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            setShowCreate(true);
            setCreatedKey(null);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Plus className="h-4 w-4 mr-1" /> Mint key
        </Button>
      </div>

      {/* Just-minted key — one-time display */}
      {createdKey && (
        <div className="m-4 rounded-lg border-2 border-amber-300 bg-amber-50 p-4 space-y-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-amber-700 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900">
                Copy this key now — it can't be retrieved later.
              </p>
              <p className="text-xs text-amber-800 mt-1">{createdKey.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white border border-amber-200 rounded p-2">
            <code className="flex-1 text-xs font-mono break-all text-gray-900">{createdKey.api_key}</code>
            <button
              onClick={() => copy(createdKey.api_key)}
              className="px-2 py-1 rounded text-xs font-medium bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-1"
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <button
            onClick={() => setCreatedKey(null)}
            className="text-xs text-amber-700 hover:text-amber-900 underline"
          >
            I've saved it — dismiss
          </button>
        </div>
      )}

      {/* Create form */}
      {showCreate && (
        <div className="m-4 p-3 rounded-lg border border-blue-200 bg-blue-50/30 space-y-2">
          <label className="block text-xs text-gray-600">Label (for your reference)</label>
          <input
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="Production server, Staging, CI, etc."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => create.mutate(newKeyName.trim())}
              disabled={create.isPending || !newKeyName.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {create.isPending ? "Minting…" : "Mint key"}
            </Button>
          </div>
        </div>
      )}

      {/* Keys table */}
      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-10 text-gray-400">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        ) : (keys || []).length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-gray-500">
            No API keys yet. Mint one to enable B2B integration.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
              <tr>
                <th className="text-left px-5 py-2 font-medium">Name</th>
                <th className="text-left px-3 py-2 font-medium">Key prefix</th>
                <th className="text-left px-3 py-2 font-medium">Status</th>
                <th className="text-left px-3 py-2 font-medium">Last used</th>
                <th className="text-left px-3 py-2 font-medium">Created</th>
                <th className="text-right px-5 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(keys || []).map((k: ApiKey) => (
                <tr key={k.api_key_id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-5 py-2.5 text-gray-900">{k.name}</td>
                  <td className="px-3 py-2.5 font-mono text-xs text-gray-700">{k.key_prefix}…</td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        k.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {k.status}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-xs text-gray-600">{ago(k.last_used_at)}</td>
                  <td className="px-3 py-2.5 text-xs text-gray-600">{ago(k.created_at)}</td>
                  <td className="px-5 py-2.5 text-right">
                    {k.status === "active" ? (
                      <button
                        onClick={() => {
                          if (confirm(`Revoke "${k.name}"? It will stop working immediately.`)) {
                            revoke.mutate(k.api_key_id);
                          }
                        }}
                        className="text-xs text-red-600 hover:text-red-800 underline"
                      >
                        Revoke
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
