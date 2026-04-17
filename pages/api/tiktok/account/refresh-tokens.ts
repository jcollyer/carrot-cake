import prisma from "@/lib/prisma";
import { refreshTikTokTokens, TIKTOK_PROVIDER } from "@/lib/tiktok-auth";
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
        provider: TIKTOK_PROVIDER,
        refresh_token: {
          not: null,
        },
      },
      select: {
        id: true,
        refresh_token: true,
      },
    });

    let refreshedCount = 0;

    for (const account of accounts) {
      if (!account.refresh_token) {
        continue;
      }

      try {
        const tokens = await refreshTikTokTokens(account.refresh_token);
        await prisma.account.update({
          where: {
            id: account.id,
          },
          data: {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token || account.refresh_token,
            expires_at: tokens.expires_in
              ? Math.floor(Date.now() / 1000) + tokens.expires_in
              : null,
            scope: tokens.scope || null,
            token_type: tokens.token_type || null,
          },
        });
        refreshedCount += 1;
      } catch (error) {
        console.error("Failed to refresh TikTok account tokens:", error);
      }
    }

    return res.status(200).json({ refreshedCount });
  } catch (error) {
    console.error("Failed to refresh TikTok account token batch:", error);
    return res.status(500).json({ error: "Failed to refresh TikTok account tokens" });
  }
}