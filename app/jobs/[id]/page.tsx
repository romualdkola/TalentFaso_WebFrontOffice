"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, AlertCircle } from "lucide-react";
import { getJobByUuid } from "@/lib/jobsApi";
import JobDetail from "@/components/JobDetail";
import { Job } from "@/types/job";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface JobDetailPageProps {
  params: { id: string };
}

function JobDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
      <Skeleton className="h-4 w-28" />
      <div className="flex gap-4">
        <Skeleton className="size-14 rounded-xl shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-7 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
        </div>
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-11 w-48" />
      <div className="grid grid-cols-3 gap-3 pt-4">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
      </div>
      <div className="space-y-3 pt-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  );
}

export default function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = params;
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getJobByUuid(id);
        if (data) setJob(data);
        else setError("Offre introuvable");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur de chargement");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <JobDetailSkeleton />;

  if (error || !job) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-xl text-center space-y-5">
        <div className="mx-auto size-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="size-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold font-heading">Offre introuvable</h1>
        <p className="text-muted-foreground text-sm">
          {error ?? "Cette offre d'emploi n'existe pas ou a été supprimée."}
        </p>
        <Button asChild>
          <Link href="/jobs">
            <ChevronLeft className="size-4 mr-1" /> Retour aux offres
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 max-w-4xl py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Accueil</Link>
            <span>/</span>
            <Link href="/jobs" className="hover:text-foreground transition-colors">Offres d&apos;emploi</Link>
            <span>/</span>
            <span className="text-foreground font-medium truncate max-w-[200px]">{job.title}</span>
          </nav>
        </div>
      </div>

      {/* Detail content */}
      <div className="container mx-auto px-4 max-w-4xl py-8">
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
          <JobDetail
            job={job}
            standalone
            showBackButton
            onBack={() => window.history.back()}
          />
        </div>
      </div>
    </div>
  );
}
