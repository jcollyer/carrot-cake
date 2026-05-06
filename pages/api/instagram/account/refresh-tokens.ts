import prisma from "@/lib/prisma";
import { refreshInstagramToken, IG_PROVIDER } from "@/lib/instagram-auth";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const accounts = await prisma.account.findMany({
      where: {
        provider: IG_PROVIDER,
        access_token: {
          not: null,
        },
      },
      select: {
        id: true,
        access_token: true,
        expires_at: true,
      },
    });

    let refreshedCount = 0;
    const now = Math.floor(Date.now() / 1000);

    for (const account of accounts) {
      if (!account.access_token) {
        continue;
      }

      // Instagram requires the long-lived token to be at least 24h old
      // before it can be refreshed; if the token was issued less than a day
      // before its expires_at minus 60 days, the refresh call will fail.
      // In practice we only refresh when the token is approaching expiry
      // (within ~7 days) — this is the spot where the cron actually keeps
      // the user logged in.
      const expiresAt = account.expires_at || 0;
      const sevenDays = 7 * 24 * 60 * 60;
      if (expiresAt > now + sevenDays) {
        continue;
      }

      try {
        const tokens = await refreshInstagramToken(account.access_token);
        await prisma.account.update({
          where: {
            id: account.id,
          },
          data: {
            access_token: tokens.access_token,
            refresh_token: tokens.access_token,
            expires_at: tokens.expires_in
              ? Math.floor(Date.now() / 1000) + tokens.expires_in
              : null,
            token_type: tokens.token_type || null,
          },
        });
        refreshedCount += 1;
      } catch (error) {
        console.error("Failed to refresh Instagram account tokens:", error);
      }
    }

    return res.status(200).json({ refreshedCount });
  } catch (error) {
    console.error("Failed to refresh Instagram account token batch:", error);
    return res
      .status(500)
      .json({ error: "Failed to refresh Instagram account tokens" });
  }
}
