"use client";

import { Mail, Phone } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const LinkedInIcon = () => (
  <svg
    className="h-5 w-5"
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
  </svg>
);

const FacebookIcon = () => (
  <svg
    className="h-5 w-5"
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export default function Footer() {
  const t = useTranslations("common.footer");
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary pt-16 pb-8">
      <div className="container">
        {/* Main Footer Content */}
        <div className="mb-12 grid grid-cols-1 gap-12 border-white/10 border-b pb-12 md:grid-cols-2">
          {/* Left - Logo */}
          {/* <div className="flex flex-col items-start">
            <h1 className="font-Helvetica-Neue font-bold text-2xl text-white">
              {t("logo")}
            </h1>
            <p className="mt-2 font-Helvetica text-sm text-white/60">
              {t("tagline")}
            </p>
          </div> */}
          <Link
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="relative z-10 transition-opacity duration-200 ease-out hover:opacity-80"
          >
            <Image
              src="/images/twino-w.svg"
              alt={t("name")}
              width={120}
              height={32}
              priority
            />
          </Link>

          {/* Right - Contact & Social */}
          <div className="flex flex-col items-start gap-4 md:items-end">
            {/* Contact Info */}
            <div className="flex flex-col items-end gap-3">
              <a
                href="tel:+1234567890"
                className="flex items-center gap-2 font-Helvetica text-sm text-white/70 no-underline transition-colors hover:text-white"
              >
                <Phone className="h-4 w-4" />
                {t("phone")}
              </a>
              <a
                href="mailto:twinoyc@gmail.com"
                className="flex items-center gap-2 font-Helvetica text-sm text-white/70 no-underline transition-colors hover:text-white"
              >
                <Mail className="h-4 w-4" />
                {t("email")}
              </a>
            </div>

            {/* Social Media Icons */}
            <div className="mt-2 flex items-center gap-4">
              <Link
                href="https://www.facebook.com/profile.php?id=61583962652529"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/70 transition-all duration-200 hover:border-white/50 hover:text-white"
                aria-label="Facebook"
              >
                <FacebookIcon />
              </Link>
              <Link
                href="https://www.linkedin.com/company/110122713"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-white/70 transition-all duration-200 hover:border-white/50 hover:text-white"
                aria-label="LinkedIn"
              >
                <LinkedInIcon />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom - Footer Links & Copyright */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          {/* Left - Copyright & All Rights */}
          <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:text-left">
            <p className="font-Helvetica text-white/50 text-xs">
              {t("copyright", { year: currentYear })}
            </p>
            <p className="font-Helvetica text-white/50 text-xs">
              {t("allRightsReserved")}
            </p>
          </div>

          {/* Right - Legal Links */}
          <div className="flex flex-col items-center gap-2 text-center sm:flex-row sm:text-right">
            <Link
              href="/terms"
              className="font-Helvetica text-white/50 text-xs no-underline transition-colors hover:text-white"
            >
              {t("termsAndConditions")}
            </Link>
            <span className="hidden font-Helvetica text-white/30 text-xs sm:inline">
              •
            </span>
            <Link
              href="/privacy"
              className="font-Helvetica text-white/50 text-xs no-underline transition-colors hover:text-white"
            >
              {t("privacyPolicy")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
