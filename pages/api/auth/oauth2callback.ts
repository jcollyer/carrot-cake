import { oauth } from "@/pages/api/youtube/connect-yt";
import { Request, Response } from "express";

export default async function handler(req: Request, res: Response) {
  const queryString = req.url.split("?")[1];
  const code = new URLSearchParams(queryString).get("code") || "";

  // Get the tokens
  oauth.getToken(code, async (err: any, tokens: string) => {
    if (err) {
      console.log("err");
      return;
    }

    // Set the credentials
    oauth.setCredentials(tokens);

    // Set the tokens in a cookie
    res.setHeader(
      "Set-Cookie",
      `tokens=${encodeURIComponent(JSON.stringify(tokens))}; Path=/`
    );

    // Hack to close the window
    res.send("<script>window.parent.location.reload(); window.close();</script>");
  });
}
