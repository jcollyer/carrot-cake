import { MessageCircle, SwitchCamera, MessagesSquare } from "lucide-react";
import { ComponentType } from "react";

export const GET_TT_USER_INFO_URL = "https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name,follower_count,following_count,likes_count,video_count";
export const YT_UPLOAD_URL = "https://www.googleapis.com/upload/youtube/v3/videos?part=snippet%2Cstatus&uploadType=resumable"
export const IG_CONNECT_URL = "https://www.instagram.com/oauth/authorize?force_reauth=true&client_id=1023066706404594&redirect_uri=https://jointly-topical-leech.ngrok-free.app/api/auth/instagram/callback&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish%2Cinstagram_business_manage_insights";
export const IG_CONNECT_URL_PROD = "https://www.instagram.com/oauth/authorize?force_reauth=true&client_id=1023066706404594&redirect_uri=https://carrot-cake.app/api/auth/instagram/callback&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish%2Cinstagram_business_manage_insights";
export const GET_IG_USER_INFO_URL = "?fields=id,username,profile_picture_url,followers_count,follows_count,media_count&access_token=";
export const GET_IG_USER_MEDIA_URL = "https://graph.instagram.com/me/media?fields=id,caption,media_url,media_type,timestamp,children{media_url}&limit=100&access_token=";

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
  { id: "SELF_ONLY", label: "Unlisted (self only)" },
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
