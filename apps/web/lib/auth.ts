import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";

export function useAuth() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signIn, signOut } = useAuthActions();

  const signInWithGitHub = async () => {
    // Clear any stale auth state first
    try {
      await signOut();
    } catch {
      // Ignore errors from signing out when not signed in
    }

    // Clear any stale Convex Auth localStorage state
    if (typeof window !== "undefined") {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes("convex") || key.includes("auth"))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));
    }

    // Use current window location for redirect
    const redirectTo =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://ship.dylansteck.com";

    // signIn redirects automatically to GitHub OAuth
    await signIn("github", { redirectTo });
  };

  return {
    isAuthenticated,
    isLoading,
    signIn: signInWithGitHub,
    signOut,
  };
}
