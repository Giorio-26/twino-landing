"use client";

import { ArrowLeft, ArrowRight, BedDouble, Building2, MapPin, Ruler, Sparkles } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";

interface Lead {
  id: number;
  customer_name: string | null;
  chat_id: string;
  budget: string | null;
  location: string | null;
  selected_property: string | null;
}

interface Property {
  id: string;
  name: string;
  price: number | string;
  location: string;
  rooms?: number | string;
  area?: number | string;
  status?: string;
}

export default function PropertyMatchesPage() {
  const { id } = useParams<{ id: string }>();
  const [lead, setLead] = useState<Lead | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/dashboard/leads").then((response) => {
        if (!response.ok) throw new Error();
        return response.json();
      }),
      fetch("/api/twin-config/properties").then((response) => {
        if (!response.ok) throw new Error();
        return response.json();
      }),
    ])
      .then(([leadPayload, propertyPayload]) => {
        const leads: Lead[] = Array.isArray(leadPayload?.data) ? leadPayload.data : [];
        setLead(leads.find((row) => String(row.id) === id) ?? null);
        setProperties(Array.isArray(propertyPayload?.data) ? propertyPayload.data : []);
      })
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, [id]);

  const displayName = lead?.customer_name && lead.customer_name !== "უცნობია"
    ? lead.customer_name
    : lead ? `+${lead.chat_id.split("@")[0]}` : "Selected buyer";

  if (loading) {
    return <div className="mx-auto max-w-6xl space-y-4">{[1, 2, 3].map((item) => <div key={item} className="h-32 animate-pulse rounded-xl bg-white" />)}</div>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="border-dash-border border-b pb-6">
        <Link href={`/dashboard/leads/${id}`} className="mb-4 inline-flex items-center gap-1.5 text-dash-text-muted text-xs no-underline hover:text-dash-text">
          <ArrowLeft className="h-3.5 w-3.5" />Back to buyer
        </Link>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="font-medium text-dash-accent text-xs uppercase tracking-wider">Property matching</p>
            <h2 className="mt-2 font-Helvetica-Neue text-2xl font-semibold tracking-tight text-dash-text">Find the right unit for {displayName}</h2>
            <p className="mt-2 max-w-2xl text-dash-text-secondary text-sm">Review live workspace inventory against the buyer information already collected.</p>
          </div>
          <div className="flex gap-6 text-xs">
            <div><p className="text-dash-text-muted">Budget</p><p className="mt-1 font-medium text-dash-text">{lead?.budget || "Not available"}</p></div>
            <div><p className="text-dash-text-muted">Preferred area</p><p className="mt-1 font-medium text-dash-text">{lead?.location || "Not available"}</p></div>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-blue-950">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
        <p className="text-xs leading-5">Showing live workspace inventory without automated ranking. Review buyer fit before adding a unit to a presentation.</p>
      </div>

      {failed ? (
        <div className="rounded-xl border border-dash-border bg-white px-6 py-14 text-center"><p className="font-medium text-dash-text">Inventory could not be loaded.</p><p className="mt-2 text-dash-text-muted text-sm">Try again or review inventory configuration.</p></div>
      ) : properties.length === 0 ? (
        <div className="rounded-xl border border-dashed border-dash-border bg-white px-6 py-16 text-center">
          <Building2 className="mx-auto h-8 w-8 text-dash-text-muted" />
          <h3 className="mt-4 font-semibold text-dash-text">No inventory available</h3>
          <p className="mx-auto mt-2 max-w-md text-dash-text-muted text-sm">Add real properties and units before creating a buyer shortlist.</p>
          <Link href="/dashboard/properties" className="mt-5 inline-flex rounded-lg bg-dash-accent px-4 py-2.5 font-semibold text-white text-sm no-underline">Manage inventory</Link>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {properties.map((property) => (
            <article key={property.id} className="rounded-xl border border-dash-border bg-white p-5 transition-colors hover:border-blue-200">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2"><h3 className="font-semibold text-dash-text">{property.name}</h3>{property.status && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-600">{property.status}</span>}</div>
                  <p className="mt-2 flex items-center gap-1.5 text-dash-text-muted text-xs"><MapPin className="h-3.5 w-3.5" />{property.location || "Location not available"}</p>
                </div>
                <p className="font-semibold text-dash-text">{Number(property.price) ? <>{"$"}{Number(property.price).toLocaleString()}</> : "Price unavailable"}</p>
              </div>
              <div className="mt-5 flex items-center gap-5 border-dash-border border-y py-3 text-dash-text-secondary text-xs">
                <span className="flex items-center gap-1.5"><BedDouble className="h-3.5 w-3.5" />{property.rooms || "—"} bedrooms</span>
                <span className="flex items-center gap-1.5"><Ruler className="h-3.5 w-3.5" />{property.area || "—"} m²</span>
                <span>Payment plan unavailable</span>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-dash-text-muted text-xs">Investment metrics unavailable</p>
                <Link href={`/dashboard/presentations?lead=${id}&property=${property.id}`} className="inline-flex items-center gap-1.5 font-semibold text-dash-accent text-xs no-underline">Add to presentation<ArrowRight className="h-3.5 w-3.5" /></Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
