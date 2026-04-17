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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/app/components/primitives/Select";
import { Progress } from "@/app/components/primitives/Progress";
import { Switch } from "@/app/components/primitives/Switch";
import KeyReferenceAddButton from "@/app/components/KeyReferenceAddButton";
import KeyReferenceMenuButton from "@/app/components/KeyReferenceMenuButton";
import SequentialScheduleSwitch from "@/app/components/SequentialScheduleSwitch";
import TiktokSpecificFields from "@/app/components/TiktokSpecificFields";
import Spinner from "@/app/components/primitives/Spinner";
import UploadTextarea from "@/app/components/UploadTextarea";
import TagsInput from "@/app/components/TagsInput";
import { useGetYouTubeUserInfo } from "@/app/hooks/use-get-youtube-user-info";
import { useUploadYoutubeVideo } from "@/app/hooks/use-upload-youtube-video";
import { Reference } from "@prisma/client";
import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, RotateCcw, CloudUpload, Play, TriangleAlert, Video, Videotape } from "lucide-react";
import { cn } from "@/app/utils/cn";
import Image from "next/image";
import formatFileSize from "@/app/utils/formatFileSize";
import { getCookie } from "cookies-next"
import { CATEGORIES } from "@/app/constants";
import moment from "moment";

import { InstagramUserInfo, InstagramVideoProps, SanitizedVideoProps, YouTubeUserInfo } from "@/types"
import { TikTokUserCreatorInfo, TikTokVideoProps } from "@/types";

const MEDIA_TYPES = [{ name: "Stories", icon: Play }, { name: "Videos", icon: Video }, { name: "Reels", icon: Videotape }];

type UploadDialogContentProps = {
  videos: SanitizedVideoProps[];
  setVideos: React.Dispatch<React.SetStateAction<any[]>>;
  references?: Reference[];
  setResetVideos: (reset: boolean) => void;
  setUploadVideoModalOpen: (open: boolean) => void;
  type: "tiktok" | "instagram" | "youtube";
}

type SubmitPlatformsOptions = {
  publishNow?: boolean;
  videosToSubmit: SanitizedVideoProps[];
};

const UploadDialogContent = ({
  videos,
  setVideos,
  references,
  setResetVideos,
  setUploadVideoModalOpen,
  type,
}: UploadDialogContentProps) => {
  const youtubeTokens = getCookie("youtube-tokens");
  const tikTokAccessTokens = getCookie("tiktok-tokens") as string;
  const igAccessTokens = getCookie("ig-access-token");
  const [editAll, setEditAll] = useState<boolean>(false);
  const [localReferences, setLocalReferences] = useState<Reference[]>(references || []);
  const [ytUserInfo, setYtUserInfo] = useState<YouTubeUserInfo | null>(null);
  const [igUserInfo, setIgUserInfo] = useState<InstagramUserInfo | null>(null);
  const [sequentialDate, setSequentialDate] = useState<{ date: string, interval: number }>();
  const [confirmUploadVideoModalOpen, setConfirmUploadVideoModalOpen] = useState<boolean>(false);
  const [uploadingAfterSubmit, setUploadingAfterSubmit] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [editMultiple, setEditMultiple] = useState<{ [service: string]: boolean }>({
    instagram: type === "instagram",
    tiktok: type === "tiktok",
    youtube: type === "youtube",
  });
  const [tiktokCreatorInfo, setTiktokCreatorInfo] = useState<TikTokUserCreatorInfo>();
  const [publishNow, setPublishNow] = useState<boolean>(false);

  const getTikTokCreatorInfo = async () => {
    fetch("/api/tiktok/get-creator-info", {
      method: "GET",
    })
      .then(response => response.json())
      .then(async ({ data }) => {
        await setTiktokCreatorInfo({ ...data });
      })
      .catch(error => {
        console.error("Fetch error:", error);
      });
  };

  async function scheduleVideoToTikTok(video: TikTokVideoProps) {
    try {
      const response = await fetch("/api/tiktok/schedule-videos/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoUrl: video.url,
          scheduledDate: new Date(video.scheduleDate || new Date()),
          thumbnail: video.thumbnail,
          accessToken: JSON.parse(tikTokAccessTokens)?.access_token,
          refreshToken: JSON.parse(tikTokAccessTokens)?.refresh_token,
          title: video.title,
          yourBrand: video.yourBrand,
          brandedContent: video.brandedContent,
          privacyStatus: video.privacyStatus,
          commercialUseContent: video.commercialUseContent,
          commercialUseOrganic: video.commercialUseOrganic,
          disableDuet: !video.interactionType?.duet,
          disableComment: !video.interactionType?.comment,
          disableStitch: !video.interactionType?.stitch,
          draft: video.draft,
        }),
      });

      const { data } = await response.json();
      console.log("Scheduled video response:", data);
    } catch (error) {
      console.error("Error scheduling video:", error);
      throw error;
    }
  };

  async function scheduleVideoToInstagram(video: InstagramVideoProps) {
    try {
      await fetch("/api/instagram/schedule-videos/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoUrl: video.url,
          videoType: video.videoType,
          videoCaption: video.caption,
          scheduledDate: new Date(video.scheduleDate || new Date()),
          thumbnail: video.thumbnail,
          accessToken: !!igAccessTokens && JSON.parse(igAccessTokens as string).access_token,
          InstagramuserId: igUserInfo?.id,
        }),
      });
    } catch (error) {
      console.error("Error scheduling video:", error);
      throw error;
    }
  };

  async function triggerDirectPost(platform: "instagram" | "tiktok") {
    try {
      const response = await fetch(`/api/${platform}/direct-post`, {
        method: "GET",
      });

      const { message } = await response.json();
      console.log(message);
    } catch (error) {
      console.error("Fetch error:", error);
      throw error;
    }
  }

  async function waitForDirectPostWindow() {
    await new Promise((resolve) => window.setTimeout(resolve, 5000));
  }

  const onSubmitInstagram = async ({ publishNow, videosToSubmit }: SubmitPlatformsOptions) => {
    if (!igAccessTokens || !JSON.parse(igAccessTokens as string).access_token) {
      console.error("No Instagram access token found");
      return;
    }

    if (!videosToSubmit.length) {
      return;
    }

    if (publishNow) {
      // Schedule all videos in parallel with the current timestamp, then trigger
      // direct-post once after a single delay (rather than one delay per video).
      await Promise.all(
        videosToSubmit.map((video) =>
          scheduleVideoToInstagram({
            ...video,
            scheduleDate: new Date().toISOString(),
          } as unknown as InstagramVideoProps)
        )
      );
      await waitForDirectPostWindow();
      await triggerDirectPost("instagram");
    } else {
      await Promise.all(
        videosToSubmit.map((video) =>
          scheduleVideoToInstagram(video as unknown as InstagramVideoProps)
        )
      );
    }
  };

  const onSubmitTikTok = async ({ publishNow, videosToSubmit }: SubmitPlatformsOptions) => {
    if (!tikTokAccessTokens) {
      console.error("No TikTok access token found");
      return;
    }

    if (!videosToSubmit.length) {
      return;
    }

    if (publishNow) {
      // Schedule all videos in parallel with the current timestamp, then trigger
      // direct-post once after a single delay (rather than one delay per video).
      await Promise.all(
        videosToSubmit.map((video) =>
          scheduleVideoToTikTok({
            ...video,
            scheduleDate: new Date().toISOString(),
          } as unknown as TikTokVideoProps)
        )
      );
      await waitForDirectPostWindow();
      await triggerDirectPost("tiktok");
    } else {
      await Promise.all(
        videosToSubmit.map((video) =>
          scheduleVideoToTikTok(video as unknown as TikTokVideoProps)
        )
      );
    }
  };

  const onSubmitYouTube = async ({ videosToSubmit }: SubmitPlatformsOptions) => {
    const accessToken = !!youtubeTokens && JSON.parse(youtubeTokens as string).access_token;

    if (!accessToken) {
      console.error("No YouTube access token found");
      return;
    }

    if (videosToSubmit.length) {
      await Promise.all(
        videosToSubmit.map((video) => useUploadYoutubeVideo({ accessToken, video }))
      );
    }
  };

  const handleUpload = async () => {
    const videosToSubmit = videos.map((video) => ({
      ...video,
      file: video.file,
    }));

    const submitTasks: Promise<void>[] = [];

    if (editMultiple.tiktok) {
      submitTasks.push(onSubmitTikTok({ publishNow, videosToSubmit }));
    }

    if (editMultiple.instagram) {
      submitTasks.push(onSubmitInstagram({ publishNow, videosToSubmit }));
    }

    if (editMultiple.youtube) {
      submitTasks.push(onSubmitYouTube({ videosToSubmit }));
    }

    if (!submitTasks.length) {
      return;
    }

    setUploadingAfterSubmit(true);
    setProgress(0);

    try {
      await Promise.all(submitTasks);
      setConfirmUploadVideoModalOpen(false);
      setUploadVideoModalOpen?.(false);
      setResetVideos?.(true);
      setVideos([]);
    } catch (error) {
      console.error("Error uploading videos:", error);
      setUploadingAfterSubmit(false);
    }
  };

  useEffect(() => {
    if (Object.keys(editMultiple).some(key => key === "tiktok" && editMultiple[key])) {
      getTikTokCreatorInfo();
    }
  }, [editMultiple]);


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

  useEffect(() => {
    const getUserInfo = async () => {
      if (youtubeTokens) {
        const data = await useGetYouTubeUserInfo({ tokens: youtubeTokens as string })
        setYtUserInfo({ ...data })
      }
    }
    getUserInfo()
  }, [youtubeTokens]);

  useEffect(() => {
    const getUserInfo = async () => {
      if (igAccessTokens) {
        const data = await fetch("/api/instagram/get-user-data")
          .then((data) => data.json());
        setIgUserInfo({ ...data });
      }
    }
    getUserInfo()
  }, [igAccessTokens]);

  const isDisabled = useMemo(() => (video: SanitizedVideoProps): boolean => {
    const isYoutubeDisabled = (video?.type === "youtube" || editMultiple.youtube) && video?.title === "";
    const isTikTokDisabled = (video?.type === "tiktok" || editMultiple.tiktok) && video.directPost && (video.privacyStatus === "" || (video.disclose && (!video.yourBrand && !video.brandedContent)));
    const isInstagramDisabled = (video?.type === "instagram" || editMultiple.instagram) && !video?.videoType;
    return isYoutubeDisabled || isTikTokDisabled || isInstagramDisabled;
  }, [videos]);

  const disabledReason = useMemo(() => (video: SanitizedVideoProps): string => {
    return video.disclose && (!video.yourBrand && !video.brandedContent) ? "You need to indicate if your content promotes yourself, a third party, or both." : "You need to indecate who can view this video.";
  }, [videos]);

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
        <div
          key={video.file.name}
          className="grid grid-cols-2 gap-8 md:flex md:gap-6"
        >
          <div className="flex flex-col">
            {video?.thumbnail ? (
              <>
                <div className="flex flex-col gap-2 mb-6">
                  <div className="flex gap-2 items-center">
                    <div className="bg-green-600 rounded-full p-1">
                      <Check size={18} strokeWidth={4} className="text-white" />
                    </div>
                    <p className="text-lg font-semibold">Your Video is Ready</p>
                    {videos.length > 1 && (<Button variant="outline" size="small" onClick={() => setVideos((prev) => {
                      const currentVideos = [...prev]
                      const updatedVideos = currentVideos.filter((_, i) => i !== index)
                      return updatedVideos;
                    })}>
                      Remove Video
                    </Button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <p className="text-sm text-gray-600">Apply changes to:</p>
                    <label className="flex items-center gap-1 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={editMultiple["youtube"]}
                        onChange={() => setEditMultiple((prev) => ({ ...prev, youtube: !prev.youtube }))}
                      />
                      YouTube
                    </label>
                    <label className="flex items-center gap-1 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={editMultiple["instagram"]}
                        onChange={() => setEditMultiple((prev) => ({ ...prev, instagram: !prev.instagram }))}
                      />
                      Instagram
                    </label>
                    <label className="flex items-center gap-1 text-sm text-gray-600">
                      <input
                        type="checkbox"
                        checked={editMultiple["tiktok"]}
                        onChange={() => setEditMultiple((prev) => ({ ...prev, tiktok: !prev.tiktok }))}
                      />
                      TikTok
                    </label>
                  </div>
                </div>
                <div className="flex flex-col rounded-lg overflow-hidden bg-black">
                  <video
                    controls
                    poster={video?.thumbnail}
                    className="bg-black h-[470px]"
                  >
                    <source
                      src={video?.url}
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
              <h2 className="text-2xl font-bold text-gray-700">Upload to {type}</h2>
              <DropdownMenu>
                <DropdownMenuTrigger
                  asChild
                  className="rounded-md border border-gray-100 bg-gray-100 dark:border-gray-800 dark:bg-gray-800"
                >
                  <div className="flex gap-2 items-center px-4 py-3 rounded bg-gray-100">
                    <div className="relative flex gap-2 items-center">
                      {ytUserInfo?.thumbnail || "" ? (
                        <Image src={ytUserInfo?.thumbnail || ""} alt={`${type} User Thumbnail`} width="40" height="40" className="rounded-full" />) : (
                        <Spinner size="small" />
                      )}
                      <div className="absolute -bottom-px -right-px">
                        <Image src={`/${type.toLowerCase()}_logo.png`} alt={`${type} Logo`} width="15" height="15" />
                      </div>
                    </div>
                    <h3 className="text-md font-bold text-gray-700">{ytUserInfo?.userName || ""}</h3>
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

              <UploadTextarea
                editAll={editAll}
                videos={videos}
                setVideos={setVideos}
                index={index}
                localReferences={localReferences}
                setLocalReferences={setLocalReferences}
                editMultiple={editMultiple}
                header="Caption"
                placeholder="Add a title that describes your video"
                type={video.type === "instagram" ? "caption" : "title"}
              />

              {/* instagram video specific fields */}
              {editMultiple?.instagram && (
                <div className="flex flex-col gap-4 w-full border-2 border-blue-600 rounded p-4">
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
                            "border-blue-500": videos[index]?.videoType === option.name,
                          })}
                          type="button"
                          onClick={() => editAll ?
                            !!videos && setVideos(videos.map((video) => ({ ...video, videoType: option.name as "Stories" | "Videos" | "Reels" }))) :
                            !!videos && setVideos(videos.map((v, i) => i === index ? { ...v, videoType: option.name as "Stories" | "Videos" | "Reels" } : v))}
                        >
                          <option.icon strokeWidth={1.5} size={16} className={cn("text-gray-600", {
                            "text-blue-500": videos[index]?.videoType === option.name,
                          })} />
                          <p className={cn("text-sm capitalize", {
                            "text-blue-500": videos[index]?.videoType === option.name,
                            "text-gray-500": videos[index]?.videoType !== option.name,
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
              )}
              {/* youtube video specific fields */}
              {editMultiple?.youtube && (
                <div className="flex flex-col gap-4 w-full border-2 border-red-600 rounded p-4">
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
              )}
              {/* tiktok video specific fields */}
              {editMultiple?.tiktok && (
                <TiktokSpecificFields
                  videos={videos as unknown as TikTokVideoProps[]}
                  setVideos={setVideos}
                  index={index}
                  editAll={editAll}
                  tiktokCreatorInfo={tiktokCreatorInfo}
                />
              )}
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger
                  asChild>
                  <div className="flex">
                    <Button
                      type="submit"
                      disabled={isDisabled(video)}
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
                  {isDisabled(video) && disabledReason && (<p className="text-gray-600 font-semibold">{disabledReason(video)}</p>)}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Dialog
            open={confirmUploadVideoModalOpen}
            onOpenChange={setConfirmUploadVideoModalOpen}
          >
            <DialogContent className="sm:max-w-3xl" aria-describedby="Upload Video Dialog">
              <DialogTitle>{`Upload Video${videos.length > 1 ? "s" : ""} to ${Object.entries(editMultiple).filter(([_, value]) => value).map(([key]) => key.charAt(0).toUpperCase() + key.slice(1)).join(", ")}`}</DialogTitle>
              {uploadingAfterSubmit ? (
                <>
                  <Progress value={progress} />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {`Your video is being uploaded to ${type === "youtube" ? "YouTube" : type === "tiktok" ? "TikTok" : "Instagram"}. This may take a few minutes depending on the size of your video and your internet connection. You may close this dialog and continue using the app while the upload is in progress.`}
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
                      onClick={async () => {
                        await handleUpload();
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
            type="button"
            onClick={() => {
              setConfirmUploadVideoModalOpen(true);
            }}
            disabled={videos.some((video) => isDisabled(video))}
            className="flex gap-2 items-center flex-1"
          >
            <CloudUpload />
            {`Upload ${videos.length} Video${videos.length > 1 ? "s" : ""} to ${Object.entries(editMultiple).filter(([_, value]) => value).map(([key]) => key).join(", ")}`}
          </Button>
        </div>
      )}
    </div>
  );
};

export default UploadDialogContent;