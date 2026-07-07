"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  LogIn,
  UserPlus,
  Upload,
  X,
  FileText,
  AlertCircle,
} from "lucide-react";
import { isAuthenticated, getUser } from "@/lib/api";
import { submitApplication } from "@/lib/jobsApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface ApplicationFormProps {
  jobId: string;        // UUID of the job offer
  jobTitle?: string;
  onSuccess?: () => void;
}

export default function ApplicationForm({ jobId, jobTitle, onSuccess }: ApplicationFormProps) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coverLetterError, setCoverLetterError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_COVER_LETTER = 3000;

  useEffect(() => {
    const check = () => {
      setLoggedIn(isAuthenticated());
      setUserName(getUser()?.fullName ?? null);
    };
    check();
    window.addEventListener("authChange", check);
    window.addEventListener("storage", check);
    return () => {
      window.removeEventListener("authChange", check);
      window.removeEventListener("storage", check);
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!allowed.includes(file.type)) {
      setError("Format non supporté. Veuillez utiliser PDF ou Word (.doc/.docx).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Le fichier est trop volumineux (max 5 Mo).");
      return;
    }
    setResumeFile(file);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverLetter.trim()) {
      setCoverLetterError("Veuillez rédiger une lettre de motivation.");
      return;
    }
    if (coverLetter.length > MAX_COVER_LETTER) {
      setCoverLetterError(`La lettre de motivation ne doit pas dépasser ${MAX_COVER_LETTER} caractères.`);
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setCoverLetterError(null);

    try {
      await submitApplication({
        jobOfferUuid: jobId,
        coverLetter: coverLetter.trim(),
        resumeFile: resumeFile ?? undefined,
      });
      setSuccess(true);
      setCoverLetter("");
      setResumeFile(null);
      onSuccess?.();
    } catch (err) {
      if (err instanceof Error && err.message === "AUTH_REQUIRED") {
        setLoggedIn(false);
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Une erreur s'est produite. Veuillez réessayer."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Success state ── */
  if (success) {
    return (
      <div className="flex flex-col items-center py-8 text-center gap-3">
        <div className="size-14 rounded-full bg-accent/10 flex items-center justify-center">
          <CheckCircle2 className="size-8 text-accent" />
        </div>
        <h3 className="font-bold text-lg font-heading">Candidature envoyée !</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Votre candidature a bien été soumise. Le recruteur vous contactera directement.
        </p>
        <Button variant="outline" size="sm" asChild>
          <Link href="/applications">Voir mes candidatures</Link>
        </Button>
      </div>
    );
  }

  /* ── Not logged in ── */
  if (!loggedIn) {
    return (
      <div className="rounded-xl border border-border bg-muted/30 p-6 text-center space-y-4">
        <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <AlertCircle className="size-6 text-primary" />
        </div>
        <div>
          <h3 className="font-bold font-heading">Connexion requise</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Vous devez être connecté en tant que candidat pour postuler
            {jobTitle ? ` à « ${jobTitle} »` : ""}.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Button asChild className="gap-2">
            <Link href="/login">
              <LogIn className="size-4" /> Se connecter
            </Link>
          </Button>
          <Button variant="outline" asChild className="gap-2">
            <Link href="/register">
              <UserPlus className="size-4" /> Créer un compte gratuit
            </Link>
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          L&apos;inscription est gratuite et prend moins d&apos;une minute.
        </p>
      </div>
    );
  }

  /* ── Logged-in form ── */
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Logged-in banner */}
      <div className="flex items-center gap-2 rounded-lg bg-accent/10 border border-accent/20 px-3 py-2 text-sm">
        <CheckCircle2 className="size-4 text-accent shrink-0" />
        <span className="text-foreground">
          Vous postulez en tant que{" "}
          <span className="font-semibold">{userName}</span>
        </span>
      </div>

      {/* Cover letter */}
      <div className="space-y-1.5">
        <label htmlFor="coverLetter" className="text-sm font-medium">
          Lettre de motivation *
        </label>
        <textarea
          id="coverLetter"
          value={coverLetter}
          onChange={(e) => { setCoverLetter(e.target.value); setError(null); setCoverLetterError(null); }}
          required
          aria-required="true"
          rows={6}
          maxLength={MAX_COVER_LETTER}
          aria-invalid={!!coverLetterError}
          aria-describedby={coverLetterError ? "coverLetter-error coverLetter-count" : "coverLetter-count"}
          placeholder="Expliquez pourquoi vous êtes le candidat idéal pour ce poste. Mentionnez vos expériences, compétences et motivation…"
          className={cn(
            "flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none disabled:opacity-50",
            coverLetterError && "border-destructive focus-visible:ring-destructive"
          )}
        />
        <div className="flex items-center justify-between gap-2">
          {coverLetterError ? (
            <p id="coverLetter-error" className="text-xs font-medium text-destructive">
              {coverLetterError}
            </p>
          ) : (
            <span />
          )}
          <p id="coverLetter-count" className="text-xs text-muted-foreground shrink-0">
            {coverLetter.length} / {MAX_COVER_LETTER} caractères
          </p>
        </div>
      </div>

      {/* CV upload */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">CV (optionnel)</label>
        {resumeFile ? (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
            <FileText className="size-5 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{resumeFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(resumeFile.size / 1024).toFixed(0)} Ko
              </p>
            </div>
            <button
              type="button"
              onClick={() => { setResumeFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
              className="text-muted-foreground hover:text-destructive transition-colors"
              aria-label="Supprimer le fichier"
            >
              <X className="size-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            aria-describedby="cv-help"
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border px-4 py-5 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
            )}
          >
            <Upload className="size-4" />
            Importer votre CV
          </button>
        )}
        <p id="cv-help" className="text-xs text-muted-foreground">
          Formats acceptés : PDF, Word (.doc/.docx). Taille maximale : 5 Mo.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        className="w-full gap-2"
        size="lg"
        disabled={isSubmitting || !coverLetter.trim()}
      >
        {isSubmitting ? "Envoi en cours…" : "Soumettre ma candidature"}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        En soumettant, vous acceptez nos{" "}
        <a href="#" className="underline hover:text-foreground">
          conditions d&apos;utilisation
        </a>
        .
      </p>
    </form>
  );
}
