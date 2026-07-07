"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  Briefcase,
  Users,
  Building2,
  TrendingUp,
  ArrowRight,
  Zap,
  CheckCircle,
  Clock,
} from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faCode,
  faUsers,
  faBriefcase,
  faBullhorn,
  faCoins,
  faChartBar,
  faGears,
  faStethoscope,
  faScaleBalanced,
  faCartShopping,
  faTruck,
  faGraduationCap,
  faHardHat,
  faPalette,
  faDatabase,
  faLayerGroup,
  faLaptopCode,
  faClipboardList,
  faFlag,
} from "@fortawesome/free-solid-svg-icons";
import { faJs, faJava, faPython, faReact, faNode } from "@fortawesome/free-brands-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

library.add(
  faCode, faUsers, faBriefcase, faBullhorn, faCoins, faChartBar, faGears,
  faStethoscope, faScaleBalanced, faCartShopping, faTruck, faGraduationCap,
  faHardHat, faPalette, faDatabase, faLayerGroup, faLaptopCode, faClipboardList,
  faJs, faJava, faPython, faReact, faNode, faFlag,
);
import JobCard from "@/components/JobCard";
import JobCardSkeleton from "@/components/JobCardSkeleton";
import JobDetail from "@/components/JobDetail";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  fetchActiveSkillTypes,
  fetchDashboardStats,
  fetchJobs,
  mapJobOfferToJob,
} from "@/lib/jobsApi";
import { DashboardStats } from "@/types/api";
import { Job } from "@/types/job";

const CATEGORY_ICONS: Record<string, { icon: IconDefinition; color: string }> = {
  Java:                   { icon: faJava,          color: "text-orange-500" },
  Python:                 { icon: faPython,         color: "text-blue-500"   },
  JavaScript:             { icon: faJs,             color: "text-yellow-400" },
  "Ressources Humaines":  { icon: faUsers,          color: "text-violet-500" },
  "Gestion de Projet":    { icon: faClipboardList,  color: "text-sky-500"    },
  Marketing:              { icon: faBullhorn,       color: "text-pink-500"   },
  Finance:                { icon: faCoins,          color: "text-emerald-500"},
  "Data Sciences":        { icon: faChartBar,       color: "text-indigo-500" },
  "Data Science":         { icon: faDatabase,       color: "text-indigo-500" },
  Ingénierie:             { icon: faGears,          color: "text-slate-600"  },
  Médecine:               { icon: faStethoscope,    color: "text-red-500"    },
  Droit:                  { icon: faScaleBalanced,  color: "text-amber-600"  },
  Commerce:               { icon: faCartShopping,   color: "text-teal-500"   },
  Logistique:             { icon: faTruck,          color: "text-orange-600" },
  Enseignement:           { icon: faGraduationCap,  color: "text-purple-500" },
  BTP:                    { icon: faHardHat,        color: "text-yellow-600" },
  Design:                 { icon: faPalette,        color: "text-fuchsia-500"},
  "Développement Web":    { icon: faLaptopCode,     color: "text-blue-600"   },
  React:                  { icon: faReact,          color: "text-cyan-400"   },
  "Node.js":              { icon: faNode,           color: "text-green-600"  },
};

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
  const days = Math.floor(diff / 86400);
  if (days === 1) return "Hier";
  if (days < 30) return `Il y a ${days} jours`;
  return date.toLocaleDateString("fr-FR");
}

export default function Home() {
  const router = useRouter();
  const [searchWhat, setSearchWhat] = useState("");
  const [searchWhere, setSearchWhere] = useState("");

  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    const loadHomeData = async () => {
      setLoading(true);
      setLoadingCats(true);

      try {
        const response = await fetchJobs({ page: 0, size: 8, sort: ["createdAt,desc"] });
        setFeaturedJobs(response.content.map(mapJobOfferToJob).slice(0, 8));
      } catch {}
      finally { setLoading(false); }

      try {
        const activeCats = await fetchActiveSkillTypes();
        setCategories(activeCats.slice(0, 12));
      } catch {}
      finally { setLoadingCats(false); }

      try {
        const data = await fetchDashboardStats();
        setStats(data);
      } catch {}
      finally { setLoadingStats(false); }
    };
    loadHomeData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchWhat.trim()) params.set("q", searchWhat.trim());
    if (searchWhere.trim()) params.set("location", searchWhere.trim());
    router.push(`/jobs${params.toString() ? `?${params}` : ""}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-primary via-primary/90 to-[#3d0010] text-white pt-10 pb-20 sm:pt-16 sm:pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEuNSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA4KSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNhKSIvPjwvc3ZnPg==')] opacity-30" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-white/10 text-white border-white/20 hover:bg-white/20 gap-1.5">
              <FontAwesomeIcon icon={faFlag} className="size-3" />
              N°1 de l&apos;emploi au Burkina Faso
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 font-heading leading-tight tracking-tight">
              Trouvez votre prochain emploi
            </h1>
            <p className="text-white/80 text-base sm:text-lg mb-8 sm:mb-10">
              Des milliers d&apos;offres vérifiées. Postulez en quelques clics.
            </p>

            {/* Search bar */}
            <form
              onSubmit={handleSearch}
              role="search"
              aria-label="Rechercher une offre d'emploi"
              className="bg-white rounded-xl p-2 shadow-2xl flex flex-col sm:flex-row gap-2"
            >
              <div className="flex items-center flex-1 gap-2 px-3">
                <Search className="size-5 text-muted-foreground shrink-0" aria-hidden="true" />
                <label htmlFor="search-what" className="sr-only">
                  Poste, compétence ou entreprise
                </label>
                <input
                  id="search-what"
                  name="q"
                  type="search"
                  value={searchWhat}
                  onChange={(e) => setSearchWhat(e.target.value)}
                  placeholder="Poste, compétence ou entreprise"
                  className="flex-1 text-foreground bg-transparent text-sm outline-none placeholder:text-muted-foreground py-2"
                />
              </div>
              <div className="hidden sm:block w-px bg-border self-stretch" />
              <div className="flex items-center flex-1 gap-2 px-3">
                <MapPin className="size-5 text-muted-foreground shrink-0" aria-hidden="true" />
                <label htmlFor="search-where" className="sr-only">
                  Ville ou région
                </label>
                <input
                  id="search-where"
                  name="location"
                  type="search"
                  value={searchWhere}
                  onChange={(e) => setSearchWhere(e.target.value)}
                  placeholder="Ville ou région"
                  className="flex-1 text-foreground bg-transparent text-sm outline-none placeholder:text-muted-foreground py-2"
                />
              </div>
              <Button type="submit" size="lg" className="rounded-lg px-8 shrink-0">
                Rechercher
              </Button>
            </form>

            <div className="mt-5 flex flex-wrap justify-center gap-2 text-sm text-white/70">
              <span>Recherches populaires :</span>
              {["Développeur", "Marketing", "RH", "Finance", "Logistique"].map((t) => (
                <button
                  key={t}
                  onClick={() => { setSearchWhat(t); }}
                  className="underline underline-offset-2 hover:text-white transition-colors"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" className="w-full fill-background">
            <path d="M0,60 C360,0 1080,0 1440,60 L1440,60 L0,60 Z" />
          </svg>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-background py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {loadingStats ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="mx-auto h-9 w-24" />
                  <Skeleton className="mx-auto h-4 w-28" />
                </div>
              ))
            ) : (
              <>
                <div>
                  <p className="text-3xl font-extrabold text-primary font-heading">
                    {stats?.summary?.totalJobOffers?.toLocaleString() ?? "100+"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1">
                    <Briefcase className="size-4" /> Offres d&apos;emploi
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-foreground font-heading">
                    {stats?.summary?.totalCandidates?.toLocaleString() ?? "1 000+"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1">
                    <Users className="size-4" /> Candidats inscrits
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-accent font-heading">
                    {stats?.summary?.partnerCompanies?.toLocaleString() ?? "50+"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1">
                    <Building2 className="size-4" /> Entreprises partenaires
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-amber-500 font-heading">
                    {stats?.general?.totalApplications?.toLocaleString() ?? "500+"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center justify-center gap-1">
                    <TrendingUp className="size-4" /> Candidatures envoyées
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── TRUSTED BY — infinite marquee ── */}
      <section className="border-y border-border bg-muted/30 py-10 overflow-hidden">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest text-center mb-7">
          Ils font confiance à TalentFaso
        </p>
        <div className="marquee-wrapper">
          <div className="marquee-track">
            {[
              { name: "GrapeIT",       icon: faBullhorn,     color: "text-orange-500", bg: "bg-orange-50"  },
              /* duplicate for seamless loop */
              { name: "GrapeIT",       icon: faBullhorn,     color: "text-orange-500", bg: "bg-orange-50"  },
            ].map((partner, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-2 mx-10 select-none"
              >
                <div className={`size-14 rounded-2xl ${partner.bg} flex items-center justify-center shadow-sm`}>
                  <FontAwesomeIcon icon={partner.icon} className={`text-2xl ${partner.color}`} />
                </div>
                <span className="text-sm font-semibold text-foreground/60 whitespace-nowrap">
                  {partner.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="bg-background py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold font-heading">Explorer par secteur</h2>
              <p className="text-muted-foreground text-sm mt-1">Trouvez des offres dans votre domaine</p>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/jobs" className="gap-1">
                Tout voir <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          {loadingCats ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {categories.map((cat) => (
                <Link
                  key={cat.uuid}
                  href={`/jobs?skillType=${cat.uuid}`}
                  className="group flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-card hover:border-primary hover:bg-primary/5 hover:shadow-md transition-all duration-200 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="flex items-center justify-center size-10">
                    {cat.iconUrl ? (
                      <img src={cat.iconUrl} alt="" className="size-8 object-contain" />
                    ) : (() => {
                      const cfg = CATEGORY_ICONS[cat.name as keyof typeof CATEGORY_ICONS];
                      return cfg
                        ? <FontAwesomeIcon icon={cfg.icon} className={`text-2xl ${cfg.color}`} />
                        : <FontAwesomeIcon icon={faBriefcase} className="text-2xl text-muted-foreground" />;
                    })()}
                  </span>
                  <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                    {cat.name}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── RECENT JOBS ── */}
      <section className="bg-muted/30 py-16 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold font-heading">Offres récentes</h2>
              <p className="text-muted-foreground text-sm mt-1">Les dernières opportunités publiées</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/jobs" className="gap-1">
                Voir toutes les offres <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <JobCardSkeleton key={i} />
              ))}
            </div>
          ) : featuredJobs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {featuredJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  selected={selectedJob?.id === job.id}
                  onClick={() => setSelectedJob(job)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <Briefcase className="size-10 mx-auto mb-3 opacity-30" />
              <p>Aucune offre disponible pour le moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="bg-primary text-white py-14">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <Zap className="size-10 mx-auto mb-4 text-white/80" />
          <h2 className="text-2xl font-bold font-heading mb-2">Alertes emploi personnalisées</h2>
          <p className="text-white/70 mb-8 text-sm">
            Recevez chaque semaine les meilleures offres correspondant à votre profil.
          </p>
          <form
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            onSubmit={(e) => e.preventDefault()}
          >
            <Input
              type="email"
              placeholder="Votre adresse email"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-white"
              required
            />
            <Button
              type="submit"
              className="bg-white text-primary hover:bg-white/90 font-semibold shrink-0"
            >
              S&apos;abonner
            </Button>
          </form>
        </div>
      </section>

      {/* ── WHY TALENTFASO ── */}
      <section className="bg-background py-16 border-t border-border">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold font-heading text-center mb-12">
            Pourquoi choisir TalentFaso ?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <CheckCircle className="size-8 text-primary" />,
                bg: "bg-primary/10",
                title: "Offres vérifiées",
                desc: "Toutes les offres sont vérifiées par notre équipe avant publication. Aucune arnaque.",
              },
              {
                icon: <Zap className="size-8 text-amber-500" />,
                bg: "bg-amber-50",
                title: "Candidature rapide",
                desc: "Postulez en moins de 2 minutes. Pas de création de compte obligatoire.",
              },
              {
                icon: <Clock className="size-8 text-accent" />,
                bg: "bg-accent/10",
                title: "Réponse rapide",
                desc: "Les recruteurs sont notifiés en temps réel et vous répondent vite.",
              },
            ].map(({ icon, bg, title, desc }) => (
              <div key={title} className="text-center flex flex-col items-center group">
                <div className={`${bg} size-16 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110`}>
                  {icon}
                </div>
                <h3 className="font-bold text-lg font-heading mb-2">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── JOB DETAIL DRAWER ── */}
      <Sheet open={!!selectedJob} onOpenChange={(open) => !open && setSelectedJob(null)}>
        <SheetContent
          side="right"
          className="w-full p-0 sm:max-w-2xl [&>button]:z-20"
        >
          {selectedJob && (
            <>
              <SheetTitle className="sr-only">{selectedJob.title}</SheetTitle>
              <JobDetail job={selectedJob} />
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
