import { MapPin, Clock, Wifi, Zap, Star } from "lucide-react";
import { Job } from "@/types/job";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface JobCardProps {
  job: Job;
  selected?: boolean;
  onClick?: () => void;
  href?: string;
}

const typeLabels: Record<string, string> = {
  "full-time": "Temps plein",
  "part-time": "Temps partiel",
  contract: "Contrat",
  internship: "Stage",
};

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  const days = Math.floor(diff / 86400);
  if (days === 1) return "Hier";
  if (days < 30) return `${days}j`;
  return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function CompanyAvatar({ name }: { name: string }) {
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
    <div className={cn("size-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0", color)}>
      {initials || "?"}
    </div>
  );
}

export default function JobCard({ job, selected = false, onClick }: JobCardProps) {
  const isDeadlineSoon =
    job.deadline
      ? (new Date(job.deadline).getTime() - Date.now()) / 86400000 <= 3
      : false;

  const content = (
    <div
      className={cn(
        "group relative flex flex-col gap-3 p-4 rounded-xl border bg-card cursor-pointer transition-all duration-150",
        selected
          ? "border-primary bg-primary/5 shadow-md ring-1 ring-primary/20"
          : "border-border hover:border-primary/40 hover:shadow-md hover:bg-muted/30"
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
    >
      {/* Top row: avatar + meta */}
      <div className="flex items-start gap-3">
        <CompanyAvatar name={job.company} />
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            "font-semibold font-heading text-sm leading-snug line-clamp-2 transition-colors",
            selected ? "text-primary" : "text-foreground group-hover:text-primary"
          )}>
            {job.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 truncate">{job.company}</p>
        </div>
        {/* Badges top-right */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          {job.featured && (
            <Star className="size-3.5 text-amber-400 fill-amber-400" aria-label="En vedette" />
          )}
          {job.isUrgent && (
            <Zap className="size-3.5 text-destructive fill-destructive/20" aria-label="Urgent" />
          )}
        </div>
      </div>

      {/* Location + remote */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <MapPin className="size-3.5 shrink-0" />
        <span className="truncate">{job.location}</span>
        {job.remoteAllowed && (
          <>
            <span>·</span>
            <span className="flex items-center gap-0.5 text-accent font-medium">
              <Wifi className="size-3.5" /> Télétravail
            </span>
          </>
        )}
      </div>

      {/* Tags row */}
      <div className="flex flex-wrap gap-1.5 items-center">
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 font-medium">
          {typeLabels[job.type] ?? job.type}
        </Badge>
        {job.salary && (
          <span className="text-[11px] font-semibold text-primary">{job.salary}</span>
        )}
      </div>

      {/* Footer: time + deadline */}
      <div className="flex items-center justify-between text-[10px] text-muted-foreground border-t border-border pt-2">
        <span className="flex items-center gap-1">
          <Clock className="size-3" />
          {timeAgo(job.postedDate)}
        </span>
        {job.deadline && (
          <span className={cn("font-medium", isDeadlineSoon && "text-destructive")}>
            Clôture : {new Date(job.deadline).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
          </span>
        )}
      </div>
    </div>
  );

  return content;
}
