import Button from "@/app/components/primitives/Button";
import ButtonIcon from "@/app/components/primitives/ButtonIcon";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/app/components/primitives/Select";
import { Progress } from "@/app/components/primitives/Progress";
import { Switch } from "@/app/components/primitives/Switch";
import Spinner from "@/app/components/primitives/Spinner";
import KeyReferenceAddButton from "@/app/components/KeyReferenceAddButton";
import KeyReferenceMenuButton from "@/app/components/KeyReferenceMenuButton";
import SequentialScheduleSwitch from "@/app/components/SequentialScheduleSwitch";
import TagsInput from "@/app/components/TagsInput";
import { useGetYouTubeUserInfo } from "@/app/hooks/use-get-youtube-user-info";
import { useUploadYoutubeVideo } from "@/app/hooks/use-upload-youtube-video";
import prisma from "@/lib/prisma";
import { Reference } from "@prisma/client";
const transparentImage = require("@/public/transparent.png");
import { getServerSession } from "next-auth"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { Upload, X, RotateCcw, CloudUpload } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { getCookie } from "cookies-next"
import Image from "next/image";
import generateVideoThumb from "@/app/utils/generateVideoThumb";
import moment from "moment";
import { CATEGORIES } from "@/app/constants";
import { SanitizedVideoProps, YouTubeUserInfo } from "@/types"

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
  const [ytUserInfo, setYtUserInfo] = useState<YouTubeUserInfo | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [sequentialDate, setSequentialDate] = useState<{ date: string, interval: number }>();

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

  const onSubmit = async (event: ChangeEvent<any>) => {
    event.preventDefault();
    const accessToken = !!tokens && JSON.parse(tokens as string).access_token;

    if (!accessToken) {
      console.error("No access token found");
      return;
    }
    if (!!videos.length) {
      setIsUploading(true);
      for (const [i, video] of videos.entries()) {
        useUploadYoutubeVideo({ accessToken, video, videos, setVideos });
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
        const data = await useGetYouTubeUserInfo({ tokens: tokens as string })
        setYtUserInfo({ ...data })
      }
    }
    getUserInfo()
  }, [tokens]);

  return (
    <div className="flex flex-col max-w-4xl mx-auto mt-12 p-6">
      <form encType="multipart/form-data" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <Image src="/youtube_logo.png" alt="Youtube Logo" width="50" height="20" className="w-12" />
              <p className="text-xs mt-auto">Upload video max: 2GB</p>
            </div>
            <div className="flex gap-2">
              {!ytUserInfo ? <Spinner size="medium" /> : (
                <>
                  <img src={ytUserInfo?.thumbnail} alt="YouTube User Thumbnail" width="35" height="35" className="rounded-full" />
                  <h2 className="text-2xl font-bold text-gray-700">{ytUserInfo?.userName}</h2>
                </>
              )}
            </div>
          </div>
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
            <div className="flex gap-6 mb-6" key={video.file.name}>
              <div className="flex flex-col shrink-0 w-1/4 h-fit relative">
                 {!videos?.[index].thumbnail ? (
                  <div className="rounded-xl bg-gray-200 h-[362px] flex items-center justify-center">
                    <p className="text-gray-600 font-medium"><Spinner size="medium" /></p>
                  </div>
                ) : (
                  <img
                    src={videos?.[index].thumbnail}
                    alt="thumbnail"
                    className="rounded-xl object-cover h-[362px]"
                  />
                )}


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
                      <p className="text-sm font-medium">Title of your video</p>
                      <p className="text-xs text-gray-500">Main video title</p>
                    </div>
                    <input
                      onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
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
                        callback={(key, value) => editAll ?
                          setVideos(videos.map((video) => ({ ...video, [key]: value }))) :
                          setVideos(videos.map((v, i) => i === index ? { ...v, [key]: value } : v))
                        }
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
                        callback={(key, value) => editAll ?
                          setVideos(videos.map((video) => ({ ...video, [key]: value }))) :
                          setVideos(videos.map((v, i) => i === index ? { ...v, [key]: value } : v))}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="w-1/4 shrink-0">
                      <p className="text-sm font-medium">Video category</p>
                      <p className="text-xs text-gray-500">Genre type</p>
                    </div>
                    <div className="w-[calc(100%-235px)]">
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
                        value={sequentialDate !== undefined ? moment(sequentialDate.date).add((index * sequentialDate.interval), 'days').format('YYYY-MM-DD') :
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
              <div className="w-[calc(100%-235px)]">
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
