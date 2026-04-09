"use client";

import {
  ArrowRight,
  Check,
  CheckCheck,
  MoreVertical,
  Phone,
  Send,
  Video,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";

type Channel = "whatsapp" | "facebook" | "instagram";

const channelConfig: Record<
  Channel,
  { name: string; color: string; gradient: string; bgChat: string }
> = {
  whatsapp: {
    name: "WhatsApp",
    color: "#25D366",
    gradient: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
    bgChat: "#ECE5DD",
  },
  facebook: {
    name: "Messenger",
    color: "#0084FF",
    gradient: "linear-gradient(135deg, #0084FF 0%, #0066CC 100%)",
    bgChat: "#F0F2F5",
  },
  instagram: {
    name: "Instagram",
    color: "#E1306C",
    gradient: "linear-gradient(135deg, #E1306C 0%, #C13584 50%, #833AB4 100%)",
    bgChat: "#FAFAFA",
  },
};

export default function HowItWorks() {
  const t = useTranslations("common.howItWorks");
  const [messages, setMessages] = useState<
    { role: "user" | "ai"; text: string; time: string }[]
  >([]);
  const [isTyping, setIsTyping] = useState(false);
  const [step, setStep] = useState(0);
  const [activeChannel, setActiveChannel] = useState<Channel>("whatsapp");
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sequence = [
      { role: "user" as const, text: t("msg1"), time: "10:31 AM" },
      { role: "ai" as const, text: t("msg2"), time: "10:31 AM" },
      { role: "user" as const, text: t("msg3"), time: "10:32 AM" },
      { role: "ai" as const, text: t("msg4"), time: "10:32 AM" },
    ];

    if (step >= sequence.length) return;

    const timer = setTimeout(() => {
      if (sequence[step].role === "ai") {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          setMessages((prev) => [...prev, sequence[step]]);
          setStep((s) => s + 1);
        }, 1800);
      } else {
        setMessages((prev) => [...prev, sequence[step]]);
        setStep((s) => s + 1);
      }
    }, 1400);

    return () => clearTimeout(timer);
  }, [step, t]);

  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, []);

  const resetDemo = (channel: Channel) => {
    console.log("Button clicked:", channel);
    setActiveChannel(channel);
    setMessages([]);
    setStep(0);
    setIsTyping(false);
  };

  const config = channelConfig[activeChannel];

  return (
    <section className="bg-white py-24 md:py-32 lg:py-40">
      <div className="container">
        {/* Header */}

        {/* Main Content Grid */}
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Column - Text & Controls */}
          <div className="space-y-8">
            <div className="mb-16 flex flex-col items-start lg:mb-10">
              <h2 className="mb-4 max-w-4xl font-Helvetica-Neue font-bold text-3xl text-primary leading-tight sm:text-4xl lg:text-5xl">
                {t("titlePre")}
                <span className="text-accent">{t("titleHighlight")}</span>
                {t("titlePost")}
              </h2>
              <p className="max-w-2xl font-Helvetica text-base text-primary/70 leading-relaxed sm:text-lg">
                {t("subtitle")}
              </p>
            </div>
            {/* Channel Selector */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-bold text-primary/50 text-xs uppercase tracking-widest">
                {t("channelLabel")}
              </span>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(channelConfig) as Channel[]).map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => resetDemo(ch)}
                    className={`pointer-events-auto rounded-full border px-4 py-2 font-semibold text-sm transition-all duration-300 active:scale-95 ${
                      activeChannel === ch
                        ? "text-white shadow-lg"
                        : "border-primary/10 bg-white text-primary/70 hover:border-primary/20"
                    }`}
                    style={
                      activeChannel === ch
                        ? {
                            background: config.gradient,
                            borderColor: "transparent",
                          }
                        : {}
                    }
                  >
                    {channelConfig[ch].name}
                  </button>
                ))}
              </div>
            </div>

            {/* Info Box */}
            {/* <div className="rounded-2xl border border-primary/10 bg-accent-light p-6">
              <div className="mb-3 flex items-center gap-3">
                <span
                  className="h-2 w-2 animate-pulse rounded-full"
                  style={{ background: config.color }}
                />
                <span className="font-Helvetica-Neue font-bold text-primary">
                  {t("twinTitle")}
                </span>
              </div>
              <p className="font-Helvetica text-primary/70 text-sm leading-relaxed">
                {t("twinDescription")}
              </p>
            </div> */}

            {/* CTA Button */}
            <Link
              href="#pilot"
              className="group hover:-translate-y-0.5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-8 py-3.5 font-semibold text-base text-white no-underline transition-all duration-250 ease-in-out hover:shadow-[0_8px_24px_rgba(0,114,255,0.3)] active:translate-y-0 active:shadow-[0_4px_12px_rgba(0,114,255,0.2)] sm:w-auto"
            >
              {t("ctaText")}
              <ArrowRight className="size-4 transition-transform duration-250 ease-out group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Right Column - Chat Window */}
          <div
            className="flex flex-col overflow-hidden rounded-3xl border border-primary/10 bg-white shadow-2xl"
            style={{ height: "560px" }}
          >
            {/* Chat Header */}
            <div
              className="flex items-center justify-between px-6 py-4"
              style={{ background: config.gradient }}
            >
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 font-bold text-lg text-white backdrop-blur-sm">
                    T
                  </div>
                  <span className="-bottom-0.5 -right-0.5 absolute h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400" />
                </div>
                <div>
                  <h3 className="font-Helvetica-Neue font-bold text-base text-white">
                    TwinO Sales Agent
                  </h3>
                  <span className="font-medium text-white/70 text-xs">
                    {t("online")}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-white/70">
                <Video className="h-5 w-5" />
                <Phone className="h-5 w-5" />
                <MoreVertical className="h-5 w-5" />
              </div>
            </div>

            {/* Chat Messages */}
            <div
              className="flex flex-1 flex-col space-y-4 overflow-y-auto p-5"
              ref={chatRef}
              style={{ background: config.bgChat }}
            >
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "rounded-tr-sm"
                        : "rounded-tl-sm bg-white text-primary shadow-sm"
                    }`}
                    style={
                      msg.role === "user"
                        ? {
                            background:
                              activeChannel === "whatsapp"
                                ? "#DCF8C6"
                                : config.color,
                            color:
                              activeChannel === "whatsapp"
                                ? "#303030"
                                : "white",
                          }
                        : {}
                    }
                  >
                    <span>{msg.text}</span>
                    <span
                      className={`mt-1 flex items-center justify-end gap-1 text-xs ${
                        msg.role === "user"
                          ? activeChannel === "whatsapp"
                            ? "text-primary/50"
                            : "text-white/60"
                          : "text-primary/50"
                      }`}
                    >
                      {msg.time}
                      {msg.role === "user" && (
                        <CheckCheck className="h-3.5 w-3.5 text-accent" />
                      )}
                      {msg.role === "ai" && (
                        <Check className="h-3 w-3 text-primary/50" />
                      )}
                    </span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-white px-5 py-3 shadow-sm">
                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-primary/30"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-primary/30"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="h-2 w-2 animate-bounce rounded-full bg-primary/50"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="border-primary/10 border-t bg-white p-4">
              <div className="relative flex items-center gap-2">
                <input
                  type="text"
                  disabled
                  placeholder={t("inputPlaceholder")}
                  className="w-full rounded-full border border-primary/10 bg-accent-secondary-light px-5 py-3.5 font-medium text-primary/40 text-sm placeholder-primary/30 focus:outline-none"
                />
                <button
                  type="button"
                  disabled
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
                  style={{ background: config.color }}
                >
                  <Send
                    className="h-4 w-4 text-white"
                    style={{ marginLeft: "2px" }}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
