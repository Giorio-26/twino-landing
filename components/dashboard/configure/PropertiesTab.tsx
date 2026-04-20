"use client";

import { Building2, FileSpreadsheet, Loader2, UploadCloud, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";

type UploadState = "idle" | "uploading" | "success" | "error";

const ACCEPTED = ".xlsx,.xls,.csv";

export default function PropertiesTab() {
  const t = useTranslations("dashboard.configure.properties");

  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<UploadState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const pickFile = (f: File) => {
    setState("idle");
    setErrorMsg("");
    setFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) pickFile(f);
  };

  const upload = async () => {
    if (!file || state === "uploading") return;
    setState("uploading");
    setErrorMsg("");

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/dashboard/configure/properties", {
        method: "POST",
        body: form,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(data.error ?? "Upload failed");
        setState("error");
        return;
      }
      setState("success");
      setFile(null);
    } catch {
      setErrorMsg("Network error. Please try again.");
      setState("error");
    }
  };

  return (
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

      {/* Dropzone */}
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
          <p className="mt-1 text-dash-text-muted text-xs">
            Supports .xlsx, .xls, .csv
          </p>
        </div>
      </button>

      {/* Selected file */}
      {file && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-dash-border bg-dash-bg px-4 py-3">
          <FileSpreadsheet className="h-5 w-5 shrink-0 text-dash-accent" />
          <span className="flex-1 truncate text-dash-text text-sm">{file.name}</span>
          <span className="text-dash-text-muted text-xs">
            {(file.size / 1024).toFixed(0)} KB
          </span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setFile(null); setState("idle"); }}
            className="text-dash-text-muted hover:text-dash-danger"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Feedback */}
      {state === "success" && (
        <p className="mt-3 text-center text-dash-success text-sm">
          Properties uploaded successfully.
        </p>
      )}
      {state === "error" && (
        <p className="mt-3 text-center text-dash-danger text-sm">{errorMsg}</p>
      )}

      {/* Upload button */}
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={upload}
          disabled={!file || state === "uploading"}
          className="flex items-center gap-2 rounded-xl bg-dash-accent px-5 py-2.5 font-semibold text-sm text-white transition-all hover:bg-dash-accent-hover disabled:opacity-50"
        >
          {state === "uploading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UploadCloud className="h-4 w-4" />
          )}
          {state === "uploading" ? "Uploading…" : "Upload Properties"}
        </button>
      </div>
    </div>
  );
}
