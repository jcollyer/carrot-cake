export const getTokensCookie = (cookies?: string, cookie?: string) => {
  const jsTokenCookie = cookies?.split("; ").find((token) => {
    return token.startsWith(`${cookie}=`);
  });

  return JSON.parse(
    decodeURIComponent(jsTokenCookie || "[]").split(`${cookie}=`)[1]
  );
};
