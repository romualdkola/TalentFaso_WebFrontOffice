"use client";

import { useState, useMemo, useEffect } from "react";
// Importation de useSearchParams pour lire l'URL (?skillType=...)
import { useSearchParams, useRouter } from "next/navigation";
import JobCard from "@/components/JobCard";
import { Job } from "@/types/job";
import { fetchJobs, fetchJobsBySkillType, mapJobOfferToJob, searchJobsFromList } from "@/lib/jobsApi";

export default function JobsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Récupération du paramètre ?skillType=... dans l'URL
  const skillTypeParam = searchParams.get("skillType");

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<Job["type"] | "all">("all");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // On relance le chargement si la page change OU si le secteur dans l'URL change
  useEffect(() => {
    loadJobs();
  }, [currentPage, skillTypeParam]);

  const loadJobs = async () => {
    setLoading(true);
    setError(null);

    try {
      let response;

      // Si un skillType est présent dans l'URL, on appelle l'endpoint ciblé
      if (skillTypeParam) {
        response = await fetchJobsBySkillType(skillTypeParam, {
          page: currentPage,
          size: 20,
        });
      } else {
        // Sinon, comportement classique : on prend toutes les offres
        response = await fetchJobs({
          page: currentPage,
          size: 20,
          sort: ["createdAt,desc"],
        });
      }

      const mappedJobs = response.content.map(mapJobOfferToJob);
      setJobs(mappedJobs);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err) {
      setError(
          err instanceof Error
              ? err.message
              : "Erreur lors du chargement des offres d'emploi"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour réinitialiser complètement la recherche et les filtres d'URL
  const handleClearFilters = () => {
    setSearchQuery("");
    setTypeFilter("all");
    if (skillTypeParam) {
      // Nettoie l'URL en retirant le ?skillType=... sans recharger la page
      router.push("/jobs");
    }
  };

  const filteredJobs = useMemo(() => {
    let filtered = jobs;

    if (searchQuery) {
      filtered = searchJobsFromList(filtered, searchQuery);
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((job) => job.type === typeFilter);
    }

    return filtered;
  }, [searchQuery, typeFilter, jobs]);

  // --- RESTE DU COMPOSANT (AFFICHEUR JSX) ---
  if (loading && jobs.length === 0) {
    return (
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-8">Offres d'emploi</h1>
          <div className="text-center py-12">
            <p className="text-gray-600">Chargement des offres d'emploi...</p>
          </div>
        </div>
    );
  }

  return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">
          {skillTypeParam ? "Offres par secteur" : "Toutes les offres d'emploi"}
        </h1>

        {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-8">
              {error}
            </div>
        )}

        {/* Bannière informative si filtre par secteur actif */}
        {skillTypeParam && (
            <div className="bg-purple-50 border border-purple-200 text-purple-900 px-4 py-3 rounded-lg mb-6 flex justify-between items-center">
              <p className="text-sm font-medium">
                Filtre par secteur d'activité activé.
              </p>
              <button
                  onClick={handleClearFilters}
                  className="text-xs bg-white text-purple-700 font-semibold px-3 py-1.5 rounded-md border border-purple-200 hover:bg-purple-100 transition"
              >
                Afficher tous les secteurs
              </button>
            </div>
        )}

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Rechercher des offres
              </label>
              <input
                  type="text"
                  id="search"
                  placeholder="Rechercher par titre, entreprise, lieu..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                Type d'emploi
              </label>
              <select
                  id="type"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as Job["type"] | "all")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
              >
                <option value="all">Tous types</option>
                <option value="full-time">Temps plein</option>
                <option value="part-time">Temps partiel</option>
                <option value="contract">Contrat</option>
                <option value="internship">Stage</option>
              </select>
            </div>
          </div>

          <p className="text-gray-600">
            Affichage de {filteredJobs.length} sur {totalElements} offres
          </p>
        </div>

        {/* Jobs Grid */}
        {filteredJobs.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {filteredJobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-8">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                        disabled={currentPage === 0 || loading}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Précédent
                    </button>
                    <span className="text-gray-600">
                Page {currentPage + 1} sur {totalPages}
              </span>
                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))}
                        disabled={currentPage >= totalPages - 1 || loading}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                      Suivant
                    </button>
                  </div>
              )}
            </>
        ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <p className="text-gray-600 text-lg mb-4">Aucune offre ne correspond à vos critères.</p>
              <button
                  onClick={handleClearFilters}
                  className="text-primary hover:text-primary/80 font-semibold"
              >
                Effacer les filtres
              </button>
            </div>
        )}
      </div>
  );
}