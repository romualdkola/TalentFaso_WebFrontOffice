import { apiRequest } from "./api";
import {JobsResponse, JobsRequestParams, JobOffer, SkillType} from "@/types/api";
import { Job } from "@/types/job";

export function mapJobOfferToJob(offer: JobOffer): Job {
  const jobTypeMap: Record<string, Job["type"]> = {
    FULL_TIME: "full-time",
    PART_TIME: "part-time",
    CONTRACT: "contract",
    INTERNSHIP: "internship",
  };

  let salary: string | undefined;
  if (offer.salaryMin > 0 || offer.salaryMax > 0) {
    if (offer.salaryMin === offer.salaryMax) {
      salary = `${offer.salaryMax.toLocaleString()} ${offer.salaryCurrency}`;
    } else {
      salary = `${offer.salaryMin.toLocaleString()} - ${offer.salaryMax.toLocaleString()} ${offer.salaryCurrency}`;
    }
  }

  const requirements = offer.requirements
    ? offer.requirements
        .split("\n")
        .map((req) => req.trim())
        .filter((req) => req.length > 0)
    : [];

  const location = offer.city
    ? `${offer.city}, ${offer.country}`
    : offer.location || offer.country;

  return {
    id: offer.uuid,
    title: offer.title,
    company: offer.companyName || offer.recruiterName,
    location: location,
    type: jobTypeMap[offer.jobType] || "full-time",
    salary: salary,
    description: offer.description,
    requirements: requirements,
    postedDate: offer.publishedAt || offer.createdAt,
    deadline: offer.applicationDeadline,
    featured: offer.isFeatured,
  };
}

export async function fetchJobs(
  params: JobsRequestParams = {}
): Promise<JobsResponse> {
  const { page = 0, size = 20, sort = ["createdAt,desc"] } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sort: sort.join(","),
  });

  const response = await apiRequest(`/mobile/offers?${queryParams.toString()}`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des offres d'emploi");
  }

  return response.json();
}

export async function getAllJobsFromAPI(): Promise<Job[]> {
  try {
    const response = await fetchJobs({ page: 0, size: 100, sort: ["createdAt,desc"] });
    return response.content.map(mapJobOfferToJob);
  } catch (error) {
    console.error("Erreur lors de la récupération des offres:", error);
    return [];
  }
}

export async function fetchJobByUuid(uuid: string): Promise<JobOffer> {
  const response = await apiRequest(`/mobile/offers/${uuid}`, {
    method: "GET",
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Offre d'emploi introuvable");
    }
    throw new Error("Erreur lors de la récupération de l'offre d'emploi");
  }

  return response.json();
}

export async function getJobByUuid(uuid: string): Promise<Job | null> {
  try {
    const offer = await fetchJobByUuid(uuid);
    return mapJobOfferToJob(offer);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'offre:", error);
    return null;
  }
}

export function searchJobsFromList(jobs: Job[], query: string): Job[] {
  const lowerQuery = query.toLowerCase();
  return jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(lowerQuery) ||
      job.company.toLowerCase().includes(lowerQuery) ||
      job.location.toLowerCase().includes(lowerQuery) ||
      job.description.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Récupère la liste des types de compétences / secteurs d'activité actifs
 */
export async function fetchActiveSkillTypes(): Promise<SkillType[]> {
  const response = await apiRequest("/admin/skill-types/active", {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des secteurs d'activité");
  }

  return response.json();
}

/**
 * Récupère les statistiques globales pour la page d'accueil
 */
export async function fetchDashboardStats(): Promise<any> {
  const response = await apiRequest("/public/stats/dashboard", {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des statistiques");
  }

  return response.json();
}

/**
 * Récupère les offres filtrées par un skillType (secteur d'activité) spécifique
 */
export async function fetchJobsBySkillType(
    skillTypeUuid: string,
    params: { page?: number; size?: number } = {}
): Promise<JobsResponse> {
  const { page = 0, size = 20 } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sort: "createdAt,desc", // Tri par défaut
  });

  const response = await apiRequest(`/mobile/offers/by-skill/${skillTypeUuid}?${queryParams.toString()}`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Erreur lors de la récupération des offres de ce secteur");
  }

  return response.json();
}

/**
 * Soumet une nouvelle offre d'emploi au serveur
 */
export async function createJobOffer(offerData: {
  title: string;
  description: string;
  requirements: string;
  jobType: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP";
  location: string;
  city: string;
  country: string;
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: string;
  experienceRequired: number;
  educationLevel: string;
  skillsRequired: string;
  skillTypeUuids: string[];
  applicationDeadline: string | null;
  startDate: string | null;
  remoteAllowed: boolean;
  isUrgent: boolean;
  recruiterUuid: string;
}): Promise<any> {
  const response = await apiRequest("/mobile/offers", {
    method: "POST",
    body: JSON.stringify(offerData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erreur lors de la création de l'offre");
  }

  return response.json();
}