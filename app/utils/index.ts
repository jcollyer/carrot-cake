export const getTokensCookie = (cookie?: string) => {
  const jsTokenCookie = cookie?.split("; ").find((token) => {
    return token.startsWith("tokens=");
  });

  return JSON.parse(
    decodeURIComponent(jsTokenCookie || "[]").split("tokens=")[1]
  );
};
