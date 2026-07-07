"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getApiUrl } from "@/lib/api";
import { LoginResponse } from "@/types/auth";
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

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    setError(null);
  };

  const validate = () => {
    const errors: { email?: string; password?: string } = {};
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) errors.email = "L'adresse email est requise.";
    else if (!emailRe.test(formData.email.trim())) errors.email = "Veuillez saisir une adresse email valide.";
    if (!formData.password) errors.password = "Le mot de passe est requis.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const loginUrl = getApiUrl("/mobile/auth/login");
      const response = await fetch(loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: "Erreur de connexion. Veuillez vérifier vos identifiants.",
        }));
        throw new Error(errorData.message || "Erreur de connexion");
      }

      const data: LoginResponse = await response.json();

      if (data.token) {
        localStorage.setItem("authToken", data.token);
      }

      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }

      const userData = {
        id: data.id,
        uuid: data.uuid,
        email: data.email,
        fullName: data.fullName,
        role: data.role,
        isPremium: data.isPremium,
      };
      localStorage.setItem("user", JSON.stringify(userData));

      window.dispatchEvent(new Event("authChange"));
      router.push("/");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur s'est produite lors de la connexion. Veuillez réessayer."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Connexion</CardTitle>
          <CardDescription>
            Ou{" "}
            <Link
              href="/jobs"
              className="font-medium text-primary hover:text-primary/80 focus-visible:outline-none focus-visible:underline"
            >
              continuez sans compte
            </Link>
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email *
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                aria-required="true"
                aria-invalid={!!fieldErrors.email}
                aria-describedby={fieldErrors.email ? "email-error" : undefined}
                value={formData.email}
                onChange={handleChange}
                placeholder="Entrez votre email..."
              />
              {fieldErrors.email && (
                <p id="email-error" className="text-xs font-medium text-destructive">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Mot de passe *
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                aria-required="true"
                aria-invalid={!!fieldErrors.password}
                aria-describedby={fieldErrors.password ? "password-error" : undefined}
                value={formData.password}
                onChange={handleChange}
                placeholder="Entrez votre mot de passe..."
              />
              {fieldErrors.password && (
                <p id="password-error" className="text-xs font-medium text-destructive">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {error && (
              <Alert variant="destructive" role="alert">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="text-sm">
              <Link
                href="#"
                className="font-medium text-primary hover:text-primary/80 focus-visible:outline-none focus-visible:underline"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Connexion en cours..." : "Se connecter"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center text-sm text-muted-foreground">
          Pas encore de compte ?{" "}
          <Link
            href="/register"
            className="ml-1 font-medium text-primary hover:text-primary/80 focus-visible:outline-none focus-visible:underline"
          >
            S&apos;inscrire
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
