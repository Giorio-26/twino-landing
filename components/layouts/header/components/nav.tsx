import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { NAV_LINKS } from "../constants";

interface NavProps {
  onNavigate: (e: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
}

export default function Nav({ onNavigate }: NavProps) {
  const t = useTranslations("common");

  return (
    <nav className="hidden items-center gap-8 lg:flex">
      {NAV_LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={(e) => onNavigate(e, link.href)}
          className="group relative py-1.5 font-Helvetica-Neue font-medium text-[15px] text-primary/75 transition-all duration-250 ease-out hover:text-accent hover:opacity-100"
        >
          {t(link.labelKey)}
          <span className="-bottom-0.5 absolute left-0 h-0.5 w-0 rounded-full bg-accent transition-all duration-300 ease-in-out group-hover:w-full" />
        </Link>
      ))}
    </nav>
  );
}
