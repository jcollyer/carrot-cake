import Button from "@/app/components/primitives/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/primitives/DropdownMenu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/app/components/primitives/Tooltip";
import { Progress } from "@/app/components/primitives/Progress";
import Spinner from "@/app/components/primitives/Spinner";
import { Check, ChevronLeft, ChevronDown } from "lucide-react";
import Image from "next/image";
import { cn } from "@/app/utils/cn";
import formatBigNumber from "@/app/utils/formatBigNumbers";
import { ChangeEvent, ReactNode } from "react";
import { InstagramVideoProps, SanitizedVideoProps, TikTokVideoProps } from "@/types";

type UploadPreviewProps = {
  children: ReactNode;
  video: TikTokVideoProps | InstagramVideoProps | SanitizedVideoProps;
  videos: TikTokVideoProps[] | InstagramVideoProps[] | SanitizedVideoProps[];
  index: number;
  avatarUrl: string;
  nickname: string;
  onSubmit: (event: ChangeEvent<any>) => Promise<void>;
  removeVideo: (index: number) => void;
  disabled: boolean;
  service: "TikTok" | "Instagram" | "YouTube";
  disabledReason?: string;
};

const UploadPreview = ({ video, videos, removeVideo, index, avatarUrl, nickname, onSubmit, disabled, service, disabledReason, children }: UploadPreviewProps) => {
  return (
    <div
      key={video.file.name}
      className="flex gap-6 mb-6 border border-gray-100 rounded-xl p-4 bg-white"
    >
      <div className="flex flex-col shrink-0 w-1/2 relative">
        {(videos?.[index].url && videos?.[index].thumbnail) ? (
          <>
            <div className="flex gap-2 items-center mb-5">
              <div className="bg-green-600 rounded-full p-1">
                <Check size={18} strokeWidth={4} className="text-white" />
              </div>
              <p className="text-lg font-semibold">Your Video is Ready</p>
              <Button
                size="xsmall"
                variant="outline"
                className="ml-2"
                onClick={() => {
                  removeVideo(index);
                }}
              >
                <p className="text-xs">Remove Video</p>
              </Button>
            </div>
            <div className="flex flex-col rounded-lg overflow-hidden bg-black">
              <video
                controls
                poster={videos?.[index].thumbnail}
                className="bg-black h-[440px]"
              >
                <source
                  src={videos?.[index].url}
                  type={videos?.[index].file.type}
                />
                Your browser does not support the video tag.
              </video>
              <div className="flex gap-2 items-center bg-black border-t border-gray-800">
                <div className="relative flex flex-col w-1/4 p-4">
                  <p className="text-sm text-gray-400">Filename</p>
                  <p className="text-xs text-gray-300 font-medium truncate">{videos[index]?.file.name}</p>
                  <div className="absolute top-[calc(50%-10px)] right-0 h-5 w-px bg-gray-800">&nbsp;</div>
                </div>
                <div className="relative flex flex-col w-1/4 p-4">
                  <p className="text-sm text-gray-400">Format</p>
                  <p className="text-xs text-gray-300 font-medium truncate">{videos[index]?.file.type.split("/").pop().toUpperCase()}</p>
                  <div className="absolute top-[calc(50%-10px)] right-0 h-5 w-px bg-gray-800">&nbsp;</div>
                </div>
                <div className="relative flex flex-col w-1/4 p-4">
                  <p className="text-sm text-gray-400">Resolution</p>
                  <p className="text-xs text-gray-300 font-medium truncate">{videos[index]?.resolution}</p>
                  <div className="absolute top-[calc(50%-10px)] right-0 h-5 w-px bg-gray-800">&nbsp;</div>
                </div>
                <div className="relative flex flex-col w-1/4 p-4">
                  <p className="text-sm text-gray-400">Size</p>
                  <p className="text-xs text-gray-300 font-medium truncate">{formatBigNumber(videos[index]?.file.size)}</p>
                </div>
                <div className="font-semibold text-xs truncate ml-2">{videos[index]?.file.name}</div>
                <div className="font-semibold text-xs ml-auto mr-2">{`${Math.round(videos[index]?.file.size / 100000) / 10}MB`}</div>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-xl bg-gray-200 h-full flex items-center justify-center">
            <p className="text-gray-600 font-medium"><Spinner size="medium" /></p>
          </div>
        )}
      </div>
      <div className={cn("flex flex-col w-full", { "opacity-40": !videos || videos.length === 0 })}>
        <div className="flex flex-col gap-4 h-fit w-full">
          {videos?.[index].uploadProgress || 0 > 0 && (
            <div className="flex gap-2 w-full items-center">
              <p className="text-sm font-medium w-1/4 shrink-0">Upload progress</p>
              <div className="px-2 w-full">
                <Progress value={videos?.[index].uploadProgress} />
                {/* <div className="relative w-full overflow-hidden rounded-full bg-gray-300 h-2">
                          <div
                            className="h-full w-full flex-1 bg-gray-700 transition-all"
                            style={{ transform: `translateX(-${100 - (videos?.[index].uploadProgress || 0)}%)` }}
                          >&nbsp;</div>
                        </div> */}
              </div>
            </div>
          )}
          <div className="flex gap-4 items-center">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="bg-gray-100 rounded-md p-2 hover:bg-gray-300 transition-colors"
            >
              <ChevronLeft size={22} strokeWidth={2} />
            </button>
            <h2 className="text-2xl font-bold text-gray-700">Upload to {service}</h2>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              asChild
              className="rounded-md border border-gray-100 bg-gray-100 dark:border-gray-800 dark:bg-gray-800"
            >
              <div className="flex gap-2 items-center p-4 rounded bg-gray-100">
                <div className="relative flex gap-2 items-center">
                  <img src={avatarUrl
                    //tiktokCreatorInfo?.creator_avatar_url
                  } alt={`${service} User Thumbnail`} width="45" height="45" className="rounded-full" />
                  <div className="absolute -bottom-px -right-px">
                    <Image src={`/${service.toLowerCase()}_logo.png`} alt={`${service} Logo`} width="18" height="18" />
                  </div>
                </div>
                <h3 className="text-md font-bold text-gray-700">{nickname
                  //tiktokCreatorInfo?.creator_nickname
                }</h3>
                <ChevronDown size={24} strokeWidth={2} className="ml-auto" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="min-w-[var(--radix-dropdown-menu-trigger-width)] -mt-px"
            >
              <DropdownMenuItem className="justify-center">
                <button
                  className="text-lg font-semibold p-2 cursor-pointer"
                  onClick={() => window.history.back()}
                >
                  Add Account +
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {children}
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger 
            asChild>
              <div className="flex">
              <Button
                type="submit"
                disabled={disabled}
                onClick={onSubmit}
                className="mt-auto w-full"
              >
                <p className="font-semibold">Upload</p>
              </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {disabled && disabledReason && (<p className="text-gray-600 font-semibold">{disabledReason}</p>)}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

      </div>
    </div>
  )
}

export default UploadPreview;