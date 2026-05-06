export const runtime = "edge";
const baseUrl = process.env.BASE_URL || "http://localhost:3000";

export default async function GET(req: Request) {
  if (
    req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Refresh long-lived tokens stored on the Account table (this is what
    // keeps connected users from having to manually reconnect every 60 days).
    const refreshedAccountsResponse = await fetch(
      `${baseUrl}/api/instagram/account/refresh-tokens`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.CRON_SECRET}`,
        },
      },
    );

    if (!refreshedAccountsResponse.ok) {
      console.error(
        "Failed to refresh Instagram account tokens:",
        await refreshedAccountsResponse.text(),
      );
    }

    // 2. Refresh the access token stored on each pending InstagramVideos row
    // so the post-videos cron always has a fresh long-lived token to publish
    // with. Instagram has only one token (long-lived access token), which is
    // refreshed via ig_refresh_token to produce a new long-lived token.
    const instagramVideos = await fetch(
      `${baseUrl}/api/instagram/schedule-videos/get-all`,
    );
    const instagramVideosData = await instagramVideos.json();
    const videos = instagramVideosData.videos || [];

    if (!videos.length) {
      console.log("No videos to refresh token for");
    }

    for (const video of videos) {
      if (!video.accessToken) {
        continue;
      }

      const url = `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(video.accessToken)}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response from Instagram:", errorText);
        continue;
      }

      const tokens = await response.json();

      // Write the new long-lived token back to the video row.
      await fetch(`${baseUrl}/api/instagram/schedule-videos/update-tokens`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoUrl: video.videoUrl,
          accessToken: tokens.access_token,
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
