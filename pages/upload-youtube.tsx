import Button from "@/app/components/primitives/Button";
import ButtonIcon from "@/app/components/primitives/ButtonIcon";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/app/components/primitives/Select";
import { Progress } from "@/app/components/primitives/Progress";
import { Switch } from "@/app/components/primitives/Switch";
import KeyReferenceAddButton from "@/app/components/KeyReferenceAddButton";
import KeyReferenceMenuButton from "@/app/components/KeyReferenceMenuButton";
import TagsInput from "@/app/components/TagsInput";
import { useGetYouTubeUserInfo } from "@/app/hooks/use-get-youtube-user-info";
import prisma from "@/lib/prisma";
import { Reference } from "@prisma/client";
const transparentImage = require("@/public/transparent.png");
import { getServerSession } from "next-auth"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { forwardRef, useCallback, useEffect, useState } from "react";
import { Upload, X, Calendar1, RotateCcw, CloudUpload } from "lucide-react";
import DatePicker from "react-datepicker";
import { useDropzone } from "react-dropzone";
import { getCookie } from "cookies-next"
import Image from "next/image";
import generateVideoThumb from "@/app/utils/generateVideoThumb";
import moment from "moment";
import { cn } from "@/app/utils/cn";
import { CATEGORIES } from "@/app/constants";
import { SanitizedVideoProps, YouTubeUserInfo } from "@/types"
import "react-datepicker/dist/react-datepicker.css";

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

export default function UploadYouTubePage({ references }: { references: Reference[] }) {
  const tokens = getCookie("youtube-tokens");
  const [editAll, setEditAll] = useState<boolean>(false);
  const [videos, setVideos] = useState<SanitizedVideoProps[]>([]);
  const [localReferences, setLocalReferences] = useState<Reference[]>(references || []);
  const [ytUserInfo, setYtUserInfo] = useState<YouTubeUserInfo>();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const onDrop = useCallback((acceptedFiles: any) => {
    if (acceptedFiles.length) {
      acceptedFiles.forEach(async (file: any) => {
        const thumbnail = await generateVideoThumb(file);

        setVideos((videos: SanitizedVideoProps[]) => [
          ...videos,
          {
            categoryId: "1",
            description: "",
            file,
            title: "",
            scheduleDate: moment().format("YYYY-MM-DD"),
            tags: undefined,
            thumbnail: thumbnail || transparentImage,
            uploadProgress: 0,
          },
        ]);
      });
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  type DateCustomInputProps = {
    value?: string;
    onClick?: () => void;
    className?: string;
  }

  const DateCustomInput = forwardRef<HTMLButtonElement, DateCustomInputProps>(
    ({ value, onClick, className }, ref) => (
      <Button
        className={cn("flex gap-3 items-center", className)}
        variant="thin"
        onClick={onClick}
        type="button"
        ref={ref}
      >
        {value}
        <Calendar1 size={22} strokeWidth={1.5} />
      </Button>
    ),
  );

  const tryToUpload = async (accessToken: string, urlparameters: string, video: SanitizedVideoProps) => {
    try {
      const location = await fetch(`https://www.googleapis.com/upload/youtube/v3/videos?${urlparameters}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${String(accessToken)}`,
        },
        body: JSON.stringify({
          snippet: {
            categoryId: video.categoryId,
            description: video.description,
            title: video.title,
            tags: video.tags
          },
          status: {
            privacyStatus: "private",
            publishAt: new Date(video.scheduleDate ?? new Date()).toISOString(),
          },
        }),
      });
      // Url to upload video file from the location header
      const videoUrl = await location.headers.get("Location");
      try {
        const response = await fetch(`${videoUrl}`, {
          method: "PUT",
          headers: {
            "Content-Type": "video/mp4",
          },
          body: video.file,
        });
        console.log("Video uploaded:", response)
        setVideos([]);
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    } catch {
      // If the access token is expired, refresh it and try again
      try {
        const refreshToken = JSON.parse(tokens as string)?.refresh_token;
        const refreshResponse = await fetch("/api/youtube/connect-yt", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken }),
        });

        if (!refreshResponse) {
          console.error("No refresh response");
          return;
        }
        const refreshData = await refreshResponse.json();
        const config = refreshData?.res?.config;
        const { url, body, headers } = config;

        await fetch(url, {
          method: "POST",
          headers,
          body,
        }).then(async (res) => {
          const { access_token } = await res.json();
          // Try uploading the video again with the new access token
          await tryToUpload(access_token, urlparameters, video);
        });
      } catch (error) {
        console.error("Error refreshing token:", error);
      }
    }
  }

  const onSubmit = (event: React.ChangeEvent<any>) => {
    event.preventDefault();
    const accessToken = !!tokens && JSON.parse(tokens as string).access_token;
    const urlparameters = "part=snippet%2Cstatus&uploadType=resumable";

    if (!accessToken) {
      console.error("No access token found");
      return;
    }
    if (!!videos.length) {
      videos.forEach(async (video) => tryToUpload(accessToken, urlparameters, video));
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
    <div className="flex flex-col max-w-3xl mx-auto mt-12 p-6">
      <form action="uploadVideo" method="post" encType="multipart/form-data" onSubmit={onSubmit} className="mt-12">
        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <Image src="/youtube_logo.png" alt="Youtube Logo" width="50" height="20" className="w-12" />
              <p className="text-xs mt-auto">Upload video max: 2GB</p>
            </div>
            <div className="flex gap-2">
              <img src={ytUserInfo?.thumbnail} alt="YouTube User Thumbnail" width="35" height="35" className="rounded-full" />
              <h2 className="text-2xl font-bold text-gray-700">{ytUserInfo?.userName}</h2>
            </div>
          </div>
          {videos && videos.length > 1 && (
            <div className="flex gap-2 mb-4 items-center ml-auto mt-auto">
              <p className="text-sm font-medium">Set All Videos</p>
              <Switch
                checked={editAll}
                onClick={() => setEditAll(!editAll)}
                className="cursor-pointer"
              />
            </div>
          )}
        </div>
        <div className="mt-2 mb-5">

          {videos && videos.length > 0 && videos.map((video, index) => (
            <div className="flex gap-6 mb-6" key={video.file.name}>
              <div className="flex flex-col shrink-0 w-1/4 h-fit relative">
                <img
                  src={videos?.[index].thumbnail || transparentImage}
                  alt="thumbnail"
                  className="rounded-xl object-cover h-[362px]"
                />

                {!!videos && videos.length > 0 && (
                  <div className="flex gap-2 absolute bottom-1 left-0 right-0 items-center text-white">
                    <div className="font-semibold text-xs truncate ml-2">{videos[index]?.file.name}</div>
                    <div className="font-semibold text-xs ml-auto mr-2">{`${Math.round(videos[index]?.file.size / 100000) / 10}MB`}</div>
                  </div>
                )}
              </div>

              <div className="flex flex-col w-full">
                <div className="flex flex-col gap-4 h-fit w-full border border-gray-100 rounded-xl p-4 bg-white">
                  {videos[index]?.uploadProgress || 0 > 0 && (
                    <div className="flex gap-2 w-full items-center">
                      <p className="text-sm font-medium w-1/4 shrink-0">Upload progress</p>
                      <div className="px-2 w-full"><Progress value={videos?.[index].uploadProgress} /></div>
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
                      <p className="text-sm font-medium">Title of your video</p>
                      <p className="text-xs text-gray-500">Main video title</p>
                    </div>
                    <input
                      onChange={event => editAll ?
                        !!videos && setVideos(videos.map((video) => ({ ...video, title: event.currentTarget.value }))) :
                        !!videos && setVideos(videos.map((v, i) => i === index ? { ...v, title: event.currentTarget.value } : v))}
                      className="border border-gray-300 rounded w-full h-10 px-2 py-1 outline-0 bg-transparent ml-2"
                      name="title"
                      value={videos && videos[index]?.title}
                    />
                    <div className="flex items-start pr-1">
                      <KeyReferenceAddButton
                        type="title"
                        value={videos && videos[index]?.["title"] || ""}
                        localReferences={localReferences}
                        setLocalReferences={setLocalReferences}
                      />
                      <KeyReferenceMenuButton
                        type="title"
                        localReferences={localReferences}
                        setLocalReferences={setLocalReferences}
                        callback={(key, value) => setVideos(videos.map((v, i) => i === index ? { ...v, [key]: value } : v))}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="w-1/4 shrink-0">
                      <p className="text-sm font-medium">Video Description</p>
                      <p className="text-xs text-gray-500">Description displayed on YouTube</p>
                    </div>
                    <textarea
                      onChange={event => editAll ?
                        !!videos && setVideos(videos.map((video) => ({ ...video, description: event.currentTarget.value }))) :
                        !!videos && setVideos(videos.map((v, i) => i === index ? { ...v, description: event.currentTarget.value } : v))}
                      className="border border-gray-300 rounded w-full h-20 px-2 py-1 outline-0 bg-transparent ml-2"
                      name="description"
                      value={videos && videos[index]?.description}
                    />
                    <div className="flex items-start pr-1">
                      <KeyReferenceAddButton
                        type="description"
                        value={videos && videos[index]?.["description"] || ""}
                        localReferences={localReferences}
                        setLocalReferences={setLocalReferences}
                      />
                      <KeyReferenceMenuButton
                        type="description"
                        localReferences={localReferences}
                        setLocalReferences={setLocalReferences}
                        callback={(key, value) => setVideos(videos.map((v, i) => i === index ? { ...v, [key]: value } : v))}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="w-1/4 shrink-0">
                      <p className="text-sm font-medium">Video category</p>
                      <p className="text-xs text-gray-500">Genre type</p>
                    </div>
                    <div className="w-[calc(100%-210px)]">
                      <Select
                        onValueChange={(value) => editAll ?
                          !!videos && setVideos(videos.map((video) => ({ ...video, categoryId: value }))) :
                          !!videos && setVideos(videos.map((v, i) => i === index ? { ...v, categoryId: value } : v))}
                        value={videos && videos[index]?.categoryId}
                      >
                        <SelectTrigger className="outline-0 border border-gray-300 bg-transparent rounded h-10 ml-2">
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

                  <div className="flex gap-2 ml-2">
                    <div className="w-1/4 shrink-0">
                      <p className="text-sm font-medium">Scheduled Date</p>
                      <p className="text-xs text-gray-500">Video release</p>
                    </div>
                    <div className="w-[calc(100%-200px)] [&_.react-datepicker-wrapper]:w-full">
                      <DatePicker
                        className="w-full l"
                        selected={selectedDate}
                        onChange={(date) => setSelectedDate(date || new Date())}
                        customInput={<DateCustomInput className="example-custom-input" />}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="w-1/4 shrink-0">
                      <p className="text-sm font-medium">Video Tags</p>
                      <p className="text-xs text-gray-500">Keywords</p>
                    </div>
                    <TagsInput
                      onAddTags={(e) => editAll ?
                        !!videos && setVideos(videos.map((video) => ({ ...video, tags: video.tags ? `${video.tags},${e}` : e }))) :
                        !!videos && setVideos(videos.map((v, i) => i === index ? { ...v, tags: v.tags ? `${v.tags},${e}` : e } : v))}
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
                        callback={(key, value) => setVideos(videos.map((v, i) => i === index ? { ...v, [key]: value } : v))}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
              className="flex flex-1 gap-2"
            >
              <RotateCcw strokeWidth={2} />
              Reset Video{videos && videos?.length > 1 ? "s" : ""}
            </Button>
            <Button
              variant="secondary"
              type="button"
              className="flex gap-2 items-center flex-1"
            >
              <CloudUpload />
              {`Upload ${videos.length} Video${videos.length > 1 ? "s" : ""} to YouTube`}
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
                <p className="text-sm font-medium">Title of your video</p>
                <p className="text-xs text-gray-500">Main video title</p>
              </div>
              <input
                className="border border-gray-300 rounded w-full h-10 px-2 py-1 outline-0 bg-transparent ml-2"
                name="title"
              />
              <div className="flex items-start pr-1">
                <KeyReferenceAddButton
                  type="title"
                  value={""}
                  localReferences={localReferences}
                  setLocalReferences={setLocalReferences}
                />
                <KeyReferenceMenuButton
                  type="title"
                  localReferences={localReferences}
                  setLocalReferences={setLocalReferences}
                  callback={() => ""}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="w-1/4 shrink-0">
                <p className="text-sm font-medium">Video Description</p>
                <p className="text-xs text-gray-500">Description displayed on YouTube</p>
              </div>
              <textarea
                className="border border-gray-300 rounded w-full h-20 px-2 py-1 outline-0 bg-transparent ml-2"
                name="description"
                value={""}
              />
              <div className="flex items-start pr-1">
                <KeyReferenceAddButton
                  type="description"
                  value={""}
                  localReferences={localReferences}
                  setLocalReferences={setLocalReferences}
                />
                <KeyReferenceMenuButton
                  type="description"
                  localReferences={localReferences}
                  setLocalReferences={setLocalReferences}
                  callback={() => ""}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="w-1/4 shrink-0">
                <p className="text-sm font-medium">Video category</p>
                <p className="text-xs text-gray-500">Genre type</p>
              </div>
              <div className="w-[calc(100%-210px)]">
                <Select value={""}>
                  <SelectTrigger className="outline-0 border border-gray-300 bg-transparent rounded h-10 ml-2">
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
            <div className="flex gap-2 ml-2">
              <div className="w-1/4 shrink-0">
                <p className="text-sm font-medium">Scheduled Date</p>
                <p className="text-xs text-gray-500">Video release</p>
              </div>
              <div className="w-[calc(100%-200px)] [&_.react-datepicker-wrapper]:w-full">
                <DatePicker
                  className="w-full l"
                  selected={selectedDate}
                  customInput={<DateCustomInput className="example-custom-input" />}
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
                tags={["Youtube"]}
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
