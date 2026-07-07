"use client";

import { Suspense, useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, MapPin, SlidersHorizontal, X, Briefcase, ChevronLeft, ChevronRight } from "lucide-react";
import JobCard from "@/components/JobCard";
import JobCardSkeleton from "@/components/JobCardSkeleton";
import JobDetail from "@/components/JobDetail";
import { Job } from "@/types/job";
import {
  fetchJobs,
  fetchJobsBySkillType,
  mapJobOfferToJob,
  searchJobsFromList,
} from "@/lib/jobsApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const JOB_TYPES = [
  { value: "all", label: "Tous" },
  { value: "full-time", label: "Temps plein" },
  { value: "part-time", label: "Temps partiel" },
  { value: "contract", label: "Contrat" },
  { value: "internship", label: "Stage" },
];

const DATE_FILTERS = [
  { value: "all", label: "Toutes dates" },
  { value: "today", label: "Aujourd'hui" },
  { value: "week", label: "Cette semaine" },
  { value: "month", label: "Ce mois" },
];

function applyDateFilter(jobs: Job[], filter: string): Job[] {
  if (filter === "all") return jobs;
  const now = Date.now();
  const cutoff: Record<string, number> = {
    today: 86400000,
    week: 604800000,
    month: 2592000000,
  };
  const ms = cutoff[filter] ?? Infinity;
  return jobs.filter((j) => now - new Date(j.postedDate).getTime() <= ms);
}

function JobsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialQ = searchParams.get("q") ?? "";
  const initialLocation = searchParams.get("location") ?? "";
  const skillTypeParam = searchParams.get("skillType");

  const [searchQuery, setSearchQuery] = useState(initialQ);
  const [searchLocation, setSearchLocation] = useState(initialLocation);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showDetailMobile, setShowDetailMobile] = useState(false);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = skillTypeParam
        ? await fetchJobsBySkillType(skillTypeParam, { page: currentPage, size: 20 })
        : await fetchJobs({ page: currentPage, size: 20, sort: ["createdAt,desc"] });
      const mapped = response.content.map(mapJobOfferToJob);
      setJobs(mapped);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
      if (mapped.length > 0 && !selectedJob) setSelectedJob(mapped[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, [currentPage, skillTypeParam]);

  useEffect(() => { loadJobs(); }, [loadJobs]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0);
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    if (searchLocation.trim()) params.set("location", searchLocation.trim());
    if (skillTypeParam) params.set("skillType", skillTypeParam);
    router.replace(`/jobs${params.toString() ? `?${params}` : ""}`);
  };

  const handleClearAll = () => {
    setSearchQuery("");
    setSearchLocation("");
    setTypeFilter("all");
    setDateFilter("all");
    setRemoteOnly(false);
    setCurrentPage(0);
    router.push("/jobs");
  };

  const filteredJobs = useMemo(() => {
    let result = jobs;
    if (searchQuery || initialQ) {
      result = searchJobsFromList(result, searchQuery || initialQ);
    }
    if (searchLocation || initialLocation) {
      const loc = (searchLocation || initialLocation).toLowerCase();
      result = result.filter(
        (j) => j.location.toLowerCase().includes(loc) || (j.city ?? "").toLowerCase().includes(loc)
      );
    }
    if (typeFilter !== "all") result = result.filter((j) => j.type === typeFilter);
    if (remoteOnly) result = result.filter((j) => j.remoteAllowed);
    result = applyDateFilter(result, dateFilter);
    return result;
  }, [jobs, searchQuery, searchLocation, typeFilter, dateFilter, remoteOnly, initialQ, initialLocation]);

  const hasActiveFilters =
    typeFilter !== "all" || dateFilter !== "all" || remoteOnly || !!skillTypeParam;

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]">
      {/* ── TOP SEARCH BAR ── */}
      <div className="border-b border-border bg-card px-4 py-3 shrink-0">
        <form
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-2 sm:items-center max-w-4xl mx-auto"
        >
          <div className="flex flex-1 gap-2 min-w-0">
            <div className="flex items-center flex-1 min-w-0 border border-input rounded-lg px-3 gap-2 bg-background focus-within:ring-2 focus-within:ring-ring">
              <Search className="size-4 text-muted-foreground shrink-0" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Poste, compétence…"
                className="flex-1 min-w-0 text-sm bg-transparent outline-none py-2 placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex items-center flex-1 min-w-0 border border-input rounded-lg px-3 gap-2 bg-background focus-within:ring-2 focus-within:ring-ring">
              <MapPin className="size-4 text-muted-foreground shrink-0" />
              <input
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                placeholder="Ville"
                className="flex-1 min-w-0 text-sm bg-transparent outline-none py-2 placeholder:text-muted-foreground"
              />
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button type="submit" className="flex-1 sm:flex-none">Rechercher</Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={cn("shrink-0", showFilters && "border-primary text-primary")}
              aria-label="Filtres"
              aria-expanded={showFilters}
            >
              <SlidersHorizontal className="size-4" />
            </Button>
          </div>
        </form>

        {/* Filter bar */}
        {showFilters && (
          <div className="mt-3 flex flex-wrap gap-3 items-center max-w-4xl mx-auto border-t border-border pt-3">
            {/* Job type */}
            <div className="flex gap-1.5 flex-wrap">
              {JOB_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTypeFilter(t.value)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                    typeFilter === t.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border text-muted-foreground hover:border-primary hover:text-primary"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="w-px h-4 bg-border" />

            {/* Date filter */}
            <div className="flex gap-1.5 flex-wrap">
              {DATE_FILTERS.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDateFilter(d.value)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                    dateFilter === d.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border text-muted-foreground hover:border-primary hover:text-primary"
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>

            <div className="w-px h-4 bg-border" />

            {/* Remote toggle */}
            <button
              onClick={() => setRemoteOnly(!remoteOnly)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                remoteOnly
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-background border-border text-muted-foreground hover:border-accent hover:text-accent"
              )}
            >
              📡 Télétravail
            </button>

            {hasActiveFilters && (
              <button
                onClick={handleClearAll}
                className="ml-auto text-xs text-destructive hover:underline flex items-center gap-1"
              >
                <X className="size-3" /> Effacer les filtres
              </button>
            )}
          </div>
        )}

        {/* Active filter chips */}
        {(hasActiveFilters || skillTypeParam) && (
          <div className="flex gap-2 mt-2 flex-wrap max-w-4xl mx-auto">
            {skillTypeParam && (
              <Badge variant="outline" className="gap-1 text-xs">
                Secteur filtré
                <button onClick={() => router.push("/jobs")}>
                  <X className="size-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* ── MAIN SPLIT PANEL ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left: Job list */}
        <div className={cn(
          "flex flex-col border-r border-border bg-muted/20",
          "w-full md:w-[380px] lg:w-[420px] shrink-0",
          showDetailMobile ? "hidden md:flex" : "flex"
        )}>
          {/* Result count */}
          <div className="px-4 py-2.5 border-b border-border bg-card shrink-0">
            {loading ? (
              <div className="h-4 w-40 bg-muted animate-pulse rounded" />
            ) : (
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">{filteredJobs.length}</span>
                {" "}offre{filteredJobs.length !== 1 ? "s" : ""} sur{" "}
                <span className="font-semibold text-foreground">{totalElements}</span> au total
              </p>
            )}
          </div>

          {/* Cards list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {error && (
              <div className="text-destructive text-sm p-3 rounded-lg bg-destructive/10">
                {error}
              </div>
            )}
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} />)
            ) : filteredJobs.length > 0 ? (
              filteredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  selected={selectedJob?.id === job.id}
                  onClick={() => {
                    setSelectedJob(job);
                    setShowDetailMobile(true);
                  }}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                <Briefcase className="size-10 mb-3 opacity-30" />
                <p className="font-medium">Aucune offre trouvée</p>
                <button
                  onClick={handleClearAll}
                  className="text-xs text-primary mt-2 hover:underline"
                >
                  Effacer les filtres
                </button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-border bg-card px-4 py-3 flex items-center justify-between shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0 || loading}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {currentPage + 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1 || loading}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Right: Job detail panel */}
        <div className={cn(
          "flex-1 bg-card overflow-y-auto",
          showDetailMobile ? "flex flex-col" : "hidden md:flex md:flex-col"
        )}>
          {selectedJob ? (
            <JobDetail
              job={selectedJob}
              showBackButton={showDetailMobile}
              onBack={() => setShowDetailMobile(false)}
            />
          ) : !loading ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Briefcase className="size-12 opacity-20 mb-3" />
              <p className="text-sm">Sélectionnez une offre pour voir les détails</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100vh-5rem)]">
          <div className="w-full md:w-[380px] p-3 space-y-2 border-r border-border">
            {Array.from({ length: 8 }).map((_, i) => (
              <JobCardSkeleton key={i} />
            ))}
          </div>
          <div className="flex-1 hidden md:block" />
        </div>
      }
    >
      <JobsContent />
    </Suspense>
  );
}
