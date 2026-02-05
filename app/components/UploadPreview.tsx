import Button from "@/app/components/primitives/Button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/app/components/primitives/Dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/primitives/DropdownMenu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/app/components/primitives/Tooltip";
import { Progress } from "@/app/components/primitives/Progress";
import Spinner from "@/app/components/primitives/Spinner";
import { Check, ChevronDown, TriangleAlert } from "lucide-react";
import Image from "next/image";
import formatFileSize from "@/app/utils/formatFileSize";
import { cn } from "@/app/utils/cn";
import { ReactNode, useEffect, useState } from "react";
import { InstagramVideoProps, SanitizedVideoProps, TikTokVideoProps } from "@/types";
import moment from "moment";

type UploadPreviewProps = {
  children: ReactNode;
  video: TikTokVideoProps | InstagramVideoProps | SanitizedVideoProps;
  videos: (TikTokVideoProps | InstagramVideoProps | SanitizedVideoProps)[];
  setVideos: React.Dispatch<React.SetStateAction<(TikTokVideoProps | InstagramVideoProps | SanitizedVideoProps)[]>>;
  index: number;
  editAll?: boolean;
  sequentialDate?: {
    date: string;
    interval: number;
  };
  avatarUrl: string | null;
  nickname: string;
  onSubmit: (index?: number, publishNow?: boolean) => void;
  disabled: boolean;
  service: "TikTok" | "Instagram" | "YouTube";
  disabledReason?: string;
  setResetVideos?: (reset: boolean) => void;
  setUploadVideoModalOpen?: (open: boolean) => void;
};

const UploadPreview = ({
  video,
  videos,
  setVideos,
  index,
  editAll,
  sequentialDate,
  avatarUrl,
  nickname,
  onSubmit,
  disabled,
  service,
  disabledReason,
  children,
  setResetVideos,
  setUploadVideoModalOpen
}: UploadPreviewProps) => {
  const [confirmUploadVideoModalOpen, setConfirmUploadVideoModalOpen] = useState<boolean>(false);
  const [uploadingAfterSubmit, setUploadingAfterSubmit] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [publishNow, setPublishNow] = useState<boolean>(false);

  useEffect(() => {
    if (uploadingAfterSubmit) {
      const interval = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prevProgress + 0.15;
        });
      }, 10);

      return () => clearInterval(interval);
    }
  }, [uploadingAfterSubmit, progress]);

  return (
    <div
      key={video.file.name}
      className="grid grid-cols-2 gap-8 md:flex md:gap-6"
    >
      <div className="flex flex-col">
        {(video?.url && video?.thumbnail) ? (
          <>
            <div className="flex gap-2 items-center mb-6">
              <div className="bg-green-600 rounded-full p-1">
                <Check size={18} strokeWidth={4} className="text-white" />
              </div>
              <p className="text-lg font-semibold">Your Video is Ready</p>
            </div>
            <div className="flex flex-col rounded-lg overflow-hidden bg-black">
              <video
                controls
                poster={video?.thumbnail}
                className="bg-black h-[470px]"
              >
                <source
                  src={video?.url ?? null}
                  type={video?.file.type}
                />
                Your browser does not support the video tag.
              </video>
              <div className="grid grid-cols-4 items-center bg-black border-t border-gray-800">
                <div className="relative flex flex-col p-4">
                  <p className="text-sm text-gray-400">Filename</p>
                  <p className="text-xs text-gray-300 font-medium truncate">{video?.file.name}</p>
                  <div className="absolute top-[calc(50%-10px)] right-0 h-5 w-px bg-gray-800">&nbsp;</div>
                </div>
                <div className="relative flex flex-col p-4">
                  <p className="text-sm text-gray-400">Format</p>
                  <p className="text-xs text-gray-300 font-medium truncate">{video?.file.type.split("/").pop().toUpperCase()}</p>
                  <div className="absolute top-[calc(50%-10px)] right-0 h-5 w-px bg-gray-800">&nbsp;</div>
                </div>
                <div className="relative flex flex-col p-4">
                  <p className="text-sm text-gray-400">Resolution</p>
                  <p className="text-xs text-gray-300 font-medium truncate">{video?.resolution}</p>
                  <div className="absolute top-[calc(50%-10px)] right-0 h-5 w-px bg-gray-800">&nbsp;</div>
                </div>
                <div className="relative flex flex-col p-4">
                  <p className="text-sm text-gray-400">Size</p>
                  <p className="text-xs text-gray-300 font-medium truncate">{formatFileSize(video?.file.size)}</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-xl bg-gray-200 h-full flex items-center justify-center w-96">
            <p className="text-gray-600 font-medium"><Spinner size="medium" /></p>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-4 w-full justify-between">
        <div className="flex flex-col gap-4 h-fit w-full">
          <h2 className="text-2xl font-bold text-gray-700">Upload to {service}</h2>
          <DropdownMenu>
            <DropdownMenuTrigger
              asChild
              className="rounded-md border border-gray-100 bg-gray-100 dark:border-gray-800 dark:bg-gray-800"
            >
              <div className="flex gap-2 items-center px-4 py-3 rounded bg-gray-100">
                <div className="relative flex gap-2 items-center">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={`${service} User Thumbnail`} width="40" height="40" className="rounded-full" />) : (
                    <Spinner size="small" />
                  )}
                  <div className="absolute -bottom-px -right-px">
                    <Image src={`/${service.toLowerCase()}_logo.png`} alt={`${service} Logo`} width="15" height="15" />
                  </div>
                </div>
                <h3 className="text-md font-bold text-gray-700">{nickname}</h3>
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
          <div className="flex gap-2">
            <div className="shrink-0">
              <p className="text-sm font-medium">Scheduled Date</p>
              <p className="text-xs text-gray-500">Video release</p>
            </div>
            <div className="flex gap-2 items-center w-full">
              <input
                disabled={publishNow}
                onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                type="datetime-local"
                className="w-full border border-gray-300 rounded h-10 px-2 disabled:opacity-50 disabled:cursor-not-allowed"
                value={sequentialDate !== undefined ? moment(sequentialDate.date).add((index * sequentialDate.interval), 'days').format('YYYY-MM-DDTHH:mm') :
                  videos[index]?.scheduleDate ? videos[index]?.scheduleDate : new Date().toISOString().split("T")[0]}
                onChange={(e) => editAll ?
                  !!videos && setVideos(videos.map((video) => ({ ...video, scheduleDate: e.target.value }))) :
                  !!videos && setVideos(videos.map((v, i) => i === index ? { ...v, scheduleDate: e.target.value } : v))}
              />
                <label className={cn("flex shrink-0 text-center gap-2 items-center border px-2 py-3 rounded cursor-pointer", {
                  "border-blue-500 bg-blue-100": publishNow,
                })}>
                  <input
                    type="checkbox"
                    checked={publishNow}
                    className="size-4"
                    onChange={() => {
                      setPublishNow(!publishNow);
                    }}
                  />
                  <p className="text-xs font-semibold">Upload Now</p>

                </label>
            </div>
          </div>

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
                  onClick={(e) => {
                    e.preventDefault();
                    setConfirmUploadVideoModalOpen(true);
                  }}
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
      <Dialog
        open={confirmUploadVideoModalOpen}
        onOpenChange={setConfirmUploadVideoModalOpen}
      >
        <DialogContent className="sm:max-w-3xl" aria-describedby="Upload Video Dialog">
          <DialogTitle>Upload Video to {service}</DialogTitle>
          {uploadingAfterSubmit ? (
            <>
              <Progress value={progress} />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your video is being uploaded to {service}. This may take a few minutes depending on the size of your video and your internet connection. You may close this dialog and continue using the app while the upload is in progress.
              </p>
            </>
          ) : (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Please ensure that you have reviewed all the details and settings before proceeding with the upload.
              {service === "TikTok" && (
                <div className="flex gap-2 items-center bg-amber-100 text-amber-900 text-sm p-3 mt-4 rounded">
                  <TriangleAlert size={18} />
                  By posting, you agree to TikTok"s <a href="https://www.tiktok.com/legal/page/global/music-usage-confirmation/en" target="_blank" className="text-amber-600 underline">Music Usage Confirmation</a>.
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {!uploadingAfterSubmit ? (
              <>
                <DialogClose asChild>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setConfirmUploadVideoModalOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  onClick={() => {
                    onSubmit(index, publishNow);
                    setUploadingAfterSubmit(true);
                  }}
                >
                  Upload Video
                </Button>
              </>
            ) : (
              <DialogClose asChild>
                <Button
                disabled={progress < 100}
                  variant="outline"
                  onClick={() => {
                    setConfirmUploadVideoModalOpen(false);
                    setUploadVideoModalOpen?.(false);
                    setUploadingAfterSubmit(false);
                    setResetVideos?.(true);
                    setProgress(0);
                    setVideos([]);
                  }}
                >
                  Close
                </Button>
              </DialogClose>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default UploadPreview;