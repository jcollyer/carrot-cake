import { MessageCircle, SwitchCamera, MessagesSquare } from "lucide-react";

type VideoAccessOption = {
  name: "comment" | "duet" | "stitch";
  icon: React.ComponentType<{ strokeWidth?: number; size?: number; className?: string }>;
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
