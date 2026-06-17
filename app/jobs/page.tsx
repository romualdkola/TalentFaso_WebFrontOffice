"use client";

import { Suspense } from "react";
import JobsPageContent from "./JobsPageContent";

export default function JobsPage() {
  return (
    // Le composant Suspense dit à Next.js : "Génère le reste au chargement client, n'échoue pas au build !"
    <Suspense 
      fallback={
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-gray-550 animate-pulse text-lg text-gray-600">
            Chargement de l'espace emploi Talent Faso...
          </p>
        </div>
      }
    >
      <JobsPageContent />
    </Suspense>
  );
}