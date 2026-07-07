"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, CheckCircle2 } from "lucide-react";
import { createJobOffer, fetchActiveSkillTypes } from "@/lib/jobsApi";
import { SkillType } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function NewJobPage() {
  const router = useRouter();

  const [skillTypes, setSkillTypes] = useState<SkillType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    jobType: "FULL_TIME",
    location: "",
    city: "",
    country: "Burkina Faso",
    salaryMin: "0",
    salaryMax: "0",
    salaryCurrency: "XOF",
    experienceRequired: "0",
    educationLevel: "",
    skillsRequired: "",
    selectedSkillTypeUuid: "",
    applicationDeadline: "",
    startDate: "",
    remoteAllowed: false,
    isUrgent: false,
    recruiterUuid: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  });

  useEffect(() => {
    const loadSecteurs = async () => {
      try {
        const data = await fetchActiveSkillTypes();
        setSkillTypes(data);
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, selectedSkillTypeUuid: data[0].uuid }));
        }
      } catch (err) {
        console.error("Impossible de charger les secteurs d'activité", err);
      }
    };
    loadSecteurs();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const payload = {
      title: formData.title,
      description: formData.description,
      requirements: formData.requirements,
      jobType: formData.jobType as "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP",
      location: formData.location || `${formData.city}, ${formData.country}`,
      city: formData.city,
      country: formData.country,
      salaryMin: parseInt(formData.salaryMin, 10) || 0,
      salaryMax: parseInt(formData.salaryMax, 10) || 0,
      salaryCurrency: formData.salaryCurrency,
      experienceRequired: parseInt(formData.experienceRequired, 10) || 0,
      educationLevel: formData.educationLevel,
      skillsRequired: formData.skillsRequired,
      skillTypeUuids: formData.selectedSkillTypeUuid ? [formData.selectedSkillTypeUuid] : [],
      applicationDeadline: formData.applicationDeadline || null,
      startDate: formData.startDate || null,
      remoteAllowed: formData.remoteAllowed,
      isUrgent: formData.isUrgent,
      recruiterUuid: formData.recruiterUuid,
    };

    try {
      await createJobOffer(payload);
      setSuccess(true);
      setTimeout(() => router.push("/jobs"), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue lors de l'envoi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Briefcase className="size-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">Publier une nouvelle offre</CardTitle>
              <CardDescription>Renseignez les détails du poste à pourvoir</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {success && (
            <Alert className="mb-6 border-accent/30 bg-accent/10" role="status">
              <CheckCircle2 className="size-4 text-accent" />
              <AlertDescription className="text-foreground">
                Offre publiée avec succès ! Redirection en cours…
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mb-6" role="alert">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Titre */}
            <div className="space-y-1.5">
              <label htmlFor="title" className="text-sm font-medium">
                Titre du poste *
              </label>
              <Input
                id="title"
                name="title"
                required
                aria-required="true"
                value={formData.title}
                onChange={handleChange}
                placeholder="ex. : Développeur logiciel senior"
              />
            </div>

            {/* Ville & Pays */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="city" className="text-sm font-medium">Ville *</label>
                <Input
                  id="city"
                  name="city"
                  required
                  aria-required="true"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="ex. : Ouagadougou"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="country" className="text-sm font-medium">Pays *</label>
                <Input
                  id="country"
                  name="country"
                  required
                  aria-required="true"
                  value={formData.country}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Secteur & Type de contrat */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="selectedSkillTypeUuid" className="text-sm font-medium">
                  Secteur d&apos;activité *
                </label>
                <Select
                  id="selectedSkillTypeUuid"
                  name="selectedSkillTypeUuid"
                  required
                  aria-required="true"
                  value={formData.selectedSkillTypeUuid}
                  onChange={handleChange}
                >
                  {skillTypes.map((type) => (
                    <option key={type.uuid} value={type.uuid}>
                      {type.name}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="jobType" className="text-sm font-medium">Type d&apos;emploi *</label>
                <Select
                  id="jobType"
                  name="jobType"
                  required
                  aria-required="true"
                  value={formData.jobType}
                  onChange={handleChange}
                >
                  <option value="FULL_TIME">Temps plein</option>
                  <option value="PART_TIME">Temps partiel</option>
                  <option value="CONTRACT">Contrat</option>
                  <option value="INTERNSHIP">Stage</option>
                </Select>
              </div>
            </div>

            {/* Salaire (input group avec devise) */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Fourchette de salaire</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex rounded-lg shadow-sm">
                  <Input
                    id="salaryMin"
                    name="salaryMin"
                    type="number"
                    min="0"
                    aria-label="Salaire minimum"
                    value={formData.salaryMin}
                    onChange={handleChange}
                    className="rounded-r-none"
                    placeholder="Min"
                  />
                  <span className="inline-flex items-center rounded-r-lg border border-l-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                    min
                  </span>
                </div>
                <div className="flex rounded-lg shadow-sm">
                  <Input
                    id="salaryMax"
                    name="salaryMax"
                    type="number"
                    min="0"
                    aria-label="Salaire maximum"
                    value={formData.salaryMax}
                    onChange={handleChange}
                    className="rounded-r-none"
                    placeholder="Max"
                  />
                  <span className="inline-flex items-center rounded-r-lg border border-l-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                    max
                  </span>
                </div>
                <div className="space-y-0">
                  <Select
                    id="salaryCurrency"
                    name="salaryCurrency"
                    aria-label="Devise"
                    value={formData.salaryCurrency}
                    onChange={handleChange}
                  >
                    <option value="XOF">XOF (FCFA)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                  </Select>
                </div>
              </div>
            </div>

            {/* Expérience, Études, Compétences */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="experienceRequired" className="text-sm font-medium">
                  Expérience (ans)
                </label>
                <Input
                  id="experienceRequired"
                  name="experienceRequired"
                  type="number"
                  min="0"
                  value={formData.experienceRequired}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="educationLevel" className="text-sm font-medium">
                  Niveau d&apos;études requis
                </label>
                <Input
                  id="educationLevel"
                  name="educationLevel"
                  placeholder="ex. : BAC + 3 / Master"
                  value={formData.educationLevel}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="skillsRequired" className="text-sm font-medium">
                  Mots-clés compétences
                </label>
                <Input
                  id="skillsRequired"
                  name="skillsRequired"
                  aria-describedby="skills-help"
                  placeholder="React, SQL, Management"
                  value={formData.skillsRequired}
                  onChange={handleChange}
                />
                <p id="skills-help" className="text-xs text-muted-foreground">
                  Séparez par des virgules.
                </p>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="applicationDeadline" className="text-sm font-medium">
                  Date limite de candidature
                </label>
                <Input
                  id="applicationDeadline"
                  name="applicationDeadline"
                  type="date"
                  value={formData.applicationDeadline}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="startDate" className="text-sm font-medium">
                  Date de début prévue
                </label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Toggles */}
            <fieldset className="rounded-lg border border-border bg-muted/30 p-4">
              <legend className="px-2 text-sm font-medium text-muted-foreground">Options</legend>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="remoteAllowed"
                    checked={formData.remoteAllowed}
                    onChange={handleChange}
                    className="size-4 rounded border-input text-primary accent-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                  <span className="text-sm font-medium">Télétravail autorisé</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isUrgent"
                    checked={formData.isUrgent}
                    onChange={handleChange}
                    className="size-4 rounded border-input text-destructive accent-[color:var(--destructive)] focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-2"
                  />
                  <span className="text-sm font-semibold text-destructive">Marquer comme urgent</span>
                </label>
              </div>
            </fieldset>

            {/* Description */}
            <div className="space-y-1.5">
              <label htmlFor="description" className="text-sm font-medium">
                Description du poste *
              </label>
              <Textarea
                id="description"
                name="description"
                required
                aria-required="true"
                rows={6}
                value={formData.description}
                onChange={handleChange}
                placeholder="Décrivez le poste, les responsabilités…"
              />
            </div>

            {/* Exigences */}
            <div className="space-y-1.5">
              <label htmlFor="requirements" className="text-sm font-medium">
                Exigences détaillées *
              </label>
              <Textarea
                id="requirements"
                name="requirements"
                required
                aria-required="true"
                rows={4}
                value={formData.requirements}
                onChange={handleChange}
                placeholder="Écrivez les critères indispensables requis pour ce poste…"
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="sm:w-auto"
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting} size="lg" className="flex-1">
                {isSubmitting ? "Publication en cours…" : "Publier l'offre d'emploi"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
