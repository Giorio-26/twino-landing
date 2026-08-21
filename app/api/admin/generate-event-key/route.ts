import { randomBytes } from "node:crypto";
import type { NextRequest } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/server";

function generateKey(): string {
  const hex = randomBytes(8).toString("hex").toUpperCase();
  return `${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}`;
}

export async function POST(request: NextRequest) {
  const denial = await requireAdminApi();
  if (denial) return denial;

  try {
    const body: {
      role: "organizer" | "company";
      companyId?: number;
      expiresInDays?: number;
    } = await request.json();

    if (!body.role || !["organizer", "company"].includes(body.role)) {
      return Response.json(
        { error: "role must be 'organizer' or 'company'" },
        { status: 400 },
      );
    }

    if (body.role === "company" && !body.companyId) {
      return Response.json(
        { error: "companyId is required for company keys" },
        { status: 400 },
      );
    }

    const supabase = createAdminClient();

    const key = generateKey();
    const days = body.expiresInDays ?? 30;
    const expiresAt = new Date(
      Date.now() + days * 24 * 60 * 60 * 1000,
    ).toISOString();

    let entityName: string | null =
      body.role === "organizer" ? "Property Georgia" : null;

    if (body.role === "company" && body.companyId) {
      const apiUrl = process.env.NEXT_PUBLIC_API_EVENT_URL;
      const apiKey = process.env.TWINO_API_KEY;
      if (apiUrl && apiKey) {
        try {
          const res = await fetch(`${apiUrl}/event/companies`, {
            headers: { "X-API-KEY": apiKey },
            cache: "no-store",
          });
          const payload = await res.json();
          const list: { id: unknown; name: string }[] = Array.isArray(payload)
            ? payload
            : Array.isArray(payload?.companies)
              ? payload.companies
              : Array.isArray(payload?.data)
                ? payload.data
                : [];
          const match = list.find((c) => Number(c.id) === body.companyId);
          if (match) entityName = match.name;
        } catch (err) {
          console.error("[generate-event-key] company lookup error:", err);
        }
      }
    }

    const { error: insertError } = await supabase
      .from("event_access_keys")
      .insert({
        key,
        role: body.role,
        company_id: body.role === "company" ? body.companyId : null,
        entity_name: entityName,
        expires_at: expiresAt,
      });

    if (insertError) {
      console.error("[generate-event-key] insert error:", insertError);
      return Response.json({ error: "Failed to save key" }, { status: 500 });
    }

    return Response.json({ key, role: body.role, expiresAt });
  } catch (err) {
    console.error("generate-event-key error:", err);
    return Response.json(
      { error: "Failed to process request" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const denial = await requireAdminApi();
  if (denial) return denial;

  try {
    const body: { id?: number } = await request.json();
    if (!body.id) {
      return Response.json({ error: "id is required" }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase
      .from("event_access_keys")
      .delete()
      .eq("id", body.id);

    if (error) {
      console.error("[generate-event-key DELETE]", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("generate-event-key DELETE error:", err);
    return Response.json(
      { error: "Failed to process request" },
      { status: 500 },
    );
  }
}
