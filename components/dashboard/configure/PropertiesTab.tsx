"use client";

import {
  Building2,
  Check,
  FileSpreadsheet,
  Loader2,
  Pencil,
  RotateCcw,
  UploadCloud,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type UploadState = "idle" | "uploading" | "success" | "error";

interface Property {
  id: number;
  address: string;
  type: string;
  category: string;
  district: string;
  area: number;
  bedrooms: number;
  condition: string;
  exclusive: string;
  price: number;
  price_per_m2: number;
  note: string | null;
}

interface EditState {
  address: string;
  type: string;
  category: string;
  district: string;
  area: string;
  bedrooms: string;
  condition: string;
  exclusive: string;
  price: string;
  price_per_m2: string;
  note: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ACCEPTED = ".xlsx,.xls,.csv";

function toEditState(p: Property): EditState {
  return {
    address: p.address,
    type: p.type,
    category: p.category,
    district: p.district,
    area: String(p.area),
    bedrooms: String(p.bedrooms),
    condition: p.condition,
    exclusive: p.exclusive,
    price: String(p.price),
    price_per_m2: String(p.price_per_m2),
    note: p.note ?? "",
  };
}

function isDirty(original: Property, edit: EditState): boolean {
  return (
    edit.address !== original.address ||
    edit.type !== original.type ||
    edit.category !== original.category ||
    edit.district !== original.district ||
    Number(edit.area) !== original.area ||
    Number(edit.bedrooms) !== original.bedrooms ||
    edit.condition !== original.condition ||
    edit.exclusive !== original.exclusive ||
    Number(edit.price) !== original.price ||
    Number(edit.price_per_m2) !== original.price_per_m2 ||
    edit.note !== (original.note ?? "")
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TextCell({
  value,
  onChange,
  placeholder,
  width = "w-24",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  width?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`${width} rounded-lg border border-dash-border bg-transparent px-2 py-1.5 text-sm text-dash-text placeholder-dash-text-muted focus:border-dash-accent/50 focus:outline-none`}
    />
  );
}

function NumCell({
  value,
  onChange,
  step = 1,
  width = "w-20",
}: {
  value: string;
  onChange: (v: string) => void;
  step?: number;
  width?: string;
}) {
  return (
    <input
      type="number"
      min={0}
      step={step}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${width} rounded-lg border border-dash-border bg-transparent px-2 py-1.5 text-sm text-dash-text focus:border-dash-accent/50 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
    />
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PropertiesTab() {
  const t = useTranslations("dashboard.configure.properties");

  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [uploadError, setUploadError] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Table state
  const [properties, setProperties] = useState<Property[]>([]);
  const [tableLoading, setTableLoading] = useState(true);
  const [tableError, setTableError] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<number, EditState>>({});
  const [saving, setSaving] = useState<Record<number, boolean>>({});
  const [saved, setSaved] = useState<Record<number, boolean>>({});
  const [saveError, setSaveError] = useState<Record<number, string>>({});

  // ── Fetch ────────────────────────────────────────────────────────────────────

  const fetchProperties = useCallback(async () => {
    setTableLoading(true);
    setTableError(null);
    try {
      const res = await fetch("/api/dashboard/configure/properties");
      if (!res.ok) throw new Error();
      const json = await res.json();
      const data: Property[] = json.data ?? [];
      setProperties(data);
      setEdits(Object.fromEntries(data.map((p) => [p.id, toEditState(p)])));
    } catch {
      setTableError("Could not load properties. Please try again.");
    } finally {
      setTableLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  // ── Upload ───────────────────────────────────────────────────────────────────

  const pickFile = (f: File) => {
    setUploadState("idle");
    setUploadError("");
    setFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) pickFile(f);
  };

  const upload = async () => {
    if (!file || uploadState === "uploading") return;
    setUploadState("uploading");
    setUploadError("");
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/dashboard/configure/properties", {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setUploadError(data.error ?? "Upload failed");
        setUploadState("error");
        return;
      }
      setUploadState("success");
      setFile(null);
      fetchProperties();
    } catch {
      setUploadError("Network error. Please try again.");
      setUploadState("error");
    }
  };

  // ── Inline edit ──────────────────────────────────────────────────────────────

  function handleChange(id: number, field: keyof EditState, value: string) {
    setSaved((prev) => ({ ...prev, [id]: false }));
    setSaveError((prev) => ({ ...prev, [id]: "" }));
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  }

  function handleReset(id: number) {
    const original = properties.find((p) => p.id === id);
    if (!original) return;
    setEdits((prev) => ({ ...prev, [id]: toEditState(original) }));
    setSaved((prev) => ({ ...prev, [id]: false }));
    setSaveError((prev) => ({ ...prev, [id]: "" }));
  }

  async function handleSave(id: number) {
    const edit = edits[id];
    if (!edit) return;
    setSaving((prev) => ({ ...prev, [id]: true }));
    setSaveError((prev) => ({ ...prev, [id]: "" }));
    try {
      const res = await fetch("/api/dashboard/configure/properties", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([
          {
            id,
            address: edit.address,
            type: edit.type,
            category: edit.category,
            district: edit.district,
            area: Number(edit.area),
            bedrooms: Number(edit.bedrooms),
            condition: edit.condition,
            exclusive: edit.exclusive,
            price: Number(edit.price),
            price_per_m2: Number(edit.price_per_m2),
            note: edit.note || null,
          },
        ]),
      });
      if (!res.ok) throw new Error();
      setProperties((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                address: edit.address,
                type: edit.type,
                category: edit.category,
                district: edit.district,
                area: Number(edit.area),
                bedrooms: Number(edit.bedrooms),
                condition: edit.condition,
                exclusive: edit.exclusive,
                price: Number(edit.price),
                price_per_m2: Number(edit.price_per_m2),
                note: edit.note || null,
              }
            : p,
        ),
      );
      setSaved((prev) => ({ ...prev, [id]: true }));
      setTimeout(() => setSaved((prev) => ({ ...prev, [id]: false })), 2000);
    } catch {
      setSaveError((prev) => ({ ...prev, [id]: "Save failed. Try again." }));
    } finally {
      setSaving((prev) => ({ ...prev, [id]: false }));
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Upload card */}
      <div className="dash-card p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-dash-accent-muted">
            <Building2 className="h-4 w-4 text-dash-accent" />
          </div>
          <div>
            <h3 className="font-Helvetica-Neue font-semibold text-dash-text text-sm">
              {t("title")}
            </h3>
            <p className="text-dash-text-muted text-xs">{t("subtitle")}</p>
          </div>
        </div>

        <button
          type="button"
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 transition-colors ${
            dragging
              ? "border-dash-accent bg-dash-accent-muted/30"
              : "border-dash-border bg-dash-bg hover:border-dash-accent/40 hover:bg-dash-accent-muted/10"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED}
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) pickFile(f); }}
          />
          <UploadCloud className={`h-10 w-10 ${dragging ? "text-dash-accent" : "text-dash-text-muted"}`} />
          <div className="text-center">
            <p className="font-medium text-dash-text text-sm">
              Drop your Excel file here or click to browse
            </p>
            <p className="mt-1 text-dash-text-muted text-xs">Supports .xlsx, .xls, .csv</p>
          </div>
        </button>

        {file && (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-dash-border bg-dash-bg px-4 py-3">
            <FileSpreadsheet className="h-5 w-5 shrink-0 text-dash-accent" />
            <span className="flex-1 truncate text-dash-text text-sm">{file.name}</span>
            <span className="text-dash-text-muted text-xs">{(file.size / 1024).toFixed(0)} KB</span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setFile(null); setUploadState("idle"); }}
              className="text-dash-text-muted hover:text-dash-danger"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {uploadState === "success" && (
          <p className="mt-3 text-center text-dash-success text-sm">Properties uploaded successfully.</p>
        )}
        {uploadState === "error" && (
          <p className="mt-3 text-center text-dash-danger text-sm">{uploadError}</p>
        )}

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={upload}
            disabled={!file || uploadState === "uploading"}
            className="flex items-center gap-2 rounded-xl bg-dash-accent px-5 py-2.5 font-semibold text-sm text-white transition-all hover:bg-dash-accent-hover disabled:opacity-50"
          >
            {uploadState === "uploading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
            {uploadState === "uploading" ? "Uploading…" : "Upload Properties"}
          </button>
        </div>
      </div>

      {/* Properties table */}
      <div className="dash-card overflow-hidden">
        <div className="border-dash-border border-b px-5 py-4">
          <h3 className="font-Helvetica-Neue font-semibold text-dash-text text-sm">Current Listings</h3>
          <p className="mt-0.5 text-dash-text-muted text-xs">All fields are editable. Save each row individually.</p>
        </div>

        {tableError ? (
          <div className="px-5 py-10 text-center text-dash-text-muted text-sm">{tableError}</div>
        ) : tableLoading ? (
          <div className="space-y-0">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
                key={i}
                className="h-14 animate-pulse border-dash-border border-b bg-dash-surface-secondary/40 last:border-0"
              />
            ))}
          </div>
        ) : properties.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <Building2 className="mx-auto mb-3 h-7 w-7 text-dash-text-muted" />
            <p className="text-dash-text-muted text-sm">No properties yet. Upload a file above.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-340">
              <thead>
                <tr className="border-dash-border border-b">
                  {["#", "Address", "Type", "Category", "District", "Area", "Rooms", "Condition", "Excl.", "Price", "₾/m²", "Note", ""].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-3 text-left font-medium text-dash-text-muted text-xs uppercase tracking-wider first:pl-5 last:pr-5"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {properties.map((property, idx) => {
                  const edit = edits[property.id];
                  if (!edit) return null;
                  const dirty = isDirty(property, edit);
                  const isSaving = saving[property.id];
                  const isSaved = saved[property.id];
                  const rowError = saveError[property.id];

                  return (
                    <tr
                      key={property.id}
                      className="border-dash-border border-b transition-colors last:border-0 hover:bg-dash-surface-hover"
                    >
                      {/* # */}
                      <td className="py-3 pr-3 pl-5 text-xs font-medium tabular-nums text-center text-dash-text-muted">
                        {idx + 1}
                      </td>

                      {/* Address */}
                      <td className="px-3 py-3">
                        <TextCell value={edit.address} onChange={(v) => handleChange(property.id, "address", v)} width="w-36" />
                      </td>

                      {/* Type */}
                      <td className="px-3 py-3">
                        <TextCell value={edit.type} onChange={(v) => handleChange(property.id, "type", v)} width="w-28" />
                      </td>

                      {/* Category */}
                      <td className="px-3 py-3">
                        <TextCell value={edit.category} onChange={(v) => handleChange(property.id, "category", v)} width="w-20" />
                      </td>

                      {/* District */}
                      <td className="px-3 py-3">
                        <TextCell value={edit.district} onChange={(v) => handleChange(property.id, "district", v)} width="w-20" />
                      </td>

                      {/* Area */}
                      <td className="px-3 py-3">
                        <NumCell value={edit.area} onChange={(v) => handleChange(property.id, "area", v)} width="w-16" />
                      </td>

                      {/* Bedrooms */}
                      <td className="px-3 py-3">
                        <NumCell value={edit.bedrooms} onChange={(v) => handleChange(property.id, "bedrooms", v)} width="w-14" />
                      </td>

                      {/* Condition */}
                      <td className="px-3 py-3">
                        <TextCell value={edit.condition} onChange={(v) => handleChange(property.id, "condition", v)} width="w-28" />
                      </td>

                      {/* Exclusive */}
                      <td className="px-3 py-3">
                        <TextCell value={edit.exclusive} onChange={(v) => handleChange(property.id, "exclusive", v)} width="w-14" />
                      </td>

                      {/* Price */}
                      <td className="px-3 py-3">
                        <NumCell value={edit.price} onChange={(v) => handleChange(property.id, "price", v)} width="w-24" />
                      </td>

                      {/* Price/m² */}
                      <td className="px-3 py-3">
                        <NumCell value={edit.price_per_m2} onChange={(v) => handleChange(property.id, "price_per_m2", v)} step={0.01} width="w-20" />
                      </td>

                      {/* Note */}
                      <td className="px-3 py-3">
                        <div>
                          <TextCell value={edit.note} onChange={(v) => handleChange(property.id, "note", v)} placeholder="Add note…" width="w-32" />
                          {rowError && <div className="mt-0.5 text-[10px] text-red-500">{rowError}</div>}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 pr-5 pl-3">
                        {isSaved ? (
                          <span className="flex items-center gap-1 font-medium text-[11px] text-dash-accent">
                            <Check className="h-3.5 w-3.5" />
                            Saved
                          </span>
                        ) : dirty ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleSave(property.id)}
                              disabled={isSaving}
                              title="Save"
                              className="flex h-7 w-7 items-center justify-center rounded-lg bg-dash-accent text-white transition-opacity hover:opacity-80 disabled:opacity-50"
                            >
                              {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Pencil className="h-3.5 w-3.5" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReset(property.id)}
                              disabled={isSaving}
                              title="Discard"
                              className="flex h-7 w-7 items-center justify-center rounded-lg border border-dash-border text-dash-text-muted transition-colors hover:bg-dash-surface-hover hover:text-dash-text disabled:opacity-50"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-dash-text-muted">—</span>
                        )}
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
