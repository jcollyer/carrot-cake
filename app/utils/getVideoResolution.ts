import { text } from "stream/consumers";

type VideoResolution =
  | "8K"
  | "4K"
  | "1440P"
  | "1080P"
  | "720P"
  | "480P"
  | "360P"
  | "Unknown";

export function getResolution(width: number, height: number): VideoResolution {
  if (!width || !height) return "Unknown";

  // Normalize so portrait videos still classify correctly
  const longSide = Math.max(width, height);
  const shortSide = Math.min(width, height);

  // Ranges allow slight encoding variance
  if (longSide >= 7600 && shortSide >= 4200) return "8K";
  if (longSide >= 3800 && shortSide >= 2100) return "4K";
  if (longSide >= 2500 && shortSide >= 1400) return "1440P";
  if (longSide >= 1900 && shortSide >= 1000) return "1080P";
  if (longSide >= 1200 && shortSide >= 700) return "720P";
  if (longSide >= 800 && shortSide >= 450) return "480P";
  if (longSide >= 600 && shortSide >= 300) return "360P";

  return "Unknown";
}

function getVideoResolution(file: File): string {
  let textContent = "1080p"
  // 1. Create a temporary video element
  const video = document.createElement("video");

  // 2. Set the video source to a local object URL
  const videoUrl = URL.createObjectURL(file);
  video.src = videoUrl;

  // 3. Listen for the 'loadedmetadata' event
  video.addEventListener("loadedmetadata", () => {
    // 4. Access the video dimensions
    const width = video.videoWidth;
    const height = video.videoHeight;
    textContent = getResolution(width, height);

    // 5. Clean up the object URL and video element
    URL.revokeObjectURL(videoUrl);
    // Optional: remove the temporary video element if it was appended to the DOM
    // video.remove();
  });
  return textContent;
}

export default getVideoResolution;
