export const runtime = "edge";
import { NextResponse } from "next/server";

const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

export default async function GET(req: Request) {
  if (
    req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const response = await fetch(
      `${baseUrl}/api/instagram/scheduled-videos/delete`
    );
    const data = await response.json();
    console.log("Video deleted successfully:", data);
  } catch (error) {
    throw new Error(
      `error deleting from api/instagram/scheduled-videos/delete: ${error}`
    );
  }

  return Response.json({ message: "Cron job executed successfully" });
}
