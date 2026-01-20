import Button from "@/app/components/primitives/Button";
import ButtonIcon from "@/app/components/primitives/ButtonIcon";
import { Progress } from "@/app/components/primitives/Progress";
import { Switch } from "@/app/components/primitives/Switch";
import KeyReferenceAddButton from "@/app/components/KeyReferenceAddButton";
import KeyReferenceMenuButton from "@/app/components/KeyReferenceMenuButton";
import SequentialScheduleSwitch from "@/app/components/SequentialScheduleSwitch";
import TagsInput from "@/app/components/TagsInput";
import prisma from "@/lib/prisma";
import { Reference } from "@prisma/client";
import { getServerSession } from "next-auth"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import {  useEffect, useState } from "react";
import { X, RotateCcw, CloudUpload, Video, Videotape, Play } from "lucide-react";
import { getCookie } from "cookies-next"
import moment from "moment";
import { InstagramUserInfo, InstagramVideoProps } from "@/types"
import { cn } from "@/app/utils/cn";
import UploadPreview from "@/app/components/UploadPreview";

export const getServerSideProps = async (context: any) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  const references = await prisma.user.findUnique({
    where: {
      email: session?.user?.email,
    },
    select: {
      references: {
        select: { id: true, value: true, type: true },
      },
    },
  });

  return {
    props: references,
  };
};

const MEDIA_TYPES = [{ name: "Stories", icon: Play }, { name: "Videos", icon: Video }, { name: "Reels", icon: Videotape }];

type InstagramUploadDialogContentProps = {
  videos: InstagramVideoProps[];
  setVideos: React.Dispatch<React.SetStateAction<any[]>>;
  references?: Reference[];
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
    <form encType="multipart/form-data" className="w-full">
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
      <div className="mt-2 mb-5">
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
          >
            <div className="flex flex-col w-full">
              {videos[index]?.uploadProgress || 0 > 0 && (
                <div className="flex gap-2 w-full items-center">
                  <p className="text-sm font-medium w-1/4 shrink-0">Upload progress</p>
                  <div className="px-2 w-full"><Progress value={Number(videos?.[index].uploadProgress)} /></div>
                </div>
              )}
              <ButtonIcon
                icon={X}
                label="Remove Video"
                size={26}
                strokeWidth={1.5}
                onClick={() => {
                  if (videos && videos.length >= 1) {
                    setVideos(videos.filter((_, i) => i !== index));
                  }
                }}
                className="ml-auto"
                tooltip
              />

              <div className="flex gap-2">
                <div className="w-1/4 shrink-0">
                  <p className="text-sm font-medium">Caption of your video</p>
                  <p className="text-xs text-gray-500">Main video caption</p>
                </div>
                <input
                  onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                  onChange={event => editAll ?
                    !!videos && setVideos(videos.map((video) => ({ ...video, caption: event.currentTarget.value }))) :
                    !!videos && setVideos(videos.map((v, i) => i === index ? { ...v, caption: event.currentTarget.value } : v))}
                  className="border border-gray-300 rounded w-full h-10 px-2 py-1 outline-0 bg-transparent ml-2"
                  name="caption"
                  value={videos && videos[index]?.caption || ""}
                />
                <div className="flex items-start pr-1">
                  <KeyReferenceAddButton
                    type="caption"
                    value={videos && videos[index]?.["caption"] || ""}
                    localReferences={localReferences}
                    setLocalReferences={setLocalReferences}
                  />
                  <KeyReferenceMenuButton
                    type="caption"
                    localReferences={localReferences}
                    setLocalReferences={setLocalReferences}
                    callback={(key, value) => editAll ?
                      setVideos(videos.map((video) => ({ ...video, [key]: value }))) :
                      setVideos(videos.map((v, i) => i === index ? { ...v, [key]: value } : v))}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <div className="w-1/4 shrink-0">
                  <p className="text-sm font-medium">Select Media Type</p>
                  <p className="text-xs text-gray-500">Choose the type of media you are uploading</p>
                </div>
                <div className="flex gap-4 ml-2 w-[calc(100%-236px)]">
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
                <div className="w-1/4 shrink-0">
                  <p className="text-sm font-medium">Scheduled Date</p>
                  <p className="text-xs text-gray-500">Video release</p>
                </div>
                <div className="w-[calc(100%-235px)] ml-2">
                  <input
                    onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                    type="datetime-local"
                    className="w-full border border-gray-300 rounded h-10 px-2"
                    value={sequentialDate !== undefined ? moment(sequentialDate.date).add((index * sequentialDate.interval), 'days').format('YYYY-MM-DDTHH:mm') :
                      videos[index]?.scheduleDate ? videos[index]?.scheduleDate : new Date().toISOString().split("T")[0]}
                    onChange={(e) => editAll ?
                      !!videos && setVideos(videos.map((video) => ({ ...video, scheduleDate: e.target.value }))) :
                      !!videos && setVideos(videos.map((v, i) => i === index ? { ...v, scheduleDate: e.target.value } : v))}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <div className="w-1/4 shrink-0">
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
      </div>

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
                onSubmit();
              }}
              className="flex flex-1 items-center gap-2"
            >
              <CloudUpload />
              Upload {videos && videos.length} Video{videos && videos.length > 1 ? "s" : ""} to Instagram
            </Button>
          </div>
        </>
      )}
    </form>
  )
}

export default InstagramUploadDialogContent;