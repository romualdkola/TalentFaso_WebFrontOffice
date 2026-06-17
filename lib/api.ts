export const getApiBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_API_URL || 'https://api.grapeit.tech/api/v1';
};

export const getApiUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  
  if (baseUrl) {
    const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    return `${cleanBaseUrl}/${cleanEndpoint}`;
  }
  
  return `/${cleanEndpoint}`;
};

export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("authToken") || localStorage.getItem("access_token");
};

export const getRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refreshToken");
};

export const getUser = () => {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return getAuthToken() !== null;
};

export const logout = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("authToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

export const refreshAuthToken = async (): Promise<boolean> => {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    return false;
  }

  try {
    const refreshUrl = getApiUrl("/api/v1/mobile/auth/refresh");
    const response = await fetch(refreshUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refreshToken: refreshToken,
      }),
    });

    if (!response.ok) {
      // Tenter de lire la réponse d'erreur si disponible
      try {
        const errorData = await response.json();
        console.error("Erreur lors du rafraîchissement du token:", errorData);
      } catch {
        // Si la réponse n'est pas du JSON, ignorer
      }
      return false;
    }

    const data = await response.json();
    
    if (data.token) {
      localStorage.setItem("authToken", data.token);
      
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }
      
      window.dispatchEvent(new Event("authChange"));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Erreur lors du rafraîchissement du token:", error);
    return false;
  }
};

export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {},
  retryOn401: boolean = true
): Promise<Response> => {
  const token = getAuthToken();
  const url = getApiUrl(endpoint);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response = await fetch(url, {
    ...options,
    headers,
  });

  // Si la réponse est 401 (Non autorisé) et que retryOn401 est activé, essayer de rafraîchir le token
  if (response.status === 401 && retryOn401 && token) {
    const refreshed = await refreshAuthToken();
    
    if (refreshed) {
      // Réessayer la requête avec le nouveau token
      const newToken = getAuthToken();
      if (newToken) {
        headers["Authorization"] = `Bearer ${newToken}`;
        response = await fetch(url, {
          ...options,
          headers,
        });
      }
    } else {
      // Si le refresh échoue, déconnecter l'utilisateur
      logout();
      window.dispatchEvent(new Event("authChange"));
      window.location.href = "/login";
    }
  }

  return response;
};
