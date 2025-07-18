import { MessageCircle, SwitchCamera, MessagesSquare } from "lucide-react";
import { ComponentType } from "react";

export const GET_TT_USER_INFO_URL = "https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name,bio_description,is_verified,follower_count,following_count,likes_count,video_count";
export const YT_UPLOAD_URL = "https://www.googleapis.com/upload/youtube/v3/videos?part=snippet%2Cstatus&uploadType=resumable"

type VideoAccessOption = {
  name: "comment" | "duet" | "stitch";
  icon: ComponentType<{ strokeWidth?: number; size?: number; className?: string }>;
};

export const VIDEO_ACCESS_OPTIONS: VideoAccessOption[] = [
  { name: "comment", icon: MessageCircle },
  { name: "duet", icon: MessagesSquare },
  { name: "stitch", icon: SwitchCamera }
];

export const CHUNK_SIZE = 10000000; // 10MB

export const ALL_PRIVACY_STATUS_OPTIONS = [
  { id: "PUBLIC_TO_EVERYONE", label: "Public to Everyone" },
  { id: "MUTUAL_FOLLOW_FRIENDS", label: "Mutual Follow Friends" },
  { id: "FOLLOWER_OF_CREATOR", label: "Followers of Creator" },
  { id: "SELF_ONLY", label: "Unlisted" },
];

export const CATEGORIES: {id: string, label: string}[] = [
  {
    id: "1",
    label: "Film & Animation",
  },
  {
    id: "2",
    label: "Autos & Vehicles",
  },
  {
    id: "10",
    label: "Music",
  },
  {
    id: "15",
    label: "Pets & Animals",
  },
  {
    id: "17",
    label: "Sports",
  },
  {
    id: "19",
    label: "Travel & Events",
  },
  {
    id: "20",
    label: "Gaming",
  },
  {
    id: "22",
    label: "People & Blogs",
  },
  {
    id: "23",
    label: "Comedy",
  },
  {
    id: "24",
    label: "Entertainment",
  },
  {
    id: "25",
    label: "News & Politics",
  },
  {
    id: "26",
    label: "Howto & Style",
  },
  {
    id: "27",
    label: "Education",
  },
  {
    id: "28",
    label: "Science & Technology",
  },
  {
    id: "29",
    label: "Nonprofits & Activism",
  },
];
