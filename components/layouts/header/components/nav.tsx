import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { NAV_LINKS } from "../constants";

interface NavProps {
  onNavigate: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
}

export default function Nav({ onNavigate }: NavProps) {
  const t = useTranslations("common");

  return (
    <nav className="hidden items-center gap-6 lg:flex">
      {NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={(e) => onNavigate(e, link.href)}
          className="font-medium text-sm text-secondary hover:text-primary transition-colors duration-200 no-underline"
        >
          {t(link.labelKey)}
        </Link>
      ))}
    </nav>
  );
}
