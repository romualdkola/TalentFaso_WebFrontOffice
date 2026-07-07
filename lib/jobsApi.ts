import { apiRequest, getApiUrl } from "./api";
import {JobsResponse, JobsRequestParams, JobOffer, SkillType, DashboardStats} from "@/types/api";
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
    city: offer.city,
    country: offer.country,
    type: jobTypeMap[offer.jobType] || "full-time",
    salary: salary,
    salaryMin: offer.salaryMin > 0 ? offer.salaryMin : undefined,
    salaryMax: offer.salaryMax > 0 ? offer.salaryMax : undefined,
    salaryCurrency: offer.salaryCurrency,
    description: offer.description,
    requirements: requirements,
    postedDate: offer.publishedAt || offer.createdAt,
    deadline: offer.applicationDeadline,
    startDate: offer.startDate,
    featured: offer.isFeatured,
    isUrgent: offer.isUrgent,
    remoteAllowed: offer.remoteAllowed,
    educationLevel: offer.educationLevel,
    experienceRequired: offer.experienceRequired > 0 ? offer.experienceRequired : undefined,
    skillsRequired: offer.skillsRequired,
    viewsCount: offer.viewsCount,
    applicationsCount: offer.applicationsCount,
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
 * Statistiques publiques de repli (route /mobile/offers accessible sans JWT).
 */
async function fetchPublicJobOfferCount(): Promise<number | null> {
  try {
    const response = await fetch(
      getApiUrl("/mobile/offers?page=0&size=1&sort=createdAt,desc")
    );
    if (!response.ok) return null;
    const data: JobsResponse = await response.json();
    return data.totalElements ?? null;
  } catch {
    return null;
  }
}

/**
 * Récupère les statistiques globales pour la page d'accueil.
 * Route admin : GET /admin/stats/dashboard (JWT admin requis).
 * Si 403, repli sur le nombre d'offres via /mobile/offers (public).
 */
export async function fetchDashboardStats(): Promise<DashboardStats | null> {
  const response = await apiRequest("/admin/stats/dashboard", {
    method: "GET",
  });

  if (response.ok) {
    return response.json();
  }

  if (response.status === 403 || response.status === 401) {
    const totalJobOffers = await fetchPublicJobOfferCount();
    if (totalJobOffers !== null) {
      return {
        summary: { totalJobOffers },
      };
    }
    return null;
  }

  throw new Error("Erreur lors de la récupération des statistiques");
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

/* ─── Application (candidature) ─── */

export interface ApplicationPayload {
  jobOfferUuid: string;
  coverLetter?: string;
  resumeFile?: File;
}

export interface ApplicationRecord {
  id: number;
  uuid: string;
  jobOfferUuid: string;
  jobOfferTitle: string;
  jobOfferLocation: string;
  jobOfferCity: string;
  jobOfferApplicationDeadline: string;
  companyName: string;
  recruiterName: string;
  jobSeekerName: string;
  jobSeekerEmail: string;
  status: "PENDING" | "REVIEWED" | "ACCEPTED" | "REJECTED";
  coverLetterUrl: string | null;
  resumeUrl: string | null;
  message: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Soumet une candidature à une offre d'emploi (multipart/form-data).
 * Requiert un JWT valide (job seeker connecté).
 */
export async function submitApplication(payload: ApplicationPayload): Promise<ApplicationRecord> {
  const { getAuthToken, getApiUrl } = await import("./api");
  const token = getAuthToken();
  if (!token) throw new Error("AUTH_REQUIRED");

  const form = new FormData();
  form.append("jobOfferUuid", payload.jobOfferUuid);
  if (payload.coverLetter) form.append("coverLetter", payload.coverLetter);
  if (payload.resumeFile) form.append("resumeFile", payload.resumeFile);

  const response = await fetch(getApiUrl("/mobile/applications"), {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || "Erreur lors de la soumission de la candidature");
  }

  return response.json();
}

/**
 * Récupère les candidatures du job seeker connecté.
 */
export async function fetchMyApplications(
  params: { page?: number; size?: number } = {}
): Promise<{ content: ApplicationRecord[]; totalElements: number; totalPages: number }> {
  const { page = 0, size = 20 } = params;
  const response = await apiRequest(
    `/mobile/applications?page=${page}&size=${size}`,
    { method: "GET" }
  );
  if (!response.ok) throw new Error("Erreur lors du chargement des candidatures");
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