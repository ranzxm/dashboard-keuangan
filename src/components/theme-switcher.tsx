"use client";

import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const themes = [
  { value: "system", label: "System", icon: Laptop },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
] as const;

export function ThemeSwitcher(): React.ReactNode {
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  if (!mounted) {
    return <div aria-hidden="true" className="theme-switcher skeleton" />;
  }

  return (
    <div aria-label="Pilih tema" className="theme-switcher" role="group">
      {themes.map(({ value, label, icon: Icon }) => (
        <button
          aria-label={`Gunakan tema ${label}`}
          className={theme === value ? "active" : ""}
          key={value}
          title={label}
          type="button"
          onClick={() => setTheme(value)}
        >
          <Icon size={16} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
