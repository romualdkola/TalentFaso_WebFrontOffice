"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { isAuthenticated, getUser } from "@/lib/api";
import { User } from "@/types/auth";

export default function Footer() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);

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

  const isRecruiter = isAuth && user && (user.role === "RECRUITER" || user.role === "EMPLOYER");

  return (
    <footer
      className="py-16 mt-20"
      style={{
        backgroundColor: "var(--footer-bg)",
        color: "var(--footer-fg)",
      }}
    >
      <div className="container mx-auto px-4">
        <div className={`grid grid-cols-1 gap-12 ${isRecruiter ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image
                src="/images/logo_talentfaso.png"
                alt="Logo Talent Faso"
                width={200}
                height={200}
                className="object-contain"
              />
            </Link>
            <p className="leading-relaxed" style={{ color: "var(--footer-muted)" }}>
              Connecter les talents aux opportunités au Burkina Faso
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4 font-heading">Pour les candidats</h4>
            <ul className="space-y-3" style={{ color: "var(--footer-muted)" }}>
              <li>
                <Link href="/jobs" className="hover:text-white transition-colors duration-200">
                  Offres d&apos;emploi
                </Link>
              </li>
              <li>
                <Link href="/applications" className="hover:text-white transition-colors duration-200">
                  Mes candidatures
                </Link>
              </li>
            </ul>
          </div>
          {isRecruiter && (
            <div>
              <h4 className="text-lg font-semibold mb-4 font-heading">Pour les employeurs</h4>
              <ul className="space-y-3" style={{ color: "var(--footer-muted)" }}>
                <li>
                  <Link href="/jobs/new" className="hover:text-white transition-colors duration-200">
                    Publier une offre
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors duration-200">
                    Trouver des talents
                  </Link>
                </li>
              </ul>
            </div>
          )}
          <div>
            <h4 className="text-lg font-semibold mb-4 font-heading">Entreprise</h4>
            <ul className="space-y-3" style={{ color: "var(--footer-muted)" }}>
              <li>
                <Link href="#" className="hover:text-white transition-colors duration-200">
                  À propos
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors duration-200">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div
          className="mt-12 pt-8 text-center"
          style={{ borderTop: "1px solid var(--footer-border)", color: "var(--footer-muted)" }}
        >
          <p>&copy; {new Date().getFullYear()} Talent Faso. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}
