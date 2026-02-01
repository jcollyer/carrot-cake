import Button from "@/app/components/primitives/Button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/app/components/primitives/Dialog";
import { Progress } from "@/app/components/primitives/Progress";
import { Switch } from "@/app/components/primitives/Switch";
import KeyReferenceAddButton from "@/app/components/KeyReferenceAddButton";
import KeyReferenceMenuButton from "@/app/components/KeyReferenceMenuButton";
import SequentialScheduleSwitch from "@/app/components/SequentialScheduleSwitch";
import TagsInput from "@/app/components/TagsInput";
import { Reference } from "@prisma/client";
import { useEffect, useState } from "react";
import { RotateCcw, CloudUpload, Video, Videotape, Play } from "lucide-react";
import { getCookie } from "cookies-next"
import moment from "moment";
import { InstagramUserInfo, InstagramVideoProps } from "@/types"
import { cn } from "@/app/utils/cn";
import UploadPreview from "@/app/components/UploadPreview";
import UploadTextarea from "./UploadTextarea";

const MEDIA_TYPES = [{ name: "Stories", icon: Play }, { name: "Videos", icon: Video }, { name: "Reels", icon: Videotape }];

type InstagramUploadDialogContentProps = {
  videos: InstagramVideoProps[];
  setVideos: React.Dispatch<React.SetStateAction<any[]>>;
  references: Reference[];
  setResetVideos: (reset: boolean) => void;
  setUploadVideoModalOpen: (open: boolean) => void;
};

const InstagramUploadDialogContent = ({ videos, setVideos, references, setResetVideos, setUploadVideoModalOpen }: InstagramUploadDialogContentProps) => {
  const tokens = getCookie("ig-access-token");
  const accessToken = !!tokens && JSON.parse(tokens as string).access_token;
  const [localReferences, setLocalReferences] = useState<Reference[]>(references || []);
  const [igUserInfo, setIgUserInfo] = useState<InstagramUserInfo | null>(null);
  const [editAll, setEditAll] = useState<boolean>(false);
  const [sequentialDate, setSequentialDate] = useState<{ date: string, interval: number }>();
  const [confirmUploadVideoModalOpen, setConfirmUploadVideoModalOpen] = useState<boolean>(false);
  const [uploadingAfterSubmit, setUploadingAfterSubmit] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    if (uploadingAfterSubmit) {
      const interval = setInterval(() => {
        setProgress((prevProgress) => {
          if (prevProgress >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prevProgress + 0.1;
        });
      }, 10);

      return () => clearInterval(interval);
    }
  }, [uploadingAfterSubmit, progress]);

  async function scheduleVideoToInstagram(video: InstagramVideoProps) {
    try {
      fetch("/api/instagram/schedule-videos/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoUrl: video.url,
          videoType: video.mediaType,
          videoCaption: video.caption,
          scheduledDate: new Date(video.scheduleDate || new Date()),
          thumbnail: video.thumbnail,
          accessToken,
          InstagramuserId: igUserInfo?.id,
        }),
      }).catch((error) => {
        console.error("Error scheduling video:", error);
      });
    } catch (error) {
      console.error("Error scheduling video:", error);
    }
  }

  const onSubmit = async (index?: number) => {
    if (!accessToken) {
      console.error("No access token found");
      return;
    }
    if (index !== undefined) {
      await scheduleVideoToInstagram(videos[index]);
    } else {
      if (!!videos && videos.length > 0) {
        for (const video of videos) {
          await scheduleVideoToInstagram(video);
        }
      }
    }
  };

  useEffect(() => {
    const getUserInfo = async () => {
      if (tokens) {
        const data = await fetch("/api/instagram/get-user-data")
          .then((data) => data.json());
        setIgUserInfo({ ...data });
      }
    }
    getUserInfo()
  }, [tokens]);

  return (
    <form encType="multipart/form-data" className="flex flex-col gap-6 overflow-y-auto max-h-[80vh]">
      <div className="flex justify-between items-center mb-4">
        {videos && videos.length > 1 && (
          <div className="flex flex-col gap-1">
            <div className="flex gap-2 mb-4 items-center ml-auto mt-auto">
              <p className="text-sm font-medium">Set All Videos</p>
              <Switch
                checked={editAll}
                onClick={() => setEditAll(!editAll)}
                className="cursor-pointer"
              />
            </div>
            <SequentialScheduleSwitch sequentialDate={sequentialDate} setSequentialDate={setSequentialDate} setVideos={setVideos} />
          </div>
        )}
      </div>
      {videos && videos.length > 0 && videos.map((video, index) => (
        <UploadPreview
          key={video.file.name}
          service="Instagram"
          video={video}
          index={index}
          avatarUrl={igUserInfo?.profile_picture_url || ""}
          nickname={igUserInfo?.username || ""}
          onSubmit={onSubmit}
          disabled={!!video.url ? false : true}
          setResetVideos={setResetVideos}
          setUploadVideoModalOpen={setUploadVideoModalOpen}
          videos={videos}
          setVideos={setVideos}
        >
          <div className="flex flex-col gap-4 w-full">
            <UploadTextarea
              editAll={editAll}
              videos={videos}
              setVideos={setVideos}
              index={index}
              localReferences={localReferences}
              setLocalReferences={setLocalReferences}
              header="Video Caption"
              placeholder="Main video caption"
              type="caption"
            />

            <div className="flex gap-2">
              <div className="shrink-0">
                <p className="text-sm font-medium">Select Media Type</p>
                <p className="text-xs text-gray-500">Choose the type of<br /> media you are uploading</p>
              </div>
              <div className="flex gap-4 flex-1">
                {Object.values(MEDIA_TYPES).map((option) => (
                  <button
                    key={option.name}
                    className={cn("flex flex-col flex-1 items-center gap-2 mb-2 border border-gray-300 rounded p-2", {
                      "border-blue-500": videos[index]?.mediaType === option.name,
                    })}
                    type="button"
                    onClick={() => editAll ?
                      !!videos && setVideos(videos.map((video) => ({ ...video, mediaType: option.name as "Stories" | "Videos" | "Reels" }))) :
                      !!videos && setVideos(videos.map((v, i) => i === index ? { ...v, mediaType: option.name as "Stories" | "Videos" | "Reels" } : v))}
                  >
                    <option.icon strokeWidth={1.5} size={16} className={cn("text-gray-600", {
                      "text-blue-500": videos[index]?.mediaType === option.name,
                    })} />
                    <p className={cn("text-sm capitalize", {
                      "text-blue-500": videos[index]?.mediaType === option.name,
                      "text-gray-500": videos[index]?.mediaType !== option.name,
                    })}>
                      {option.name}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <div className="shrink-0">
                <p className="text-sm font-medium">Video Tags</p>
                <p className="text-xs text-gray-500">Keywords</p>
              </div>
              <TagsInput
                onAddTags={(tag) => editAll ?
                  !!videos && setVideos(videos.map((video) => ({ ...video, tags: video.tags ? `${video.tags},${tag}` : tag }))) :
                  !!videos && setVideos(videos.map((v, i) => i === index ? { ...v, tags: v.tags ? `${v.tags},${tag}` : tag } : v))}
                onRemoveTags={(indexToRemove) => editAll ? !!videos && setVideos(videos.map((video) => {
                  let tagsArr = video.tags?.split(",")
                  tagsArr?.splice(indexToRemove, 1)
                  const tagsString = tagsArr?.join(",")
                  return { ...video, tags: tagsString }
                })) : setVideos(videos.map((v, i) => {
                  let tagsArr = video.tags?.split(",")
                  tagsArr?.splice(indexToRemove, 1)
                  const tagsString = tagsArr?.join(",")
                  return i === index ? { ...v, tags: tagsString } : { ...v }
                }))}
                tags={videos[index]?.tags?.split(",") || []}
              />
              <div className="flex items-start pr-1">
                <KeyReferenceAddButton
                  type="tags"
                  value={videos && videos[index]?.["tags"] || ""}
                  localReferences={localReferences}
                  setLocalReferences={setLocalReferences}
                />
                <KeyReferenceMenuButton
                  type="tags"
                  localReferences={localReferences}
                  setLocalReferences={setLocalReferences}
                  callback={(key, value) => editAll ?
                    setVideos(videos.map((video) => ({ ...video, [key]: value }))) :
                    setVideos(videos.map((v, i) => i === index ? { ...v, [key]: value } : v))}
                />
              </div>
            </div>
          </div>
        </UploadPreview>
      ))}

      {videos && videos.length > 1 && (
        <>
          <div className="flex gap-2 mt-5">
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                setVideos([])
              }}
              className="flex flex-1 gap-2"
            >
              <RotateCcw strokeWidth={2} />
              Reset Video{videos && videos?.length > 1 ? "s" : ""}
            </Button>
            <Button
              variant="secondary"
              type="submit"
              // disabled={!videos?.every(v => v.privacyStatus !== "" || !v.directPost)}
              onClick={(e) => {
                e.preventDefault();
                setConfirmUploadVideoModalOpen(true);
              }}
              className="flex flex-1 items-center gap-2"
            >
              <CloudUpload />
              Upload {videos && videos.length} Video{videos && videos.length > 1 ? "s" : ""} to Instagram
            </Button>
          </div>
        </>
      )}
      <Dialog
        open={confirmUploadVideoModalOpen}
        onOpenChange={setConfirmUploadVideoModalOpen}
      >
        <DialogContent className="sm:max-w-3xl" aria-describedby="Upload Video Dialog">
          <DialogTitle>Upload Video to TikTok</DialogTitle>
          {uploadingAfterSubmit ? (
            <>
              <Progress value={progress} />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your video is being uploaded to TikTok. This may take a few minutes depending on the size of your video and your internet connection. You may close this dialog and continue using the app while the upload is in progress.
              </p>
            </>
          ) : (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Please ensure that you have reviewed all the details and settings before proceeding with the upload.
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
                    onSubmit();
                    setUploadingAfterSubmit(true);
                  }}
                >
                  Upload {videos && videos.length} Video{videos && videos.length > 1 ? "s" : ""}
                </Button>
              </>
            ) : (
              <DialogClose asChild>
                <Button
                  variant="outline"
                  onClick={() => {
                    setConfirmUploadVideoModalOpen(false);
                    setUploadVideoModalOpen?.(false);
                    setUploadingAfterSubmit(false);
                    setResetVideos?.(true);
                    setProgress(0);
                  }}
                >
                  Close
                </Button>
              </DialogClose>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  )
}

export default InstagramUploadDialogContent;