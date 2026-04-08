import { cn } from "@/lib/utils";

interface HamburgerProps {
  open: boolean;
  onToggle: () => void;
}

export default function Hamburger({ open, onToggle }: HamburgerProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="relative z-10 flex size-10 cursor-pointer flex-col items-center justify-center gap-[5px] rounded-lg border-none bg-transparent transition-colors duration-200 ease-out hover:bg-accent/5 lg:hidden"
      aria-label="Toggle menu"
    >
      <span
        className={cn(
          "block h-0.5 w-5 origin-center rounded-full bg-primary transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          open && "translate-y-[7px] rotate-45",
        )}
      />
      <span
        className={cn(
          "block h-0.5 w-5 rounded-full bg-primary transition-all duration-300 ease-out",
          open && "scale-x-0 opacity-0",
        )}
      />
      <span
        className={cn(
          "block h-0.5 w-5 origin-center rounded-full bg-primary transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
          open && "-rotate-45 -translate-y-[7px]",
        )}
      />
    </button>
  );
}
