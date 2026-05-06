import { getTokensCookie } from "@/app/utils/getTokensCookie";
import prisma from "@/lib/prisma";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth/next";
import { NextApiRequest, NextApiResponse } from "next";

export const IG_COOKIE_NAME = "ig-access-token";
export const IG_PROVIDER = "instagram";

export type InstagramTokens = {
  access_token: string;
  // Instagram does not issue a separate refresh_token. The long-lived
  // access_token is what gets exchanged for a new long-lived access_token via
  // the ig_refresh_token grant. We mirror it onto refresh_token for parity
  // with the TikTok token shape used elsewhere in the codebase.
  refresh_token?: string;
  expires_in?: number;
  user_id?: string;
  token_type?: string;
};

function getCookieOptions(maxAgeSeconds?: number) {
  // Default to 60 days (the lifetime of an Instagram long-lived token) if the
  // upstream API didn't return an expires_in.
  const maxAge = maxAgeSeconds && maxAgeSeconds > 0 ? maxAgeSeconds : 5184000;
  return [
    "Path=/",
    `Max-Age=${maxAge}`,
    "SameSite=Lax",
    process.env.NODE_ENV !== "development" ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

export function buildInstagramCookie(tokens: InstagramTokens) {
  // Keep the cookie shape backwards-compatible with the existing readers
  // (access_token + user_id) but also persist refresh_token + expires_in so
  // any future client-side code can read them.
  const payload = {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token || tokens.access_token,
    user_id: tokens.user_id || "",
    expires_in: tokens.expires_in || 0,
  };
  return `${IG_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(payload))}; ${getCookieOptions(tokens.expires_in)}`;
}

export function setInstagramCookie(res: NextApiResponse, tokens: InstagramTokens) {
  const nextCookie = buildInstagramCookie(tokens);
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

function getStoredCookieTokens(cookie?: string): InstagramTokens | null {
  try {
    const tokens = getTokensCookie(cookie, IG_COOKIE_NAME);
    if (!tokens?.access_token) {
      return null;
    }

    return tokens as InstagramTokens;
  } catch {
    return null;
  }
}

export async function refreshInstagramToken(accessToken: string) {
  const url = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(accessToken)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Cache-Control": "no-cache",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Instagram token refresh failed: ${response.status} ${errorText}`,
    );
  }

  const data = (await response.json()) as {
    access_token: string;
    token_type?: string;
    expires_in?: number;
  };

  // Normalize to the InstagramTokens shape used elsewhere. Refresh endpoint
  // does not return user_id; callers are expected to preserve it from the
  // existing record.
  return {
    access_token: data.access_token,
    refresh_token: data.access_token,
    expires_in: data.expires_in,
    token_type: data.token_type,
  } as InstagramTokens;
}

export async function upsertInstagramAccountTokens(
  userId: string,
  tokens: InstagramTokens,
  igUserId: string,
) {
  const refreshToken = tokens.refresh_token || tokens.access_token;

  return prisma.account.upsert({
    where: {
      provider_providerAccountId: {
        provider: IG_PROVIDER,
        providerAccountId: igUserId,
      },
    },
    update: {
      access_token: tokens.access_token,
      refresh_token: refreshToken,
      expires_at: getExpiresAt(tokens.expires_in),
      token_type: tokens.token_type || null,
    },
    create: {
      userId,
      type: "oauth",
      provider: IG_PROVIDER,
      providerAccountId: igUserId,
      access_token: tokens.access_token,
      refresh_token: refreshToken,
      expires_at: getExpiresAt(tokens.expires_in),
      token_type: tokens.token_type || null,
    },
  });
}

export async function getValidInstagramTokens(
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
      provider: IG_PROVIDER,
    },
  });

  if (!account?.access_token) {
    return null;
  }

  const expiresAt = account.expires_at || 0;
  const now = Math.floor(Date.now() / 1000);

  // 24h buffer: Instagram requires the long-lived token to be at least 24h
  // old before it can be refreshed, so refresh comfortably ahead of expiry
  // (60 days) but never on a brand new token.
  if (account.access_token && expiresAt > now + 86400) {
    const tokens: InstagramTokens = {
      access_token: account.access_token,
      refresh_token: account.refresh_token || account.access_token,
      expires_in: Math.max(expiresAt - now, 0),
      user_id: account.providerAccountId,
      token_type: account.token_type || undefined,
    };
    setInstagramCookie(res, tokens);
    return tokens;
  }

  const refreshed = await refreshInstagramToken(account.access_token);
  const merged: InstagramTokens = {
    ...refreshed,
    user_id: account.providerAccountId,
  };

  await upsertInstagramAccountTokens(
    session.user.id,
    merged,
    account.providerAccountId,
  );
  setInstagramCookie(res, merged);

  return merged;
}
