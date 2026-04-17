export const runtime = "edge";
const baseUrl = process.env.BASE_URL || "http://localhost:3000";

export default async function GET(req: Request, res: Response) {
  if (
    req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const refreshedAccountsResponse = await fetch(
      `${baseUrl}/api/tiktok/account/refresh-tokens`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.CRON_SECRET}`,
        },
      },
    );

    if (!refreshedAccountsResponse.ok) {
      console.error(
        "Failed to refresh TikTok account tokens:",
        await refreshedAccountsResponse.text(),
      );
    }

    const tiktokVideos = await fetch(
      `${baseUrl}/api/tiktok/schedule-videos/get-all`,
    );
    const tiktokVideosData = await tiktokVideos.json();
    const videos = tiktokVideosData.videos || [];

    if (!videos.length) {
      console.log("No videos to refresh token for");
    }
    for (const video of videos) {
      const tokenEndpoint = "https://open.tiktokapis.com/v2/oauth/token/";
      const params = {
        client_key: process.env.TIKTOK_CLIENT_KEY_PROD,
        client_secret: process.env.TIKTOK_CLIENT_SECRET_PROD,
        grant_type: "refresh_token",
        refresh_token: video.refreshToken,
      };
      const body = new URLSearchParams(
        params as Record<string, string>,
      ).toString();

      const response = await fetch(tokenEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Cache-Control": "no-cache",
        },
        body: body,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response from TikTok:", errorText);
      }
      const tokens = await response.json();

      // Update the tokens in the database
      await fetch(`${baseUrl}/api/tiktok/schedule-videos/update-tokens`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoUrl: video.videoUrl,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
        }),
      });
    }
  } catch (error: any) {
    console.error("Error during callback:", error?.error_description || error);
  }

  return Response.json({
    message: `Cron job executed successfully, updating tokens for videos and accounts`,
  });
}
