"use client";

import { Loader2, Plus, Shield, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { apiFetch, inputCls, type Rule } from "./shared";

const WORD_LIMIT = 50;

function wordCount(text: string) {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

interface GuardiansTabProps {
  title?: string;
  subtitle?: string;
  onSaved?: () => void;
}

export default function GuardiansTab(props?: GuardiansTabProps) {
  const t = useTranslations("dashboard.configure.guardians");

  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRule, setNewRule] = useState("");
  const [addingRule, setAddingRule] = useState(false);
  const [addError, setAddError] = useState("");
  const [deletingRuleId, setDeletingRuleId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const words = wordCount(newRule);
  const overLimit = words > WORD_LIMIT;

  const examples = t.raw("examples") as string[];

  useEffect(() => {
    apiFetch<Rule[]>("/api/twin-config/rules").then((res) => {
      if (res.data) setRules(res.data);
      setLoading(false);
    });
  }, []);

  const syncRules = (updated: Rule[]) =>
    apiFetch("/api/dashboard/configure/rules", {
      method: "POST",
      body: JSON.stringify({ rules: updated.map((r) => r.rule_text) }),
    });

  const addRule = async () => {
    if (!newRule.trim() || addingRule || overLimit) return;
    setAddingRule(true);
    setAddError("");
    const res = await apiFetch<Rule>("/api/twin-config/rules", {
      method: "POST",
      body: JSON.stringify({ rule_text: newRule.trim() }),
    });
    if (res.data) {
      const updated = [...rules, res.data as Rule];
      setRules(updated);
      setNewRule("");
      syncRules(updated);
      props?.onSaved?.();
    } else {
      setAddError(res.error ?? "Failed to add rule. Please try again.");
    }
    setAddingRule(false);
  };

  const deleteRule = async (id: string) => {
    setDeletingRuleId(id);
    setDeleteError("");
    const res = await apiFetch(`/api/twin-config/rules/${id}`, { method: "DELETE" });
    if (res.error) {
      setDeleteError(res.error ?? "Failed to delete rule. Please try again.");
    } else {
      const updated = rules.filter((r) => r.id !== id);
      setRules(updated);
      syncRules(updated);
      props?.onSaved?.();
    }
    setDeletingRuleId(null);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-14 animate-pulse rounded-xl bg-dash-surface-secondary"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="dash-card p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-dash-warning-muted">
          <Shield className="h-4 w-4 text-dash-warning" />
        </div>
        <div>
          <h3 className="font-Helvetica-Neue font-semibold text-dash-text text-sm">
            {props?.title ?? t("title")}
          </h3>
          <p className="text-dash-text-muted text-xs">
            {props?.subtitle ?? t("subtitle")}
          </p>
        </div>
        <span className="ml-auto rounded-full bg-dash-accent-muted px-2.5 py-0.5 font-medium text-[11px] text-dash-accent">
          {t("rulesCount", { count: rules.length })}
        </span>
      </div>

      <div className="space-y-3">
        {rules.map((r) => (
          <div
            key={r.id}
            className="group flex items-center gap-3 rounded-xl border border-dash-border bg-dash-bg p-3 hover:border-dash-border-strong"
          >
            <Shield className="h-4 w-4 shrink-0 text-dash-warning" />
            <span className="flex-1 text-dash-text text-sm">{r.rule_text}</span>
            <button
              type="button"
              onClick={() => deleteRule(r.id)}
              disabled={deletingRuleId === r.id}
              className="shrink-0 text-dash-text-muted opacity-0 transition-opacity hover:text-dash-danger disabled:opacity-50 group-hover:opacity-100"
            >
              {deletingRuleId === r.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
            </button>
          </div>
        ))}

        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={newRule}
              onChange={(e) => setNewRule(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addRule()}
              placeholder={t("inputPlaceholder")}
              className={`${inputCls} flex-1 ${overLimit ? "border-dash-danger/50 focus:border-dash-danger/50 focus:ring-dash-danger/20" : ""}`}
            />
            <button
              type="button"
              onClick={addRule}
              disabled={addingRule || !newRule.trim() || overLimit}
              className="flex items-center gap-1.5 rounded-xl bg-dash-surface-secondary px-4 font-medium text-dash-text-secondary text-sm hover:bg-dash-surface-hover hover:text-dash-text disabled:opacity-50"
            >
              {addingRule ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {t("addButton")}
            </button>
          </div>
          <div className="flex items-center justify-between">
            {addError ? (
              <p className="text-dash-danger text-xs">{addError}</p>
            ) : (
              <span />
            )}
            <span
              className={`text-xs ${overLimit ? "text-dash-danger" : "text-dash-text-muted"}`}
            >
              {t("wordCounter", { words, limit: WORD_LIMIT })}
            </span>
          </div>
          {deleteError && (
            <p className="text-dash-danger text-xs">{deleteError}</p>
          )}
        </div>

        {rules.length === 0 && (
          <div className="pt-1">
            <p className="mb-2 text-dash-text-muted text-xs">
              {t("examplesLabel")}
            </p>
            <div className="flex flex-col gap-1.5">
              {examples.map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => setNewRule(ex)}
                  className="rounded-lg border border-dash-border bg-dash-bg px-3 py-2 text-left text-dash-text-muted text-xs transition-colors hover:border-dash-accent/30 hover:bg-dash-accent-muted/20 hover:text-dash-text"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
