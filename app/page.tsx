"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import JobCard from "@/components/JobCard";
import {fetchActiveSkillTypes, fetchDashboardStats, fetchJobs, mapJobOfferToJob} from "@/lib/jobsApi";
import { Job } from "@/types/job";

export default function Home() {
  const [featuredJobs, setFeaturedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);

  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      setLoading(true);
      setLoadingCats(true);

      // 1. Chargement des offres en vedette
      try {
        const response = await fetchJobs({ page: 0, size: 6, sort: ["createdAt,desc"] });
        const jobs = response.content.map(mapJobOfferToJob).slice(0, 6);
        setFeaturedJobs(jobs);
      } catch (error) {
        console.error("Erreur offres:", error);
      } finally {
        setLoading(false);
      }

      // 2. Chargement des vrais secteurs d'activité
      try {
        const activeCats = await fetchActiveSkillTypes();
        setCategories(activeCats.slice(0, 8)); // On prend les 8 premiers pour l'affichage
      } catch (error) {
        console.error("Erreur catégories:", error);
      } finally {
        setLoadingCats(false);
      }

    // 3. Statistiques réelles
    try {
      const data = await fetchDashboardStats();
      setStats(data);
    } catch (error) {
      console.error("Erreur stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

    loadHomeData();
  }, []);

  return (
      <div className="flex flex-col min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary to-purple-600 text-white py-20 shadow-inner">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-5xl font-bold mb-6 tracking-tight">
                Trouvez votre emploi de rêve au Burkina Faso
              </h1>
              <p className="text-xl mb-8 text-purple-100 max-w-2xl mx-auto">
                Découvrez des opportunités passionnantes et connectez-vous avec les meilleurs employeurs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {/* Bouton Principal (Plein) */}
                <Link
                    href="/jobs"
                    className="w-full sm:w-auto text-center bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:opacity-95 active:scale-95 transition shadow-lg"
                >
                  Parcourir les offres
                </Link>

                {/* Bouton Secondaire (Bordure) */}
                <Link
                    href="/jobs/new"
                    className="w-full sm:w-auto text-center bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary active:scale-95 transition"
                >
                  Publier une offre
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Placer cette section juste après le Hero et avant les Offres en vedette */}
        <section className="bg-white border-b border-gray-100 py-8 min-h-[100px] flex items-center">
          <div className="container mx-auto px-4">
            {loadingStats ? (
                <div className="flex justify-center items-center w-full py-4">
                  <p className="text-gray-400 text-sm animate-pulse">Mise à jour des statistiques...</p>
                </div>
            ) : stats ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                  {/* Offres d'emploi */}
                  <div>
                    <p className="text-3xl md:text-4xl font-extrabold text-primary">
                      {stats.totalJobOffers?.toLocaleString() || 0}
                    </p>
                    <p className="text-sm text-gray-500 font-medium mt-1">Offres d'emploi</p>
                  </div>

                  {/* Candidats */}
                  <div>
                    <p className="text-3xl md:text-4xl font-extrabold text-purple-600">
                      {stats.totalCandidates?.toLocaleString() || 0}
                    </p>
                    <p className="text-sm text-gray-500 font-medium mt-1">Candidats inscrits</p>
                  </div>

                  {/* Entreprises */}
                  <div>
                    <p className="text-3xl md:text-4xl font-extrabold text-green-600">
                      {stats.partnerCompanies?.toLocaleString() || 0}
                    </p>
                    <p className="text-sm text-gray-500 font-medium mt-1">Entreprises partenaires</p>
                  </div>

                  {/* Candidatures Total */}
                  <div>
                    <p className="text-3xl md:text-4xl font-extrabold text-amber-500">
                      {stats.totalApplications?.toLocaleString() || 0}
                    </p>
                    <p className="text-sm text-gray-500 font-medium mt-1">Candidatures envoyées</p>
                  </div>
                </div>
            ) : (
                // Sécurité si l'API échoue : on remet des chiffres indicatifs propres
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center opacity-80">
                  <div>
                    <p className="text-3xl md:text-4xl font-extrabold text-primary">+100</p>
                    <p className="text-sm text-gray-500 font-medium mt-1">Offres disponibles</p>
                  </div>
                  <div>
                    <p className="text-3xl md:text-4xl font-extrabold text-purple-600">+1 000</p>
                    <p className="text-sm text-gray-500 font-medium mt-1">Candidats</p>
                  </div>
                  <div>
                    <p className="text-3xl md:text-4xl font-extrabold text-green-600">+50</p>
                    <p className="text-sm text-gray-500 font-medium mt-1">Partenaires</p>
                  </div>
                  <div>
                    <p className="text-3xl md:text-4xl font-extrabold text-amber-500">En direct</p>
                    <p className="text-sm text-gray-500 font-medium mt-1">Recrutement actif</p>
                  </div>
                </div>
            )}
          </div>
        </section>


        <section className="bg-gray-50 py-12 border-b border-gray-150">
          <div className="container mx-auto px-4 text-center">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-6">
              Ils nous font confiance pour leurs recrutements
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all">
              {/* Tu pourras remplacer ces textes par des composants <Image /> de logos réels */}
              <span className="text-xl font-bold text-gray-700">Orange BF</span>
              <span className="text-xl font-bold text-gray-700">Moov Africa</span>
              <span className="text-xl font-bold text-gray-700">Coris Bank</span>
              <span className="text-xl font-bold text-gray-700">Sonabhy</span>
              <span className="text-xl font-bold text-gray-700">Burkina Startup</span>
            </div>
          </div>
        </section>

        {/* Section Explorer par secteur (Connectée à l'API) */}
        <section className="bg-white py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Explorer par secteur</h2>
              <p className="text-gray-500">Trouvez des opportunités spécifiques à votre domaine d'expertise</p>
            </div>

            {loadingCats ? (
                <div className="text-center py-8">
                  <p className="text-gray-400 animate-pulse">Chargement des secteurs...</p>
                </div>
            ) : categories.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {categories.map((cat) => (
                      <Link
                          key={cat.uuid}
                          href={`/jobs?skillType=${cat.uuid}`}
                          className="p-5 border border-gray-100 rounded-xl bg-gray-50/50 hover:bg-white hover:border-primary hover:shadow-md transition group text-left flex flex-col justify-between"
                      >
                        <div>
                          {/* Affichage de l'icône de l'API ou d'une mallette par défaut */}
                          <div className="text-2xl mb-3 bg-purple-50 w-10 h-10 rounded-lg flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                            {cat.iconUrl ? (
                                <img src={cat.iconUrl} alt="" className="w-6 h-6 object-contain" />
                            ) : (
                                <span className="text-xl">💼</span>
                            )}
                          </div>
                          <h4 className="font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
                            {cat.name}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                            {cat.description || "Découvrir les offres d'emploi disponibles dans ce domaine."}
                          </p>
                        </div>
                      </Link>
                  ))}
                </div>
            ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">Aucun secteur disponible pour le moment.</p>
                </div>
            )}
          </div>
        </section>

          <section className="bg-gradient-to-br from-gray-900 to-purple-950 text-white py-16">
              <div className="container mx-auto px-4 max-w-4xl text-center">
                  <h2 className="text-3xl font-bold mb-4">Ne ratez plus aucune opportunité</h2>
                  <p className="text-purple-200 mb-8 max-w-xl mx-auto">
                      Recevez chaque semaine le top des offres d'emploi vérifiées au Burkina Faso directement dans votre boîte mail.
                  </p>
                  <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
                      <input
                          type="email"
                          placeholder="Votre adresse email"
                          className="px-4 py-3 rounded-lg text-gray-900 bg-white w-full focus:outline-none focus:ring-2 focus:ring-purple-400"
                          required
                      />
                      <button
                          type="submit"
                          className="bg-primary text-white font-semibold px-6 py-3 rounded-lg hover:bg-opacity-90 active:scale-95 transition whitespace-nowrap"
                      >
                          S'abonner aux alertes
                      </button>
                  </form>
              </div>
          </section>


        {/* Featured Jobs Section (Style Sombre & Épuré) */}
        <section className="bg-gray-900 text-white py-16 border-t border-gray-800">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-3xl font-bold tracking-tight">Offres d'emploi en vedette</h2>
              <Link
                  href="/jobs"
                  className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 transition-transform hover:translate-x-1"
              >
                Voir tout <span>→</span>
              </Link>
            </div>

            {loading ? (
                <div className="text-center py-12">
                  {/* Correction de la couleur pour le fond sombre */}
                  <p className="text-gray-400 text-lg animate-pulse">Chargement des offres d'emploi...</p>
                </div>
            ) : featuredJobs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredJobs.map((job) => (
                      <JobCard key={job.id} job={job} />
                  ))}
                </div>
            ) : (
                <div className="text-center py-12">
                  {/* Correction de la couleur pour le fond sombre */}
                  <p className="text-gray-400 text-lg">Aucune offre d'emploi disponible pour le moment.</p>
                </div>
            )}
          </div>
        </section>

        {/* Features Section (Contrastes revus pour l'accessibilité) */}
        <section className="bg-white py-20 border-t border-gray-100">
          <div className="container mx-auto px-4">
            {/* Titre passé en text-gray-900 pour donner de la force */}
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-16 tracking-tight">
              Pourquoi choisir Talent Faso ?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

              {/* Feature 1 */}
              <div className="text-center flex flex-col items-center group">
                <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm transition-colors group-hover:bg-blue-100">
                  <svg
                      className="w-8 h-8 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                  >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Emplois de qualité</h3>
                <p className="text-gray-650 max-w-sm leading-relaxed text-gray-600">
                  Parcourez des offres d'emploi vérifiées provenant d'employeurs de confiance au Burkina.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="text-center flex flex-col items-center group">
                <div className="bg-purple-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm transition-colors group-hover:bg-purple-100">
                  <svg
                      className="w-8 h-8 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                  >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Candidature facile</h3>
                <p className="text-gray-650 max-w-sm leading-relaxed text-gray-600">
                  Postulez rapidement en quelques clics grâce à notre processus de candidature ultra-simplifié.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="text-center flex flex-col items-center group">
                <div className="bg-green-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm transition-colors group-hover:bg-green-100">
                  <svg
                      className="w-8 h-8 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                  >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Réponse rapide</h3>
                <p className="text-gray-650 max-w-sm leading-relaxed text-gray-600">
                  Recevez des retours rapides des recruteurs et suivez l'avancement de vos dossiers en temps réel.
                </p>
              </div>

            </div>
          </div>
        </section>
      </div>
  );
}