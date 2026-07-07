"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { applyTheme, getStoredTheme, resolveTheme, setStoredTheme, type Theme } from "@/lib/theme";

export default function ThemeToggle() {
  const [resolved, setResolved] = useState<"light" | "dark">("light");

  useEffect(() => {
    setResolved(resolveTheme(getStoredTheme()));
  }, []);

  const toggle = () => {
    const next: Theme = resolved === "dark" ? "light" : "dark";
    setStoredTheme(next);
    applyTheme(next);
    setResolved(next);
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={toggle}
      aria-label={resolved === "dark" ? "Activer le mode clair" : "Activer le mode sombre"}
      title={resolved === "dark" ? "Mode clair" : "Mode sombre"}
    >
      {resolved === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
