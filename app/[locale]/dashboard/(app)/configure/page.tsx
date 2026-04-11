"use client";

import {
  Building2,
  Check,
  ChevronDown,
  ChevronUp,
  DollarSign,
  ExternalLink,
  Globe,
  MapPin,
  MessageSquare,
  Plus,
  Save,
  Shield,
  Sparkles,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useState } from "react";

const toneOptions = [
  {
    id: "corporate",
    emoji: "🏢",
    label: "Corporate",
    desc: "Professional and formal",
    sample:
      "Thank you for your inquiry. We have several properties matching your criteria. May I schedule a consultation?",
  },
  {
    id: "friendly",
    emoji: "😊",
    label: "Friendly",
    desc: "Warm and energetic",
    sample:
      "Hey! Great to hear from you! 🏠 We've got some amazing places. What's your budget looking like?",
  },
  {
    id: "direct",
    emoji: "📋",
    label: "Direct",
    desc: "Facts only",
    sample:
      "Available: 3 units in Batumi, $55K-$80K. 2BR, sea view. Want details?",
  },
  {
    id: "luxury",
    emoji: "💎",
    label: "Luxury",
    desc: "Premium & exclusive",
    sample:
      "Welcome to our exclusive portfolio. Allow me to present our premium selection for discerning clients.",
  },
  {
    id: "consultative",
    emoji: "🤝",
    label: "Consultative",
    desc: "Empathetic advisor",
    sample:
      "Finding the right property is a big decision. Let me learn about your needs to guide you perfectly.",
  },
];

interface Property {
  id: string;
  name: string;
  price: number;
  location: string;
  rooms: number;
  area: number;
  status: "available" | "reserved" | "sold";
  link: string;
}

const inputCls =
  "w-full rounded-xl border border-dash-border bg-dash-bg py-3 px-4 text-sm text-dash-text placeholder-dash-text-muted transition-all duration-200 focus:border-dash-accent/40 focus:outline-none focus:ring-2 focus:ring-dash-accent/20";

export default function ConfigureTwinPage() {
  const [twinName, setTwinName] = useState("Ana");
  const [welcomeMessage, setWelcomeMessage] = useState(
    "Hello! I'm {name}, your real estate assistant. How can I help you today?",
  );
  const [selectedTone, setSelectedTone] = useState("friendly");
  const [rules, setRules] = useState([
    "Never offer discounts or negotiate prices",
    "Don't argue about pricing with clients",
    "If a question isn't in the knowledge base, say an agent will follow up",
  ]);
  const [newRule, setNewRule] = useState("");
  const [agencyInfo, setAgencyInfo] = useState({
    name: "",
    address: "",
    workingHours: "Mon-Fri 9:00-18:00, Sat 10:00-15:00",
    phone: "",
    website: "",
  });
  const [properties, setProperties] = useState<Property[]>([]);
  const [showAddProp, setShowAddProp] = useState(false);
  const [newProp, setNewProp] = useState<Omit<Property, "id">>({
    name: "",
    price: 0,
    location: "",
    rooms: 1,
    area: 0,
    status: "available",
    link: "",
  });
  const [open, setOpen] = useState<Record<string, boolean>>({
    identity: true,
    tone: true,
    guardians: true,
    knowledge: false,
    properties: false,
  });

  const toggle = (k: string) => setOpen((p) => ({ ...p, [k]: !p[k] }));
  const addRule = () => {
    if (newRule.trim()) {
      setRules([...rules, newRule.trim()]);
      setNewRule("");
    }
  };
  const addProperty = () => {
    if (newProp.name && newProp.price && newProp.location) {
      setProperties([...properties, { ...newProp, id: crypto.randomUUID() }]);
      setNewProp({
        name: "",
        price: 0,
        location: "",
        rooms: 1,
        area: 0,
        status: "available",
        link: "",
      });
      setShowAddProp(false);
    }
  };

  const Section = ({
    k,
    icon: Icon,
    title,
    sub,
    badge,
    children,
  }: {
    k: string;
    icon: React.ElementType;
    title: string;
    sub: string;
    badge?: string;
    children: React.ReactNode;
  }) => (
    <div className="dash-card overflow-hidden">
      <button
        type="button"
        onClick={() => toggle(k)}
        className="flex w-full items-center gap-4 p-6 text-left transition-colors hover:bg-dash-surface-hover/50"
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-dash-accent-muted">
          <Icon className="h-5 w-5 text-dash-accent" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-Helvetica-Neue font-semibold text-dash-text text-sm">
              {title}
            </h3>
            {badge && (
              <span className="rounded-full bg-dash-accent-muted px-2 py-0.5 font-medium text-[11px] text-dash-accent">
                {badge}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-dash-text-muted text-xs">{sub}</p>
        </div>
        {open[k] ? (
          <ChevronUp className="h-4 w-4 text-dash-text-muted" />
        ) : (
          <ChevronDown className="h-4 w-4 text-dash-text-muted" />
        )}
      </button>
      {open[k] && (
        <div className="border-dash-border border-t px-6 py-5">{children}</div>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="dash-animate-in flex items-center justify-between">
        <div>
          <h2 className="font-Helvetica-Neue font-bold text-2xl text-dash-text">
            Configure Your Twin
          </h2>
          <p className="mt-1 text-dash-text-secondary text-sm">
            Customize your AI sales assistant&apos;s personality and knowledge.
          </p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 rounded-xl bg-dash-accent px-5 py-2.5 font-semibold text-sm text-white transition-all hover:bg-dash-accent-hover hover:shadow-dash-accent/20 hover:shadow-lg"
        >
          <Save className="h-4 w-4" />
          Save Configuration
        </button>
      </div>

      {/* Identity */}
      <Section
        k="identity"
        icon={User}
        title="Twin Identity"
        sub="Name, avatar, and welcome message"
      >
        <div className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="block font-medium text-dash-text-secondary text-sm">
                Twin Name
                <input
                  type="text"
                  value={twinName}
                  onChange={(e) => setTwinName(e.target.value)}
                  placeholder="e.g. Ana"
                  className={inputCls}
                />
              </label>
            </div>
            <div className="space-y-2">
              <h5 className="block font-medium text-dash-text-secondary text-sm">
                Avatar
              </h5>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-dash-accent to-dash-purple font-bold text-lg text-white">
                  {twinName?.[0]?.toUpperCase() || "T"}
                </div>
                <span className="text-dash-text-muted text-xs">
                  Auto-generated from name
                </span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="block font-medium text-dash-text-secondary text-sm">
              Welcome Message
              <textarea
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                rows={3}
                className={`${inputCls} resize-none leading-relaxed`}
              />
            </label>
            <p className="text-dash-text-muted text-xs">
              Use "name" to insert the twin&apos;s name.
            </p>
          </div>
        </div>
      </Section>

      {/* Tone */}
      <Section
        k="tone"
        icon={MessageSquare}
        title="Tone of Voice"
        sub="How your twin communicates"
        badge={toneOptions.find((t) => t.id === selectedTone)?.label}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {toneOptions.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSelectedTone(t.id)}
              className={`group relative flex flex-col items-start rounded-xl border p-4 text-left transition-all ${selectedTone === t.id ? "border-dash-accent/40 bg-dash-accent-muted shadow-dash-accent/10 shadow-md" : "border-dash-border bg-dash-bg hover:border-dash-border-strong"}`}
            >
              {selectedTone === t.id && (
                <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-dash-accent">
                  <Check className="h-3 w-3 text-white" />
                </div>
              )}
              <span className="text-2xl">{t.emoji}</span>
              <span className="mt-2 font-semibold text-dash-text text-sm">
                {t.label}
              </span>
              <span className="text-dash-text-muted text-xs">{t.desc}</span>
            </button>
          ))}
        </div>
        <div className="mt-5 rounded-xl border border-dash-border bg-dash-bg p-4">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-dash-accent" />
            <span className="font-medium text-dash-text-secondary text-xs">
              Sample Preview
            </span>
          </div>
          <p className="text-dash-text text-sm leading-relaxed">
            {toneOptions.find((t) => t.id === selectedTone)?.sample}
          </p>
        </div>
      </Section>

      {/* Guardians */}
      <Section
        k="guardians"
        icon={Shield}
        title="The Guardians"
        sub="Iron rules your twin will never break"
        badge={`${rules.length} rules`}
      >
        <div className="space-y-3">
          {rules.map((r, i) => (
            <div
              key={i}
              className="group flex items-center gap-3 rounded-xl border border-dash-border bg-dash-bg p-3 hover:border-dash-border-strong"
            >
              <Shield className="h-4 w-4 shrink-0 text-dash-warning" />
              <span className="flex-1 text-dash-text text-sm">{r}</span>
              <button
                type="button"
                onClick={() => setRules(rules.filter((_, j) => j !== i))}
                className="shrink-0 text-dash-text-muted opacity-0 hover:text-dash-danger group-hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              type="text"
              value={newRule}
              onChange={(e) => setNewRule(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addRule()}
              placeholder="Add a new rule..."
              className={`${inputCls} flex-1`}
            />
            <button
              type="button"
              onClick={addRule}
              className="flex items-center gap-1.5 rounded-xl bg-dash-surface-secondary px-4 font-medium text-dash-text-secondary text-sm hover:bg-dash-surface-hover hover:text-dash-text"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>
        </div>
      </Section>

      {/* Knowledge Base */}
      <Section
        k="knowledge"
        icon={Globe}
        title="Knowledge Base"
        sub="Agency info for conversations"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="block font-medium text-dash-text-secondary text-sm">
              Agency Name
              <input
                type="text"
                value={agencyInfo.name}
                onChange={(e) =>
                  setAgencyInfo({ ...agencyInfo, name: e.target.value })
                }
                placeholder="Sakura Properties"
                className={inputCls}
              />
            </label>
          </div>
          <div className="space-y-2">
            <label className="block font-medium text-dash-text-secondary text-sm">
              Phone
              <input
                type="tel"
                value={agencyInfo.phone}
                onChange={(e) =>
                  setAgencyInfo({ ...agencyInfo, phone: e.target.value })
                }
                placeholder="+995 555 123 456"
                className={inputCls}
              />
            </label>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className="block font-medium text-dash-text-secondary text-sm">
              Address
              <input
                type="text"
                value={agencyInfo.address}
                onChange={(e) =>
                  setAgencyInfo({ ...agencyInfo, address: e.target.value })
                }
                placeholder="Tbilisi, Rustaveli Ave 24"
                className={inputCls}
              />
            </label>
          </div>
          <div className="space-y-2">
            <label className="block font-medium text-dash-text-secondary text-sm">
              Working Hours
              <input
                type="text"
                value={agencyInfo.workingHours}
                onChange={(e) =>
                  setAgencyInfo({ ...agencyInfo, workingHours: e.target.value })
                }
                className={inputCls}
              />
            </label>
          </div>
          <div className="space-y-2">
            <label className="block font-medium text-dash-text-secondary text-sm">
              Website
              <input
                type="url"
                value={agencyInfo.website}
                onChange={(e) =>
                  setAgencyInfo({ ...agencyInfo, website: e.target.value })
                }
                placeholder="https://sakura.ge"
                className={inputCls}
              />
            </label>
          </div>
        </div>
      </Section>

      {/* Properties */}
      <Section
        k="properties"
        icon={Building2}
        title="Property Database"
        sub="Properties your twin can recommend (max 15)"
        badge={`${properties.length}/15`}
      >
        {properties.length > 0 && (
          <div className="mb-4 space-y-3">
            {properties.map((p) => (
              <div
                key={p.id}
                className="group flex items-center gap-4 rounded-xl border border-dash-border bg-dash-bg p-4 hover:border-dash-border-strong"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-dash-accent-muted">
                  <Building2 className="h-5 w-5 text-dash-accent" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-dash-text text-sm">
                    {p.name}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-3 text-dash-text-muted text-xs">
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />$
                      {p.price.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {p.location}
                    </span>
                    <span>
                      {p.rooms}BR · {p.area}m²
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 font-medium ${p.status === "available" ? "bg-dash-success-muted text-dash-success" : p.status === "reserved" ? "bg-dash-warning-muted text-dash-warning" : "bg-dash-danger-muted text-dash-danger"}`}
                    >
                      {p.status}
                    </span>
                  </div>
                </div>
                {p.link && (
                  <a
                    href={p.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-dash-text-muted hover:text-dash-accent"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() =>
                    setProperties(properties.filter((x) => x.id !== p.id))
                  }
                  className="shrink-0 text-dash-text-muted opacity-0 hover:text-dash-danger group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
        {showAddProp ? (
          <div className="dash-animate-scale rounded-xl border border-dash-accent/20 bg-dash-accent-muted/30 p-5">
            <h4 className="mb-4 font-Helvetica-Neue font-semibold text-dash-text text-sm">
              Add Property
            </h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="font-medium text-dash-text-muted text-xs">
                  Name
                  <input
                    type="text"
                    value={newProp.name}
                    onChange={(e) =>
                      setNewProp({ ...newProp, name: e.target.value })
                    }
                    placeholder="Orbi #412"
                    className={inputCls}
                  />
                </label>
              </div>
              <div>
                <label className="font-medium text-dash-text-muted text-xs">
                  Price (USD)
                  <input
                    type="number"
                    value={newProp.price || ""}
                    onChange={(e) =>
                      setNewProp({ ...newProp, price: +e.target.value })
                    }
                    placeholder="80000"
                    className={inputCls}
                  />
                </label>
              </div>
              <div>
                <label className="font-medium text-dash-text-muted text-xs">
                  Location
                  <input
                    type="text"
                    value={newProp.location}
                    onChange={(e) =>
                      setNewProp({ ...newProp, location: e.target.value })
                    }
                    placeholder="Batumi"
                    className={inputCls}
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-dash-text-muted text-xs">
                    Rooms
                    <input
                      type="number"
                      value={newProp.rooms}
                      onChange={(e) =>
                        setNewProp({ ...newProp, rooms: +e.target.value })
                      }
                      className={inputCls}
                    />
                  </label>
                </div>
                <div>
                  <label className="font-medium text-dash-text-muted text-xs">
                    Area m²
                    <input
                      type="number"
                      value={newProp.area || ""}
                      onChange={(e) =>
                        setNewProp({ ...newProp, area: +e.target.value })
                      }
                      className={inputCls}
                    />
                  </label>
                </div>
              </div>
              <div>
                <label className="font-medium text-dash-text-muted text-xs">
                  Status
                  <select
                    value={newProp.status}
                    onChange={(e) =>
                      setNewProp({
                        ...newProp,
                        status: e.target.value as Property["status"],
                      })
                    }
                    className={inputCls}
                  >
                    <option value="available">Available</option>
                    <option value="reserved">Reserved</option>
                    <option value="sold">Sold</option>
                  </select>
                </label>
              </div>
              <div>
                <label className="font-medium text-dash-text-muted text-xs">
                  URL
                  <input
                    type="url"
                    value={newProp.link}
                    onChange={(e) =>
                      setNewProp({ ...newProp, link: e.target.value })
                    }
                    placeholder="https://..."
                    className={inputCls}
                  />
                </label>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={addProperty}
                className="flex items-center gap-2 rounded-xl bg-dash-accent px-4 py-2.5 font-semibold text-sm text-white hover:bg-dash-accent-hover"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
              <button
                type="button"
                onClick={() => setShowAddProp(false)}
                className="rounded-xl px-4 py-2.5 text-dash-text-muted text-sm hover:text-dash-text"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowAddProp(true)}
            disabled={properties.length >= 15}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dash-border border-dashed py-4 font-medium text-dash-text-muted text-sm hover:border-dash-accent/30 hover:bg-dash-accent-muted/20 hover:text-dash-accent disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Add Property ({properties.length}/15)
          </button>
        )}
      </Section>
    </div>
  );
}
