"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu } from "lucide-react";
import { isAuthenticated, getUser, logout } from "@/lib/api";
import { User } from "@/types/auth";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import ThemeToggle from "@/components/ThemeToggle";

const navLinks = [
  { href: "/", label: "Accueil" },
  { href: "/jobs", label: "Offres d'emploi" },
] as const;

function NavLink({
  href,
  label,
  className,
  onClick,
}: {
  href: string;
  label: string;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "text-sm font-medium text-foreground/80 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm",
        className
      )}
    >
      {label}
    </Link>
  );
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      setIsAuth(isAuthenticated());
      setUser(getUser());
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    window.addEventListener("authChange", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("authChange", checkAuth);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
    setIsAuth(false);
    window.dispatchEvent(new Event("authChange"));
    window.location.href = "/";
  };

  const isRecruiter =
    isAuth && user && (user.role === "RECRUITER" || user.role === "EMPLOYER");
  const isJobSeeker = isAuth && user && user.role === "JOB_SEEKER";

  const authLinks = isRecruiter
    ? [{ href: "/jobs/new", label: "Publier une offre" }]
    : isJobSeeker
    ? [{ href: "/applications", label: "Mes candidatures" }]
    : [];

  const allLinks = [...navLinks, ...authLinks];

  return (
    <nav
      className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80"
      aria-label="Navigation principale"
    >
      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          <Link
            href="/"
            className="flex shrink-0 items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
          >
            <Image
              src="/images/logo_talentfaso.png"
              alt="Logo Talent Faso"
              width={160}
              height={48}
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {allLinks.map((link) => (
              <NavLink key={link.href} href={link.href} label={link.label} />
            ))}
            {isAuth ? (
              <div className="flex items-center gap-3">
                <ThemeToggle />
                {user && (
                  <span className="text-sm font-medium text-muted-foreground">
                    {user.fullName}
                  </span>
                )}
                <Button size="sm" onClick={handleLogout}>
                  Déconnexion
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <Button size="sm" variant="outline" asChild>
                  <Link href="/login">Connexion</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Inscription</Link>
                </Button>
              </div>
            )}
          </div>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="md:hidden"
                aria-label="Ouvrir le menu"
              >
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(100vw-2rem,20rem)]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 px-4">
                {allLinks.map((link) => (
                  <NavLink
                    key={link.href}
                    href={link.href}
                    label={link.label}
                    className="text-base py-1"
                    onClick={() => setMobileOpen(false)}
                  />
                ))}
                <div className="border-t border-border pt-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Thème</span>
                    <ThemeToggle />
                  </div>
                  {isAuth ? (
                    <div className="flex flex-col gap-3">
                      {user && (
                        <p className="text-sm text-muted-foreground">
                          {user.fullName}
                        </p>
                      )}
                      <Button onClick={handleLogout}>Déconnexion</Button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Button className="w-full" asChild>
                        <Link href="/login" onClick={() => setMobileOpen(false)}>
                          Connexion
                        </Link>
                      </Button>
                      <Button className="w-full" variant="outline" asChild>
                        <Link href="/register" onClick={() => setMobileOpen(false)}>
                          Inscription
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
