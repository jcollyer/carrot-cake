import { NextApiRequest, NextApiResponse } from "next";

const isDev = process.env.NODE_ENV === "development";
const SERVER_ENDPOINT_REDIRECT = isDev
  ? process.env.REDIRECT_URIS_TIKTOK_LOCAL
  : process.env.REDIRECT_URIS_TIKTOK_PROD;

function generateRandomString(length: number): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    result += characters.charAt(array[i] % characters.length);
  }
  return result;
}

function base64urlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const binary = String.fromCharCode(...bytes);
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function generateCodeChallengePair(): Promise<{
  codeVerifier: string;
  codeChallenge: string;
}> {
  const codeVerifier: string = generateRandomString(60);
  const encoder = new TextEncoder();
  const data: Uint8Array = encoder.encode(codeVerifier);
  const hashBuffer: ArrayBuffer = await crypto.subtle.digest("SHA-256", data);
  const codeChallenge: string = base64urlEncode(hashBuffer);
  return { codeVerifier, codeChallenge };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const codes = generateCodeChallengePair().then(
    ({ codeVerifier, codeChallenge }) => {
      return { codeVerifier, codeChallenge };
    }
  );

  const codeVerifier = (await codes).codeVerifier;
  const codeChallenge = (await codes).codeChallenge;

  let url = "https://www.tiktok.com/v2/auth/authorize/";
  let array = new Uint8Array(30);
  const csrfState = crypto.getRandomValues(array);

  url += `?client_key=${process.env.TIKTOK_CLIENT_KEY_SANDBOX}`;
  url += "&scope=user.info.basic,video.list,video.upload,video.publish,user.info.profile,user.info.stats";
  url += "&response_type=code";
  url += `&redirect_uri=${encodeURIComponent(SERVER_ENDPOINT_REDIRECT || "")}`;
  url += `&state=${csrfState}`;
  url += `&code_challenge=${codeChallenge}`;
  url += "&code_challenge_method=S256";
  url += `&disable_auto_auth=1`; // 0 or 1

  res.json({ url: url });
}
