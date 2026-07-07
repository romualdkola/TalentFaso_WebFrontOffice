"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Eye, EyeOff } from "lucide-react";
import { getApiUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    setError(null);
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.fullName.trim()) errors.fullName = "Le nom complet est requis.";
    if (!formData.email.trim()) errors.email = "L'adresse email est requise.";
    else if (!emailRe.test(formData.email.trim())) errors.email = "Veuillez saisir une adresse email valide.";
    if (!formData.password) errors.password = "Le mot de passe est requis.";
    else if (formData.password.length < 8) errors.password = "Le mot de passe doit contenir au moins 8 caractères.";
    if (!formData.confirmPassword) errors.confirmPassword = "Veuillez confirmer votre mot de passe.";
    else if (formData.password !== formData.confirmPassword) errors.confirmPassword = "Les mots de passe ne correspondent pas.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(getApiUrl("/mobile/auth/register"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName.trim(),
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          phoneNumber: formData.phoneNumber.trim() || undefined,
          accountType: "JOB_SEEKER",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const detail = data.details
          ? Object.values(data.details).join(", ")
          : data.message;
        throw new Error(detail || "Erreur lors de l'inscription.");
      }

      // Auto-login after registration
      const loginRes = await fetch(getApiUrl("/mobile/auth/login"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      if (loginRes.ok) {
        const loginData = await loginRes.json();
        if (loginData.token) {
          localStorage.setItem("authToken", loginData.token);
          if (loginData.refreshToken) localStorage.setItem("refreshToken", loginData.refreshToken);
          localStorage.setItem(
            "user",
            JSON.stringify({
              id: loginData.id,
              uuid: loginData.uuid,
              email: loginData.email,
              fullName: loginData.fullName,
              role: loginData.role,
              isPremium: loginData.isPremium,
            })
          );
          window.dispatchEvent(new Event("authChange"));
        }
      }

      router.push("/jobs");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur s'est produite.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto size-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <UserPlus className="size-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Créer un compte</CardTitle>
          <CardDescription>
            Rejoignez TalentFaso et accédez à toutes les offres
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div className="space-y-1.5">
              <label htmlFor="fullName" className="text-sm font-medium">
                Nom complet *
              </label>
              <Input
                id="fullName"
                name="fullName"
                required
                aria-required="true"
                aria-invalid={!!fieldErrors.fullName}
                aria-describedby={fieldErrors.fullName ? "fullName-error" : undefined}
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Jean Dupont"
                autoComplete="name"
              />
              {fieldErrors.fullName && (
                <p id="fullName-error" className="text-xs font-medium text-destructive">
                  {fieldErrors.fullName}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium">
                Adresse email *
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                aria-required="true"
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? "email-error" : undefined}
                value={formData.email}
                onChange={handleChange}
                placeholder="vous@example.com"
                autoComplete="email"
              />
              {fieldErrors.email && (
                <p id="email-error" className="text-xs font-medium text-destructive">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="phoneNumber" className="text-sm font-medium">
                Téléphone (optionnel)
              </label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                aria-describedby="phone-help"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="+226 70 00 00 00"
                autoComplete="tel"
              />
              <p id="phone-help" className="text-xs text-muted-foreground">
                Format international recommandé, ex. +226 70 00 00 00.
              </p>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium">
                Mot de passe *
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  aria-required="true"
                  aria-invalid={!!fieldErrors.password}
                  aria-describedby={fieldErrors.password ? "password-error password-help" : "password-help"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 8 caractères"
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {fieldErrors.password ? (
                <p id="password-error" className="text-xs font-medium text-destructive">
                  {fieldErrors.password}
                </p>
              ) : (
                <p id="password-help" className="text-xs text-muted-foreground">
                  Au moins 8 caractères.
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirmer le mot de passe *
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                required
                aria-required="true"
                aria-invalid={!!fieldErrors.confirmPassword}
                aria-describedby={fieldErrors.confirmPassword ? "confirmPassword-error" : undefined}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Répétez votre mot de passe"
                autoComplete="new-password"
              />
              {fieldErrors.confirmPassword && (
                <p id="confirmPassword-error" className="text-xs font-medium text-destructive">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            {error && (
              <Alert variant="destructive" role="alert">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Création en cours…" : "Créer mon compte"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center text-sm text-muted-foreground">
          Déjà un compte ?{" "}
          <Link
            href="/login"
            className="ml-1 font-medium text-primary hover:text-primary/80 focus-visible:outline-none focus-visible:underline"
          >
            Se connecter
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
