import Button from "@/app/components/primitives/Button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/app/components/primitives/Dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/app/components/primitives/Select";
import { Progress } from "@/app/components/primitives/Progress";
import { Switch } from "@/app/components/primitives/Switch";
import KeyReferenceAddButton from "@/app/components/KeyReferenceAddButton";
import KeyReferenceMenuButton from "@/app/components/KeyReferenceMenuButton";
import SequentialScheduleSwitch from "@/app/components/SequentialScheduleSwitch";
import TagsInput from "@/app/components/TagsInput";
import { useGetYouTubeUserInfo } from "@/app/hooks/use-get-youtube-user-info";
import { useUploadYoutubeVideo } from "@/app/hooks/use-upload-youtube-video";
import { Reference } from "@prisma/client";
import { useEffect, useState } from "react";
import { RotateCcw, CloudUpload, Upload } from "lucide-react";
import { getCookie } from "cookies-next"
import moment from "moment";
import { CATEGORIES } from "@/app/constants";
import { SanitizedVideoProps, YouTubeUserInfo } from "@/types"
import UploadPreview from "@/app/components/UploadPreview";
import UploadTextarea from "./UploadTextarea";


type YoutubeUploadDialogContentProps = {
  videos: SanitizedVideoProps[];
  setVideos: React.Dispatch<React.SetStateAction<any[]>>;
  references?: Reference[];
  setResetVideos: (reset: boolean) => void;
  setUploadVideoModalOpen: (open: boolean) => void;
}

const YoutubeUploadDialogContent = ({
  videos,
  setVideos,
  references,
  setResetVideos,
  setUploadVideoModalOpen,
}: YoutubeUploadDialogContentProps) => {
  const tokens = getCookie("youtube-tokens");
  const [editAll, setEditAll] = useState<boolean>(false);
  const [localReferences, setLocalReferences] = useState<Reference[]>(references || []);
  const [ytUserInfo, setYtUserInfo] = useState<YouTubeUserInfo | null>(null);
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

  const onSubmit = async () => {
    const accessToken = !!tokens && JSON.parse(tokens as string).access_token;

    if (!accessToken) {
      console.error("No access token found");
      return;
    }
    if (!!videos.length) {
      for (const [i, video] of videos.entries()) {
        useUploadYoutubeVideo({ accessToken, video, videos, setVideos });
        if (i === videos.length - 1) {
        }
      }
    }
  };

  useEffect(() => {
    const getUserInfo = async () => {
      if (tokens) {
        const data = await useGetYouTubeUserInfo({ tokens: tokens as string })
        setYtUserInfo({ ...data })
      }
    }
    getUserInfo()
  }, [tokens]);

  return (
    <div className="flex flex-col gap-6 overflow-y-auto max-h-[80vh]">
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
          service="YouTube"
          video={video}
          index={index}
          avatarUrl={ytUserInfo?.thumbnail || ""}
          nickname={ytUserInfo?.userName || ""}
          onSubmit={onSubmit}
          disabled={videos[index]?.title === ""}
          setResetVideos={setResetVideos}
          setUploadVideoModalOpen={setUploadVideoModalOpen}
          videos={videos}
          setVideos={setVideos}
        >
          <div className="flex flex-col gap-4 w-full">
            {videos[index]?.uploadProgress || 0 > 0 && (
              <div className="flex gap-2 w-full items-center">
                <p className="text-sm font-medium w-1/4 shrink-0">Upload progress</p>
                <div className="px-2 w-full"><Progress value={Number(videos?.[index].uploadProgress)} /></div>
              </div>
            )}
            <UploadTextarea
              editAll={editAll}
              videos={videos}
              setVideos={setVideos}
              index={index}
              localReferences={localReferences}
              setLocalReferences={setLocalReferences}
              header="Caption"
              placeholder="Add a title that describes your video"
              type="title"
            />

            <UploadTextarea
              editAll={editAll}
              videos={videos}
              setVideos={setVideos}
              index={index}
              localReferences={localReferences}
              setLocalReferences={setLocalReferences}
              header="Description"
              placeholder="Description displayed on YouTube"
              type="description"
            />


            <div className="flex gap-2">
              <div className="shrink-0">
                <p className="text-sm font-medium">Video category</p>
                <p className="text-xs text-gray-500">Genre type</p>
              </div>
              <div className="w-full">
                <Select
                  onValueChange={(value) => editAll ?
                    !!videos && setVideos(videos.map((video) => ({ ...video, categoryId: value }))) :
                    !!videos && setVideos(videos.map((v, i) => i === index ? { ...v, categoryId: value } : v))}
                  value={videos && videos[index]?.categoryId}
                >
                  <SelectTrigger className="outline-0 border border-gray-300 bg-transparent rounded h-10">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

      {!!videos.length && videos.length > 1 && (
        <div className="flex gap-2 mt-5">
          <Button
            variant="secondary"
            type="button"
            onClick={() => {
              setVideos([])
            }}
            disabled={false}
            className="flex flex-1 gap-2"
          >
            <RotateCcw strokeWidth={2} />
            Reset Video{videos && videos?.length > 1 ? "s" : ""}
          </Button>
          <Button
            variant="secondary"
            type="button"
            onClick={() => {
              setConfirmUploadVideoModalOpen(true);
            }}
            disabled={false}
            className="flex gap-2 items-center flex-1"
          >
            <CloudUpload />
            {`Upload ${videos.length} Video${videos.length > 1 ? "s" : ""} to YouTube`}
          </Button>
        </div>
      )}
      <Dialog
        open={confirmUploadVideoModalOpen}
        onOpenChange={setConfirmUploadVideoModalOpen}
      >
        <DialogContent className="sm:max-w-3xl" aria-describedby="Upload Video Dialog">
          <DialogTitle>Upload Video to YouTube</DialogTitle>
          {uploadingAfterSubmit ? (
            <>
              <Progress value={progress} />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your video is being uploaded to YouTube. This may take a few minutes depending on the size of your video and your internet connection. You may close this dialog and continue using the app while the upload is in progress.
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
    </div>
  );
};

export default YoutubeUploadDialogContent;