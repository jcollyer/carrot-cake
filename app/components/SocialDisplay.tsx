import { deleteCookie } from "cookies-next";
import formatBigNumber from "@/app/utils/formatBigNumbers";
import ButtonIcon from "@/app/components/primitives/ButtonIcon";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/app/components/primitives/Tooltip";
import { Film, UserRoundPlus, Eye, Unplug, CloudUpload, HeartPlus } from "lucide-react";
import { useRouter } from "next/router";
import { YouTubeVideo } from "@/types";

type props = {
  userName?: string;
  thumbnail?: string;
  videoCount?: string | number;
  subscriberCount?: string | number;
  viewCount?: string | number;
  likesCount?: string | number;
  type: "youtube" | "tiktok";
  onLogout?: () => void;
};

const SocialDisplay = ({ userName, thumbnail, videoCount, subscriberCount, viewCount, likesCount, type, onLogout }: props) => {
  const router = useRouter();

  return (
    <div className="flex gap-6 items-center w-full">
      <div className="flex gap-2 shrink-0 items-center">
        <img src={thumbnail} alt="YouTube User Thumbnail" width="35" height="35" className="rounded-full" />
        <h2 className="text-2xl font-bold text-gray-800">{userName}</h2>
      </div>
      <div className="flex gap-4">
        <div className="flex gap-1 items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild className="cursor-pointer">
                <div className="flex gap-1 items-center">
                  <Film className="text-gray-600" size="16" strokeWidth={2.5} />
                  <p className="text-gray-600 font-semibold">{formatBigNumber(Number(videoCount) || 0)}</p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-gray-600 font-semibold">Video Count</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex gap-1 items-center border-l pl-4 border-gray-300">
          {type === "youtube" && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild className="cursor-pointer">
                  <div className="flex gap-1 items-center">
                    <UserRoundPlus className="text-gray-600" size="16" strokeWidth={2.5} />
                    <p className="text-gray-600 font-semibold">{formatBigNumber(Number(subscriberCount) || 0)}</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-gray-600 font-semibold">Follower Count</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {type === "tiktok" && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild className="cursor-pointer">
                  <div className="flex gap-1 items-center">
                    <HeartPlus className="text-gray-600" size="16" strokeWidth={2.5} />
                    <p className="text-gray-600 font-semibold">{formatBigNumber(Number(likesCount) || 0)}</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-gray-600 font-semibold">Likes Count</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="flex gap-1 items-center border-l pl-4 border-gray-300">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild className="cursor-pointer">
                <div className="flex gap-1 items-center">
                  <Eye className="text-gray-600" size="16" strokeWidth={2.5} />
                  <p className="text-gray-600 font-semibold">{formatBigNumber(Number(viewCount) || 0)}</p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-gray-600 font-semibold">View Count</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="flex gap-2 ml-auto">
        <ButtonIcon
          icon={Unplug}
          onClick={() => {
            if (onLogout) {
              onLogout();
            }
          }}
          size={24}
          strokeWidth={2}
          label={`Disconnect from  ${type === "youtube" ? "YouTube" : "TikTok"}`}
          tooltip
        />
        <ButtonIcon
          icon={CloudUpload}
          label={`Upload to ${type === "youtube" ? "YouTube" : "TikTok"}`}
          className="flex gap-2"
          variant="cta"
          size={24}
          strokeWidth={2}
          tooltip
          onClick={() => router.push(`/upload-${type === "youtube" ? "youtube" : "tiktok"}`)}
        />
      </div>
    </div>
  )
};

export default SocialDisplay;