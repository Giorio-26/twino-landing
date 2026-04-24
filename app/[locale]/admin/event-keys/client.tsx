"use client";

import { Check, Copy, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface EventCompany {
  id: number;
  name: string;
}

interface EventKey {
  id: number;
  key: string;
  role: "organizer" | "company";
  company_id: number | null;
  expires_at: string;
  created_at: string;
}

interface EventKeysClientProps {
  companies: EventCompany[];
  initialKeys: EventKey[];
}

export default function EventKeysClient({ companies, initialKeys }: EventKeysClientProps) {
  const [keys, setKeys] = useState<EventKey[]>(initialKeys);

  const [role, setRole] = useState<"organizer" | "company">("company");
  const [companyId, setCompanyId] = useState<string>("");
  const [expiresInDays, setExpiresInDays] = useState("30");
  const [generatingKey, setGeneratingKey] = useState(false);
  const [keyError, setKeyError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  async function handleGenerateKey(e: React.FormEvent) {
    e.preventDefault();
    setKeyError(null);

    if (role === "company" && !companyId) {
      setKeyError("Please select a company.");
      return;
    }

    setGeneratingKey(true);
    try {
      const res = await fetch("/api/admin/generate-event-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          companyId: role === "company" ? Number(companyId) : undefined,
          expiresInDays: Number(expiresInDays),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setKeyError(json.error ?? "Failed to generate key.");
        return;
      }
      const newKey: EventKey = {
        id: Date.now(),
        key: json.key,
        role: json.role,
        company_id: role === "company" ? Number(companyId) : null,
        expires_at: json.expiresAt,
        created_at: new Date().toISOString(),
      };
      setKeys((prev) => [newKey, ...prev]);
    } catch {
      setKeyError("Something went wrong.");
    } finally {
      setGeneratingKey(false);
    }
  }

  async function copyKey(keyId: number, keyValue: string) {
    await navigator.clipboard.writeText(keyValue);
    setCopiedId(keyId);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function deleteKey(keyId: number) {
    if (!confirm("Delete this access key? This cannot be undone.")) return;
    await fetch("/api/admin/generate-event-key", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: keyId }),
    });
    setKeys((prev) => prev.filter((k) => k.id !== keyId));
  }

  function companyName(id: number | null): string {
    if (!id) return "—";
    return companies.find((c) => c.id === id)?.name ?? `Company #${id}`;
  }

  return (
    <div className="space-y-8 p-4">
      <h2 className="font-bold text-2xl">Event Access Keys</h2>

      {/* Generate key */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 font-semibold text-lg">Generate Access Key</h3>
        <form onSubmit={handleGenerateKey} className="space-y-4">
          {keyError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-600 text-sm">
              {keyError}
            </div>
          )}

          <div className="flex gap-4">
            {(["organizer", "company"] as const).map((r) => (
              <label key={r} className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  value={r}
                  checked={role === r}
                  onChange={() => setRole(r)}
                  className="accent-blue-600"
                />
                <span className="text-sm capitalize">{r}</span>
              </label>
            ))}
          </div>

          {role === "company" && (
            <div>
              <label htmlFor="key-company" className="mb-1 block font-medium text-gray-700 text-sm">
                Company
              </label>
              <select
                id="key-company"
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a company…</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="key-expires" className="mb-1 block font-medium text-gray-700 text-sm">
              Valid for (days)
            </label>
            <input
              id="key-expires"
              type="number"
              min="1"
              max="365"
              value={expiresInDays}
              onChange={(e) => setExpiresInDays(e.target.value)}
              className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={generatingKey}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {generatingKey ? "Generating…" : "Generate Key"}
          </button>
        </form>
      </div>

      {/* Keys table */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <h3 className="border-gray-200 border-b px-6 py-4 font-semibold text-lg">Generated Keys</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-gray-200 border-b text-left">
              <th className="px-4 py-3 font-semibold text-gray-600">Key</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Role</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Company</th>
              <th className="px-4 py-3 font-semibold text-gray-600">Expires</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {keys.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  No event keys generated yet.
                </td>
              </tr>
            ) : (
              keys.map((k) => (
                <tr key={k.id} className="border-gray-100 border-b last:border-0">
                  <td className="px-4 py-3">
                    <span className="font-mono font-semibold tracking-widest">{k.key}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 font-medium text-xs capitalize ${k.role === "organizer" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                      {k.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{companyName(k.company_id)}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {new Date(k.expires_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => copyKey(k.id, k.key)}
                        className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 py-1 text-gray-500 text-xs hover:bg-gray-50"
                      >
                        {copiedId === k.id ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                        {copiedId === k.id ? "Copied" : "Copy"}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteKey(k.id)}
                        className="flex items-center justify-center rounded-lg border border-red-200 p-1 text-red-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
