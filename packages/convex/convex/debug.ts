import { query } from "./_generated/server";

export const checkAuthAccount = query({
  args: {},
  handler: async (ctx) => {
    const accounts = await ctx.db.query("authAccounts").collect();
    return accounts.map((a) => ({
      id: a._id,
      provider: a.provider,
      hasAccessToken: !!a.accessToken,
      accessTokenLength: a.accessToken?.length ?? 0,
    }));
  },
});
