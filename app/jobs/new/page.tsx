"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createJobOffer, fetchActiveSkillTypes } from "@/lib/jobsApi";
import { SkillType } from "@/types/api";

export default function NewJobPage() {
  const router = useRouter();

  // États locaux obligatoires
  const [skillTypes, setSkillTypes] = useState<SkillType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Payload aligné sur les besoins de ton API POST
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    jobType: "FULL_TIME",
    location: "",
    city: "",
    country: "Burkina Faso", // Valeur par défaut indicative
    salaryMin: "0",
    salaryMax: "0",
    salaryCurrency: "XOF",
    experienceRequired: "0",
    educationLevel: "",
    skillsRequired: "",
    selectedSkillTypeUuid: "", // Lié au sélecteur de secteurs
    applicationDeadline: "",
    startDate: "",
    remoteAllowed: false,
    isUrgent: false,
    recruiterUuid: "3fa85f64-5717-4562-b3fc-2c963f66afa6", // Remplacer par l'ID de l'utilisateur connecté en prod
  });

  // Charger les secteurs d'activité au montage pour alimenter un menu déroulant
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

    // Gestion spécifique pour les cases à cocher (checkboxes)
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Préparation et formatage propre du payload JSON
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
      alert("L'offre d'emploi a été publiée avec succès !");
      router.push("/jobs");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue lors de l'envoi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">Publier une nouvelle offre</h1>

        {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-6">

          {/* Titre */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Titre du poste *
            </label>
            <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                placeholder="ex. : Développeur logiciel senior"
            />
          </div>

          {/* Localisation combinée (Ville & Pays) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                Ville *
              </label>
              <input
                  type="text"
                  id="city"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                  placeholder="ex. : Ouagadougou"
              />
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                Pays *
              </label>
              <input
                  type="text"
                  id="country"
                  name="country"
                  required
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
              />
            </div>
          </div>

          {/* Secteur d'activité dynamique & Type de contrat */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="selectedSkillTypeUuid" className="block text-sm font-medium text-gray-700 mb-2">
                Secteur d'activité *
              </label>
              <select
                  id="selectedSkillTypeUuid"
                  name="selectedSkillTypeUuid"
                  required
                  value={formData.selectedSkillTypeUuid}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
              >
                {skillTypes.map((type) => (
                    <option key={type.uuid} value={type.uuid}>
                      {type.name}
                    </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="jobType" className="block text-sm font-medium text-gray-700 mb-2">
                Type d'emploi *
              </label>
              <select
                  id="jobType"
                  name="jobType"
                  required
                  value={formData.jobType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
              >
                <option value="FULL_TIME">Temps plein</option>
                <option value="PART_TIME">Temps partiel</option>
                <option value="CONTRACT">Contrat</option>
                <option value="INTERNSHIP">Stage</option>
              </select>
            </div>
          </div>

          {/* Salaire Min, Max et Devise */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="salaryMin" className="block text-sm font-medium text-gray-700 mb-2">
                Salaire Minimum
              </label>
              <input
                  type="number"
                  id="salaryMin"
                  name="salaryMin"
                  value={formData.salaryMin}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
              />
            </div>

            <div>
              <label htmlFor="salaryMax" className="block text-sm font-medium text-gray-700 mb-2">
                Salaire Maximum
              </label>
              <input
                  type="number"
                  id="salaryMax"
                  name="salaryMax"
                  value={formData.salaryMax}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
              />
            </div>

            <div>
              <label htmlFor="salaryCurrency" className="block text-sm font-medium text-gray-700 mb-2">
                Devise
              </label>
              <input
                  type="text"
                  id="salaryCurrency"
                  name="salaryCurrency"
                  value={formData.salaryCurrency}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
              />
            </div>
          </div>

          {/* Expérience, Niveau d'études, Compétences clés */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="experienceRequired" className="block text-sm font-medium text-gray-700 mb-2">
                Expérience (ans)
              </label>
              <input
                  type="number"
                  id="experienceRequired"
                  name="experienceRequired"
                  value={formData.experienceRequired}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
              />
            </div>

            <div>
              <label htmlFor="educationLevel" className="block text-sm font-medium text-gray-700 mb-2">
                Niveau d'études requis
              </label>
              <input
                  type="text"
                  id="educationLevel"
                  name="educationLevel"
                  placeholder="ex. : BAC + 3 / Master"
                  value={formData.educationLevel}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
              />
            </div>

            <div>
              <label htmlFor="skillsRequired" className="block text-sm font-medium text-gray-700 mb-2">
                Mots-clés compétences
              </label>
              <input
                  type="text"
                  id="skillsRequired"
                  name="skillsRequired"
                  placeholder="React, SQL, Management"
                  value={formData.skillsRequired}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
              />
            </div>
          </div>

          {/* Date Limite & Date de début */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="applicationDeadline" className="block text-sm font-medium text-gray-700 mb-2">
                Date limite de candidature
              </label>
              <input
                  type="date"
                  id="applicationDeadline"
                  name="applicationDeadline"
                  value={formData.applicationDeadline}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
              />
            </div>

            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Date de début prévue
              </label>
              <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
              />
            </div>
          </div>

          {/* Télétravail & Urgence (Boîtes à cocher) */}
          <div className="flex gap-8 items-center bg-gray-50 p-4 rounded-lg border border-gray-100">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                  type="checkbox"
                  name="remoteAllowed"
                  checked={formData.remoteAllowed}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <span className="text-sm font-medium text-gray-700">Télétravail autorisé</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                  type="checkbox"
                  name="isUrgent"
                  checked={formData.isUrgent}
                  onChange={handleChange}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
              />
              <span className="text-sm font-medium text-red-700 font-semibold">Marquer comme Urgent 🔥</span>
            </label>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description du poste *
            </label>
            <textarea
                id="description"
                name="description"
                required
                rows={6}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                placeholder="Décrivez le poste, les responsabilités..."
            />
          </div>

          {/* Exigences */}
          <div>
            <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-2">
              Exigences détaillées *
            </label>
            <textarea
                id="requirements"
                name="requirements"
                required
                rows={4}
                value={formData.requirements}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
                placeholder="Écrivez les critères indispensables requis pour ce poste..."
            />
          </div>

          {/* Boutons d'actions */}
          <div className="flex gap-4 pt-4">
            <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary/90 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Publication en cours..." : "Publier l'offre d'emploi"}
            </button>
            <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
  );
}