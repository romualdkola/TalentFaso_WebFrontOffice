"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FileText, Briefcase, AlertCircle, LogIn, Clock, CheckCircle2, XCircle, Eye } from "lucide-react";
import { isAuthenticated } from "@/lib/api";
import { fetchMyApplications, ApplicationRecord } from "@/lib/jobsApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function statusConfig(status: ApplicationRecord["status"]) {
  switch (status) {
    case "ACCEPTED":
      return { label: "Accepté", icon: CheckCircle2, className: "bg-success-subtle text-accent border-accent/30" };
    case "REJECTED":
      return { label: "Refusé", icon: XCircle, className: "bg-destructive-subtle text-destructive border-destructive/30" };
    case "REVIEWED":
      return { label: "En cours d'examen", icon: Eye, className: "bg-info-subtle text-info border-info/30" };
    default:
      return { label: "En attente", icon: Clock, className: "bg-warning-subtle text-warning border-warning/30" };
  }
}

function ApplicationCardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border p-5 space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <Skeleton className="h-3 w-40" />
    </div>
  );
}

export default function ApplicationsPage() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const auth = isAuthenticated();
    setLoggedIn(auth);
    if (!auth) { setLoading(false); return; }

    fetchMyApplications({ page: 0, size: 50 })
      .then((data) => setApplications(data.content))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));

    const onAuth = () => {
      const a = isAuthenticated();
      setLoggedIn(a);
      if (!a) { setApplications([]); setLoading(false); }
    };
    window.addEventListener("authChange", onAuth);
    return () => window.removeEventListener("authChange", onAuth);
  }, []);

  if (loggedIn === null || loading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-10 space-y-4">
        <Skeleton className="h-9 w-56" />
        {Array.from({ length: 3 }).map((_, i) => (
          <ApplicationCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div className="container mx-auto max-w-md px-4 py-20 text-center">
        <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="size-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold font-heading mb-2">Connexion requise</h1>
        <p className="text-muted-foreground mb-6">
          Connectez-vous pour consulter vos candidatures.
        </p>
        <div className="flex flex-col gap-3">
          <Button asChild className="gap-2">
            <Link href="/login">
              <LogIn className="size-4" /> Se connecter
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/register">Créer un compte</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading">Mes candidatures</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {applications.length} candidature{applications.length !== 1 ? "s" : ""} soumise{applications.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="gap-2">
          <Link href="/jobs">
            <Briefcase className="size-4" /> Explorer les offres
          </Link>
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive mb-6 flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </div>
      )}

      {applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card py-16 text-center px-6">
          <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <FileText className="size-8 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-semibold font-heading mb-2">Aucune candidature</h2>
          <p className="text-muted-foreground text-sm mb-6 max-w-xs">
            Vous n&apos;avez pas encore postulé à des offres. Parcourez les offres disponibles et soumettez votre première candidature !
          </p>
          <Button asChild>
            <Link href="/jobs">Parcourir les offres</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => {
            const { label, icon: StatusIcon, className: statusClass } = statusConfig(app.status);
            return (
              <div
                key={app.uuid}
                className="bg-card rounded-xl border border-border p-5 hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/jobs/${app.jobOfferUuid}`}
                      className="font-semibold text-foreground hover:text-primary truncate block transition-colors"
                    >
                      {app.jobOfferTitle}
                    </Link>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {app.companyName} · {app.jobOfferCity || app.jobOfferLocation}
                    </p>
                  </div>
                  <Badge
                    className={cn(
                      "flex items-center gap-1 border font-medium shrink-0",
                      statusClass
                    )}
                  >
                    <StatusIcon className="size-3" />
                    {label}
                  </Badge>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span>
                    Postulé le{" "}
                    {new Date(app.createdAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                  {app.jobOfferApplicationDeadline && (
                    <span>
                      Clôture :{" "}
                      {new Date(app.jobOfferApplicationDeadline).toLocaleDateString("fr-FR")}
                    </span>
                  )}
                  {app.coverLetterUrl && (
                    <a
                      href={app.coverLetterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Voir la lettre
                    </a>
                  )}
                  {app.resumeUrl && (
                    <a
                      href={app.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Voir le CV
                    </a>
                  )}
                </div>

                {app.message && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Message du recruteur :</span>{" "}
                      {app.message}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
