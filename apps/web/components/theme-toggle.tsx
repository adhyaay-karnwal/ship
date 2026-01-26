"use client";

import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { SunIcon, MoonIcon, MonitorIcon } from "@/components/ui/icons";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className={cn("flex items-center gap-1 p-1 rounded-lg bg-muted", className)}>
      <button
        onClick={() => setTheme("light")}
        className={cn(
          "flex items-center justify-center p-2 rounded-md transition-colors",
          theme === "light"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="Light mode"
      >
        <SunIcon className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={cn(
          "flex items-center justify-center p-2 rounded-md transition-colors",
          theme === "dark"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="Dark mode"
      >
        <MoonIcon className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme("system")}
        className={cn(
          "flex items-center justify-center p-2 rounded-md transition-colors",
          theme === "system"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
        aria-label="System theme"
      >
        <MonitorIcon className="h-4 w-4" />
      </button>
    </div>
  );
}
