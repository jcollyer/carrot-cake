import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { accessToken, igUserId, videoUrl, videoType, videoCaption } = req.body;
  try {
    // Step 1: Create a media container
    const containerCreationUrl = `https://graph.instagram.com/v23.0/${igUserId}/media?access_token=${accessToken}`;
    const containerCreationResponse = await fetch(containerCreationUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        video_url: videoUrl,
        caption: videoCaption,
        media_type: videoType.toUpperCase(),
      }),
    });
    const containerCreationData = await containerCreationResponse.json();
    const creation_id = containerCreationData.id;

    if (!creation_id) {
      throw new Error("Failed to create media container.");
    }

    // Step 2: Poll for container status
    let status_code = "";
    while (status_code !== "FINISHED") {
      const statusCheckUrl = `https://graph.instagram.com/v23.0/${creation_id}?fields=status_code&access_token=${accessToken}`;
      const statusCheckResponse = await fetch(statusCheckUrl);
      const statusCheckData = await statusCheckResponse.json();
      status_code = statusCheckData.status_code;
      console.log("Current status code:", status_code);
      if (status_code === "ERROR") {
        status_code = "FINISHED"; // Stop polling on error
        throw new Error("Error in media container creation: " + statusCheckData.error.message);
      }
      if (status_code !== "FINISHED") {
        await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait 5 seconds before re-checking
      }
    }

    // Step 3: Publish the media container
    const publishUrl = `https://graph.instagram.com/v23.0/${igUserId}/media_publish?access_token=${accessToken}`;
    const publishResponse = await fetch(publishUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        creation_id: creation_id,
      }),
    });
    const publishData = await publishResponse.json();
    console.log("Publish response:-------", publishData);

    if (publishData.id) {
      console.log("Video published successfully! Post ID:", publishData.id);
    } else {
      console.error("Failed to publish video:", publishData);
    }
  } catch (error) {
    console.error("Error posting video:", error);
  }

  res.status(200).json({ message: "Video posted successfully" });
}
