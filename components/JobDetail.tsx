"use client";

import { useState } from "react";
import {
  MapPin,
  Briefcase,
  Calendar,
  Clock,
  Users,
  GraduationCap,
  Wifi,
  Zap,
  Star,
  Eye,
  ChevronLeft,
  Send,
  ExternalLink,
} from "lucide-react";
import { Job } from "@/types/job";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import ApplicationForm from "@/components/ApplicationForm";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface JobDetailProps {
  job: Job;
  onBack?: () => void;
  showBackButton?: boolean;
  standalone?: boolean;
}

const typeLabels: Record<string, string> = {
  "full-time": "Temps plein",
  "part-time": "Temps partiel",
  contract: "Contrat",
  internship: "Stage",
};

const educationLabels: Record<string, string> = {
  NONE: "Sans diplôme",
  BAC: "Baccalauréat",
  BAC_PLUS_2: "Bac +2",
  BAC_PLUS_3: "Licence / Bac +3",
  MASTER: "Master / Bac +5",
  DOCTORATE: "Doctorat",
};

function CompanyAvatar({ name, size = "lg" }: { name: string; size?: "sm" | "lg" }) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  const colors = [
    "bg-blue-100 text-blue-700",
    "bg-purple-100 text-purple-700",
    "bg-amber-100 text-amber-700",
    "bg-green-100 text-green-700",
    "bg-rose-100 text-rose-700",
    "bg-teal-100 text-teal-700",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div
      className={cn(
        "rounded-xl flex items-center justify-center font-bold shrink-0",
        color,
        size === "lg" ? "size-14 text-xl" : "size-10 text-sm"
      )}
    >
      {initials || "?"}
    </div>
  );
}

export default function JobDetail({
  job,
  onBack,
  showBackButton = false,
  standalone = false,
}: JobDetailProps) {
  const [showForm, setShowForm] = useState(false);

  const isDeadlineSoon =
    job.deadline
      ? (new Date(job.deadline).getTime() - Date.now()) / 86400000 <= 3
      : false;

  const daysSincePost = Math.floor(
    (Date.now() - new Date(job.postedDate).getTime()) / 86400000
  );
  const postedLabel =
    daysSincePost === 0
      ? "Aujourd'hui"
      : daysSincePost === 1
      ? "Hier"
      : `Il y a ${daysSincePost} jours`;

  return (
    <div className={cn("flex flex-col h-full", standalone && "min-h-screen")}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-4">
        {showBackButton && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors"
          >
            <ChevronLeft className="size-4" /> Retour aux offres
          </button>
        )}
        <div className="flex items-start gap-4">
          <CompanyAvatar name={job.company} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              {job.featured && (
                <Badge className="bg-amber-100 text-amber-700 border-amber-200 gap-1">
                  <Star className="size-3 fill-amber-500 text-amber-500" /> En vedette
                </Badge>
              )}
              {job.isUrgent && (
                <Badge className="bg-destructive/10 text-destructive border-destructive/20 gap-1">
                  <Zap className="size-3" /> Urgent
                </Badge>
              )}
            </div>
            <h1 className="text-xl font-bold font-heading leading-tight">{job.title}</h1>
            <p className="text-muted-foreground font-medium mt-0.5">{job.company}</p>
          </div>
          {standalone && (
            <Button size="sm" variant="outline" asChild className="shrink-0">
              <Link href="/jobs">
                <ExternalLink className="size-4 mr-1.5" /> Toutes les offres
              </Link>
            </Button>
          )}
        </div>

        {/* Meta pills */}
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-4 text-primary" />
            {job.location}
          </span>
          {job.remoteAllowed && (
            <span className="inline-flex items-center gap-1.5 text-sm text-accent font-medium">
              <Wifi className="size-4" /> Télétravail possible
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <Briefcase className="size-4 text-primary" />
            {typeLabels[job.type] ?? job.type}
          </span>
          {job.salary && (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
              💰 {job.salary}
            </span>
          )}
        </div>

        {/* Quick info row */}
        <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="size-3.5" /> Publié {postedLabel}
          </span>
          {job.viewsCount !== undefined && (
            <span className="flex items-center gap-1">
              <Eye className="size-3.5" /> {job.viewsCount} vues
            </span>
          )}
          {job.applicationsCount !== undefined && (
            <span className="flex items-center gap-1">
              <Users className="size-3.5" /> {job.applicationsCount} candidatures
            </span>
          )}
          {job.deadline && (
            <span className={cn("flex items-center gap-1 font-medium", isDeadlineSoon && "text-destructive")}>
              <Calendar className="size-3.5" />
              Clôture : {new Date(job.deadline).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          )}
        </div>

        {/* Apply button */}
        <div className="mt-4">
          {!showForm ? (
            <Button onClick={() => setShowForm(true)} className="gap-2 w-full sm:w-auto" size="lg">
              <Send className="size-4" /> Postuler maintenant
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowForm(false)}
            >
              Masquer le formulaire
            </Button>
          )}
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
        {/* Application form */}
        {showForm && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
            <h2 className="font-bold font-heading text-lg mb-4 flex items-center gap-2">
              <Send className="size-5 text-primary" /> Soumettre votre candidature
            </h2>
            <ApplicationForm jobId={job.id} jobTitle={job.title} onSuccess={() => setShowForm(false)} />
          </div>
        )}

        {/* Job info summary */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            {
              icon: <Briefcase className="size-4 text-primary" />,
              label: "Type de contrat",
              value: typeLabels[job.type] ?? job.type,
            },
            job.educationLevel && {
              icon: <GraduationCap className="size-4 text-primary" />,
              label: "Niveau d'études",
              value: educationLabels[job.educationLevel] ?? job.educationLevel,
            },
            job.experienceRequired && {
              icon: <Clock className="size-4 text-primary" />,
              label: "Expérience",
              value: `${job.experienceRequired} an${job.experienceRequired > 1 ? "s" : ""}`,
            },
            job.startDate && {
              icon: <Calendar className="size-4 text-primary" />,
              label: "Début",
              value: new Date(job.startDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }),
            },
            job.remoteAllowed !== undefined && {
              icon: <Wifi className="size-4 text-primary" />,
              label: "Télétravail",
              value: job.remoteAllowed ? "Oui" : "Non",
            },
            job.city && {
              icon: <MapPin className="size-4 text-primary" />,
              label: "Ville",
              value: job.city,
            },
          ]
            .filter(Boolean)
            .map((item: any) => (
              <div key={item.label} className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border">
                {item.icon}
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-semibold">{item.label}</p>
                  <p className="text-sm font-medium mt-0.5">{item.value}</p>
                </div>
              </div>
            ))}
        </div>

        <Separator />

        {/* Description */}
        <div>
          <h2 className="text-lg font-bold font-heading mb-4">Description du poste</h2>
          <div
            className="prose prose-sm max-w-none text-foreground [&>*:first-child]:mt-0 [&>ul]:space-y-1 [&>ul>li]:text-muted-foreground [&>p]:text-muted-foreground [&>p]:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: job.description }}
          />
        </div>

        {/* Requirements */}
        {job.requirements && job.requirements.length > 0 && (
          <>
            <Separator />
            <div>
              <h2 className="text-lg font-bold font-heading mb-4">Profil recherché</h2>
              <div
                className="prose prose-sm max-w-none text-foreground [&>*:first-child]:mt-0 [&>ul]:space-y-1 [&>ul>li]:text-muted-foreground [&>p]:text-muted-foreground [&>p]:leading-relaxed"
                dangerouslySetInnerHTML={{ __html: job.requirements }}
              />
            </div>
          </>
        )}

        {/* Skills */}
        {job.skillsRequired && (
          <>
            <Separator />
            <div>
              <h2 className="text-lg font-bold font-heading mb-3">Compétences requises</h2>
              <div className="flex flex-wrap gap-2">
                {job.skillsRequired.split(/[,;]/).map((s) => s.trim()).filter(Boolean).map((skill) => (
                  <Badge key={skill} variant="outline" className="bg-muted">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Benefits */}
        {job.benefits && job.benefits.length > 0 && (
          <>
            <Separator />
            <div>
              <h2 className="text-lg font-bold font-heading mb-3">Avantages</h2>
              <ul className="space-y-2">
                {job.benefits.map((b, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="text-accent">✓</span> {b}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {/* Bottom CTA */}
        {!showForm && (
          <div className="rounded-xl border border-border bg-muted/30 p-5 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Ce poste vous intéresse ? Envoyez votre candidature dès maintenant.
            </p>
            <Button onClick={() => setShowForm(true)} className="gap-2" size="lg">
              <Send className="size-4" /> Postuler à cette offre
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
