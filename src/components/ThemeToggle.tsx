import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useHydrated } from "@/hooks/useHydrated";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const hydrated = useHydrated();
  const dark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:border-primary/50 hover:text-primary"
    >
      {!hydrated ? null : dark ? <Moon className="size-4" /> : <Sun className="size-4" />}
    </button>
  );
}