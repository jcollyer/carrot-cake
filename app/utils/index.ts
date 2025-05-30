export const getTokensCookie = (cookie?: string) => {
  const jsTokenCookie = cookie?.split("; ").find((token) => {
    return token.startsWith("tokens=");
  });
  
  // console.log("cookie----", cookie);
  // console.log("jsTokenCookie------", jsTokenCookie);
  // console.log("decodeURIComponent-----", decodeURIComponent(jsTokenCookie || "[]").split("tokens=")[1]);

  return JSON.parse(
    decodeURIComponent(jsTokenCookie || "[]").split("tokens=")[1]
  );
};
