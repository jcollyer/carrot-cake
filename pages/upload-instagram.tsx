import Button from "@/app/components/primitives/Button";
import ButtonIcon from "@/app/components/primitives/ButtonIcon";
import { Progress } from "@/app/components/primitives/Progress";
import { Switch } from "@/app/components/primitives/Switch";
import Spinner from "@/app/components/primitives/Spinner";
import KeyReferenceAddButton from "@/app/components/KeyReferenceAddButton";
import KeyReferenceMenuButton from "@/app/components/KeyReferenceMenuButton";
import SequentialScheduleSwitch from "@/app/components/SequentialScheduleSwitch";
import TagsInput from "@/app/components/TagsInput";
import prisma from "@/lib/prisma";
import { Reference } from "@prisma/client";
const transparentImage = require("@/public/transparent.png");
import { getServerSession } from "next-auth"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { Upload, X, RotateCcw, CloudUpload, Video, Videotape, Play } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { getCookie } from "cookies-next"
import Image from "next/image";
import moment from "moment";
import { InstagramUserInfo, InstagramVideoProps } from "@/types"
import generateVideoThumb from "@/app/utils/generateVideoThumb";
import { base64ToArrayBuffer } from "@/app/utils/base64ToArrayBuffer";
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

export default function UploadInstagramPage({ references }: { references: Reference[] }) {
  const tokens = getCookie("ig-access-token");
  const [editAll, setEditAll] = useState<boolean>(false);
  const [videos, setVideos] = useState<InstagramVideoProps[]>([]);
  const [localReferences, setLocalReferences] = useState<Reference[]>(references || []);
  const [igUserInfo, setIgUserInfo] = useState<InstagramUserInfo | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [sequentialDate, setSequentialDate] = useState<{ date: string, interval: number }>();

  const accessToken = !!tokens && JSON.parse(tokens as string).access_token;

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length) {
      acceptedFiles.forEach(async (file: File, index: number) => {

        const reader = new FileReader();
        reader.onload = async (event) => {
          const fileData = event.target?.result;
          if (fileData) {
            const thumb = await generateVideoThumb(file);
            const thumbArrayBuffer = base64ToArrayBuffer((thumb as string).split(",")[1]);

            setVideos((prev) => [
              ...prev,
              {
                caption: "",
                url: "",
                scheduleDate: moment().format("YYYY-MM-DDTHH:mm"),
                tags: undefined,
                mediaType: "Stories",
                uploadProgress: 0,
                location: "",
                file,
                thumbnail: thumb as string,
              },
            ]);

            // Upload the thumbnail to S3
            fetch(`/api/s3/presigned?fileName=${file.name.split(".mp4")[0]}-thumb.png&contentType=image/png&s3Bucket=AWS_S3_IG_THUMBS_BUCKET_NAME&region=us-east-2`)
              .then((res) => res.json())
              .then((res) => {
                const body = new Blob([thumbArrayBuffer], { type: "image/png" });

                fetch(res.signedUrl, {
                  body,
                  method: 'PUT',
                }).then(async (data) => {
                  const thumbnail = data?.url?.split('?')[0];
                  setVideos((prev) => prev.map((v, i) => i === index ? { ...v, thumbnail } : v));
                });
              });

            // Upload the video to S3
            fetch(`/api/s3/presigned?fileName=${file.name}&contentType=${file.type}&s3Bucket=AWS_S3_IG_BUCKET_NAME&region=us-east-2`)
              .then((res) => res.json())
              .then((res) => {
                const body = new Blob([fileData], { type: file.type });

                fetch(res.signedUrl, {
                  body,
                  method: 'PUT',
                }).then(async (data) => {
                  const url = data?.url?.split('?')[0];
                  setVideos((prev) => prev.map((v, i) => i === index ? { ...v, url } : v));
                });
              });
          }
        };
        reader.readAsArrayBuffer(file);
      });
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

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
      }).then(async (data) => {
        console.log("Video scheduled successfully:--------", data);
      });


    } catch (error) {
      console.error("Error scheduling video:", error);
    }
  }

  const onSubmit = async (event: ChangeEvent<any>) => {
    event.preventDefault();
    if (!accessToken) {
      console.error("No access token found");
      return;
    }
    if (!!videos.length) {
      setIsUploading(true);
      for (const [i, video] of videos.entries()) {
        scheduleVideoToInstagram(video);
        if (i === videos.length - 1) {
          setIsUploading(false);
          setVideos([]);
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
    <div className="flex flex-col max-w-4xl mx-auto mt-12 p-6">
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
          {isUploading && videos.length !== 0 && <div className="flex justify-end mb-4">
            <div role="status">
              <Spinner size="large" />
              <span className="sr-only">Loading...</span>
            </div></div>}
          {videos && videos.length > 0 && videos.map((video, index) => (
            <UploadPreview
              key={video.file.name}
              service="Instagram"
              video={video}
              videos={videos}
              removeVideo={
                (index) => {
                  if (videos && videos.length >= 1) {
                    setVideos(videos.filter((_, i) => i !== index));
                  }
                }
              }
              index={index}
              avatarUrl={igUserInfo?.profile_picture_url || ""}
              nickname={igUserInfo?.username || ""}
              onSubmit={onSubmit}
              disabled={isUploading}
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

        {!!videos.length && (
          <div className="flex gap-2 mt-5">
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                setVideos([])
              }}
              disabled={isUploading}
              className="flex flex-1 gap-2"
            >
              <RotateCcw strokeWidth={2} />
              Reset Video{videos && videos?.length > 1 ? "s" : ""}
            </Button>
            <Button
              variant="secondary"
              type="submit"
              onClick={onSubmit}
              disabled={isUploading}
              className="flex gap-2 items-center flex-1"
            >
              <CloudUpload />
              {`Upload ${videos.length} Video${videos.length > 1 ? "s" : ""} to Instagram`}
            </Button>
          </div>
        )}
      </form>

      <div className="flex gap-6 mt-8">
        <div className="flex flex-col shrink-0 w-1/4">
          <div
            className="flex flex-col items-center h-full border border-dashed text-center justify-center p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border-gray-400"
            {...getRootProps()}
          >
            <input {...getInputProps()} name="file" />
            <Upload strokeWidth={1} className="m-1" />
            <h3 className="text-sm font-medium text-gray-900">
              Drag n&apos; drop some files here
            </h3>
            <p className="text-xs">
              or <span className="underline">click here</span> to select files
            </p>
            <p className="mt-2 text-xs">
              Supports .mp4 and .mov files up to 2GB
            </p>
          </div>
        </div>
        <div className="flex flex-col w-full opacity-40">
          <div className="flex flex-col gap-5 h-fit w-full border border-gray-100 rounded-xl p-4 bg-white">

            <div className="flex gap-2">
              <div className="w-1/4 shrink-0">
                <p className="text-sm font-medium">Caption of your video</p>
                <p className="text-xs text-gray-500">Main video caption</p>
              </div>
              <input
                className="border border-gray-300 rounded w-full h-10 px-2 py-1 outline-0 bg-transparent ml-2"
                name="caption"
              />
              <div className="flex items-start pr-1">
                <KeyReferenceAddButton
                  type="caption"
                  value={""}
                  localReferences={localReferences}
                  setLocalReferences={setLocalReferences}
                />
                <KeyReferenceMenuButton
                  type="caption"
                  localReferences={localReferences}
                  setLocalReferences={setLocalReferences}
                  callback={() => ""}
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
                    className="flex flex-col flex-1 items-center gap-2 mb-2 border border-gray-300 rounded p-2"
                  >
                    <option.icon strokeWidth={1.5} size={16} className="text-gray-600" />
                    <p className="text-sm capitalize text-gray-500">
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
                  type="date"
                  className="w-full border border-gray-300 rounded h-10 px-2"
                  value={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <div className="w-1/4 shrink-0">
                <p className="text-sm font-medium">Video Tags</p>
                <p className="text-xs text-gray-500">Keywords</p>
              </div>
              <TagsInput
                onAddTags={() => ""}
                onRemoveTags={() => ""}
                tags={["#carrot-cake"]}
              />
              <div className="flex items-start pr-1">
                <KeyReferenceAddButton
                  type="tags"
                  value={""}
                  localReferences={localReferences}
                  setLocalReferences={setLocalReferences}
                />
                <KeyReferenceMenuButton
                  type="tags"
                  localReferences={localReferences}
                  setLocalReferences={setLocalReferences}
                  callback={() => ""}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
