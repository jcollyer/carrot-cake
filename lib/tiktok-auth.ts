import { getTokensCookie } from "@/app/utils/getTokensCookie";
import prisma from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth/next";
import { NextApiRequest, NextApiResponse } from "next";

export const TIKTOK_COOKIE_NAME = "tiktok-tokens";
export const TIKTOK_PROVIDER = "tiktok";

type TikTokTokens = {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  refresh_expires_in?: number;
  open_id?: string;
  scope?: string;
  token_type?: string;
};

function getCookieOptions() {
  return [
    "Path=/",
    "Max-Age=86400",
    "SameSite=Lax",
    process.env.NODE_ENV !== "development" ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

export function buildTikTokCookie(tokens: TikTokTokens) {
  return `${TIKTOK_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(tokens))}; ${getCookieOptions()}`;
}

export function setTikTokCookie(res: NextApiResponse, tokens: TikTokTokens) {
  const nextCookie = buildTikTokCookie(tokens);
  const existing = res.getHeader("Set-Cookie");

  if (!existing) {
    res.setHeader("Set-Cookie", nextCookie);
    return;
  }

  if (Array.isArray(existing)) {
    res.setHeader("Set-Cookie", [...existing, nextCookie]);
    return;
  }

  res.setHeader("Set-Cookie", [String(existing), nextCookie]);
}

function getExpiresAt(expiresIn?: number) {
  if (!expiresIn) {
    return null;
  }

  return Math.floor(Date.now() / 1000) + expiresIn;
}

function getStoredCookieTokens(cookie?: string) {
  try {
    const tokens = getTokensCookie(cookie, TIKTOK_COOKIE_NAME);
    if (!tokens?.access_token) {
      return null;
    }

    return tokens as TikTokTokens;
  } catch {
    return null;
  }
}

export async function refreshTikTokTokens(refreshToken: string) {
  const tokenEndpoint = "https://open.tiktokapis.com/v2/oauth/token/";
  const params = new URLSearchParams({
    client_key: process.env.TIKTOK_CLIENT_KEY_PROD || "",
    client_secret: process.env.TIKTOK_CLIENT_SECRET_PROD || "",
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Cache-Control": "no-cache",
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`TikTok token refresh failed: ${response.status} ${errorText}`);
  }

  return (await response.json()) as TikTokTokens;
}

export async function upsertTikTokAccountTokens(userId: string, tokens: TikTokTokens) {
  const refreshToken = tokens.refresh_token || null;

  return prisma.account.upsert({
    where: {
      provider_providerAccountId: {
        provider: TIKTOK_PROVIDER,
        providerAccountId: userId,
      },
    },
    update: {
      access_token: tokens.access_token,
      refresh_token: refreshToken,
      expires_at: getExpiresAt(tokens.expires_in),
      scope: tokens.scope || null,
      token_type: tokens.token_type || null,
    },
    create: {
      userId,
      type: "oauth",
      provider: TIKTOK_PROVIDER,
      providerAccountId: userId,
      access_token: tokens.access_token,
      refresh_token: refreshToken,
      expires_at: getExpiresAt(tokens.expires_in),
      scope: tokens.scope || null,
      token_type: tokens.token_type || null,
    },
  });
}

export async function getValidTikTokTokens(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const cookieTokens = getStoredCookieTokens(req.headers.cookie);
  if (cookieTokens?.access_token) {
    return cookieTokens;
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session?.user?.id) {
    return null;
  }

  const account = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      provider: TIKTOK_PROVIDER,
    },
  });

  if (!account?.refresh_token) {
    return null;
  }

  const expiresAt = account.expires_at || 0;
  const now = Math.floor(Date.now() / 1000);

  if (account.access_token && expiresAt > now + 300) {
    const tokens = {
      access_token: account.access_token,
      refresh_token: account.refresh_token,
      expires_in: Math.max(expiresAt - now, 0),
      scope: account.scope || undefined,
      token_type: account.token_type || undefined,
    };
    setTikTokCookie(res, tokens);
    return tokens;
  }

  const refreshedTokens = await refreshTikTokTokens(account.refresh_token);
  const mergedTokens = {
    ...refreshedTokens,
    refresh_token: refreshedTokens.refresh_token || account.refresh_token,
  };

  await upsertTikTokAccountTokens(session.user.id, mergedTokens);
  setTikTokCookie(res, mergedTokens);

  return mergedTokens;
}