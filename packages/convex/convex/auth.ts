import GitHub from "@auth/core/providers/github";
import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";

const GitHubWithToken = GitHub({
  clientId: process.env.AUTH_GITHUB_ID,
  clientSecret: process.env.AUTH_GITHUB_SECRET,
  authorization: {
    params: {
      scope: "read:user user:email repo",
    },
  },
  profile(profile, tokens) {
    return {
      id: String(profile.id),
      name: profile.name ?? profile.login,
      email: profile.email,
      image: profile.avatar_url,
      // Custom fields passed through profile
      githubUsername: profile.login,
      githubId: String(profile.id),
      githubAccessToken: tokens.access_token,
    };
  },
});

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [GitHubWithToken],
  callbacks: {
    async redirect({ redirectTo }) {
      const allowedOrigins = [
        "https://ship.dylansteck.com",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
      ];

      try {
        const urlObj = new URL(redirectTo);
        const isAllowed = allowedOrigins.some(
          (origin) =>
            urlObj.origin === origin ||
            urlObj.origin === new URL(origin).origin,
        );

        if (isAllowed) {
          const cleanUrl = new URL(redirectTo);
          cleanUrl.search = "";
          return cleanUrl.toString();
        }
      } catch {
        // Invalid URL
      }

      return process.env.SITE_URL || "https://ship.dylansteck.com";
    },
    async createOrUpdateUser(ctx, args) {
      const { existingUserId, profile, provider } = args;

      // Log what we receive to debug
      console.log("createOrUpdateUser called with profile keys:", profile ? Object.keys(profile) : "no profile");
      console.log("profile data:", JSON.stringify(profile, null, 2));

      if (provider?.id === "github" && profile) {
        const p = profile as {
          id: string;
          name?: string;
          email?: string;
          image?: string;
          githubUsername?: string;
          githubId?: string;
          githubAccessToken?: string;
        };

        // Store token directly on user record
        const userData = {
          name: p.name ?? "User",
          email: p.email,
          image: p.image,
          githubUsername: p.githubUsername,
          githubId: p.githubId,
          githubAccessToken: p.githubAccessToken, // Store on user
        };

        console.log("userData to save:", JSON.stringify(userData, null, 2));

        if (existingUserId) {
          const user = await ctx.db.get(existingUserId);
          if (user) {
            await ctx.db.patch(existingUserId, userData);
            return existingUserId;
          }
        }

        return await ctx.db.insert("users", userData);
      }

      // Fallback
      if (existingUserId) {
        return existingUserId;
      }
      return await ctx.db.insert("users", {
        name: (profile?.name as string) ?? "User",
        email: profile?.email as string | undefined,
      });
    },
  },
});

export { getAuthUserId };
