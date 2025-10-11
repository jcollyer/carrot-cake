import Button from "@/app/components/primitives/Button";
import ButtonIcon from "@/app/components/primitives/ButtonIcon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/primitives/Select";
import { Switch, SwitchThumb } from "@/app/components/primitives/Switch";
import { Progress } from "@/app/components/primitives/Progress";
import Spinner from "@/app/components/primitives/Spinner";
import KeyReferenceAddButton from "@/app/components/KeyReferenceAddButton";
import KeyReferenceMenuButton from "@/app/components/KeyReferenceMenuButton";
import SequentialScheduleSwitch from "@/app/components/SequentialScheduleSwitch";
import prisma from "@/lib/prisma";
import { Reference } from "@prisma/client";
const transparentImage = require("@/public/transparent.png");
import { getServerSession } from "next-auth"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { ChangeEvent, useCallback, useEffect, useState } from "react";
import { Upload, RotateCcw, CloudUpload, X } from "lucide-react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { getCookie } from "cookies-next"
import { TikTokUserCreatorInfo, TikTokVideoProps } from "@/types"
import generateVideoThumb from "@/app/utils/generateVideoThumb";
import { cn } from "@/app/utils/cn";
import secondsToMinutesAndSeconds from "@/app/utils/secondsToMinutes";
import { ALL_PRIVACY_STATUS_OPTIONS, VIDEO_ACCESS_OPTIONS } from "@/app/constants";
import { base64ToArrayBuffer } from "@/app/utils/base64ToArrayBuffer";
import moment from "moment";

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

export default function UploadTikTokPage({ references }: { references: Reference[] }) {
  const tikTokAccessTokens = getCookie("tiktok-tokens") as string;

  const [videos, setVideos] = useState<TikTokVideoProps[] | undefined>(undefined);
  const [localReferences, setLocalReferences] = useState<Reference[]>(references || []);
  const [tiktokCreatorInfo, setTiktokCreatorInfo] = useState<TikTokUserCreatorInfo>();
  const [editAll, setEditAll] = useState<boolean>(false);
  const [sequentialDate, setSequentialDate] = useState<{ date: string, interval: number }>();

  const { minutes, remainingSeconds } = secondsToMinutesAndSeconds(tiktokCreatorInfo?.max_video_post_duration_sec || 0)

  const onDrop = useCallback((acceptedFiles: any) => {
    if (acceptedFiles.length) {
      acceptedFiles.forEach(async (file: any, index: number) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
          console.log("File dropped:", event);
          const fileData = event.target?.result;
          if (!fileData) return;
          const thumb = await generateVideoThumb(file);
          const thumbArrayBuffer = base64ToArrayBuffer((thumb as string).split(",")[1]);

          setVideos((prev) => [
            ...prev || [], {
              file,
              id: "",
              url: "",
              title: "",
              thumbnail: "",
              privacyStatus: "",
              commercialUseContent: false,
              commercialUseOrganic: false,
              interactionType: {
                comment: false,
                duet: false,
                stitch: false,
              },
              scheduleDate: moment().format("YYYY-MM-DDTHH:MM"),
              directPost: true,
              disclose: false,
              yourBrand: false,
              brandedContent: false,
              uploadProgress: 0,
              draft: true,
            }]);

          // Upload the thumbnail to S3
          fetch(`/api/s3/presigned?fileName=${file.name.split(".mp4")[0]}-thumb.png&contentType=image/png&s3Bucket=AWS_S3_TT_THUMBS_BUCKET_NAME&region=us-east-1`)
            .then((res) => res.json())
            .then((res) => {
              const body = new Blob([thumbArrayBuffer], { type: "image/png" });

              fetch(res.signedUrl, {
                body,
                method: 'PUT',
              }).then(async (data) => {
                const thumbnail = data?.url?.split('?')[0];
                setVideos((prev) => prev?.map((v, i) => i === index ? { ...v, thumbnail } : v));
              });
            });

          // Upload the video to S3
          fetch(`/api/s3/presigned?fileName=${file.name}&contentType=${file.type}&s3Bucket=AWS_S3_TT_BUCKET_NAME&region=us-east-2`)
            .then((res) => res.json())
            .then((res) => {
              const body = new Blob([fileData], { type: file.type });

              fetch(res.signedUrl, {
                body,
                method: 'PUT',
              }).then(async (data) => {
                const url = data?.url?.split('?')[0];
                setVideos((prev) => prev?.map((v, i) => i === index ? { ...v, url } : v));
              });
            });
        }
        reader.readAsArrayBuffer(file);
      });
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  async function scheduleVideoToTikTok(video: TikTokVideoProps) {
    try {
      fetch("/api/tiktok/schedule-videos/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoUrl: video.url,
          scheduledDate: new Date(video.scheduleDate || new Date()),
          thumbnail: video.thumbnail,
          accessToken: JSON.parse(tikTokAccessTokens)?.access_token,
          title: video.title,
          yourBrand: video.yourBrand,
          brandedContent: video.brandedContent,
          privacyStatus: video.privacyStatus,
          commercialUseContent: video.commercialUseContent,
          commercialUseOrganic: video.commercialUseOrganic,
          disableDuet: video.interactionType.duet,
          disableComment: video.interactionType.comment,
          disableStitch: video.interactionType.stitch,
          draft: video.draft,
        }),
      }).then(async (data) => {
        console.log("Video scheduled successfully:--------", data);
      });
    } catch (error) {
      console.error("Error scheduling video:", error);
    }
  }

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
  }

  const onSubmit = async (event: ChangeEvent<any>) => {
    event.preventDefault();
    if (!tikTokAccessTokens) {
      console.error("No access token found");
      return;
    }
    if (!!videos && videos.length > 0) {
      for (const [index, video] of videos.entries()) {
        setVideos((prev) => prev?.map((v, i) => i === index ? { ...v, uploadProgress: 2 } : v));
        await scheduleVideoToTikTok(video);
        setVideos((prev) => prev?.map((v, i) => i === index ? { ...v, uploadProgress: 100 } : v));
        setVideos([]);
      }
    }
  };

  useEffect(() => {
    getTikTokCreatorInfo();
  }, []);

  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto mt-6 p-6">
      <form encType="multipart/form-data" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Image src="/tiktok.svg" alt="TikTok Logo" width="30" height="12" />
              <p className="text-xs mt-auto">Upload video max: {minutes}m {remainingSeconds}s</p>
            </div>
            <div className="flex gap-2">
              {!tiktokCreatorInfo ? <Spinner size="medium" /> : (
                <>
                  <img src={tiktokCreatorInfo?.creator_avatar_url} alt="YouTube User Thumbnail" width="35" height="35" className="rounded-full" />
                  <h2 className="text-2xl font-bold text-gray-700">{tiktokCreatorInfo?.creator_nickname}</h2>
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
              <SequentialScheduleSwitch sequentialDate={sequentialDate} setSequentialDate={setSequentialDate} />
            </div>
          )}
        </div>
        <div className="mt-2 mb-5">
          {videos && videos.length > 0 && videos.map((video, index) => (
            <div className="flex gap-6 mb-6" key={video.file.name}>
              <div className="flex flex-col shrink-0 w-1/4 relative">
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
              <div className={cn("flex flex-col w-full", { "opacity-40": !videos || videos.length === 0 })}>
                <div className="flex flex-col gap-4 h-fit w-full border border-gray-100 rounded-xl p-4 bg-white">
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
                  <div className="flex gap-2 items-center">
                    <p className="text-xs font-medium">Upload Draft</p>
                    <Switch
                      checked={video.directPost}
                      onClick={() => editAll ? setVideos(videos.map((v) => ({ ...v, directPost: !v.directPost }))) : setVideos(videos.map((v, i) => i === index ? { ...v, directPost: !v.directPost } : v))}
                      className="flex items-center cursor-pointer"
                    >
                      <SwitchThumb />
                    </Switch>
                    <p className="text-xs font-medium">Direct Post</p>
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
                  </div>
                  {video.directPost && (
                    <>
                      <div className="flex gap-2">
                        <div className="w-1/4 shrink-0">
                          <p className="text-sm font-medium">Title of your video</p>
                          <p className="text-xs text-gray-500">Title displayed on TikTok</p>
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
                            callback={(key, value) => editAll ?
                              setVideos(videos.map((video) => ({ ...video, [key]: value }))) :
                              setVideos(videos.map((v, i) => i === index ? { ...v, [key]: value } : v))}
                          />
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
                          <p className="text-sm font-medium">Video view access</p>
                          <p className="text-xs text-gray-500">Select who can view this video</p>
                        </div>
                        <div className="w-[calc(100%-236px)]">
                          <Select
                            onValueChange={(value) => editAll ?
                              !!videos && setVideos(videos.map((video) => ({ ...video, privacyStatus: value }))) :
                              !!videos && setVideos(videos.map((v, i) => i === index ? { ...v, privacyStatus: value } : v))}
                            value={videos && videos[index]?.privacyStatus}
                          >
                            <SelectTrigger className="outline-0 border border-gray-300 bg-transparent rounded h-10 ml-2">
                              <SelectValue placeholder="Select an option" />
                            </SelectTrigger>
                            <SelectContent>
                              {ALL_PRIVACY_STATUS_OPTIONS.filter((item) => tiktokCreatorInfo?.privacy_level_options?.includes(item.id)).map((item) => (
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
                          <p className="text-sm font-medium">Allow user access</p>
                          <p className="text-xs text-gray-500">Give users permission to interact with your video</p>
                        </div>
                        <div className="flex gap-4 ml-2 w-[calc(100%-236px)]">
                          {Object.values(VIDEO_ACCESS_OPTIONS).map((option) => (
                            <button
                              key={option.name}
                              onClick={(e) => {
                                e.preventDefault();
                                !!videos &&
                                  editAll ? setVideos(videos.map((video) => ({
                                    ...video, interactionType: {
                                      ...video.interactionType,
                                      [option.name]: !video.interactionType[option.name],
                                    }
                                  }))) : setVideos(videos.map((v, i) => i === index ? {
                                    ...v,
                                    interactionType: {
                                      ...v.interactionType,
                                      [option.name]: !v.interactionType[option.name],
                                    },
                                  } : v));
                              }}
                              disabled={!!tiktokCreatorInfo?.[`${option.name}_disabled`]}
                              className={cn("flex flex-col flex-1 items-center gap-2 mb-2 border border-gray-300 rounded p-2",
                                { "border-blue-700": videos?.[index]?.interactionType[option.name] }
                              )}
                            >
                              <option.icon strokeWidth={1.5} size={16} className={
                                cn("text-gray-600", {
                                  "text-blue-700": videos?.[index]?.interactionType[option.name],
                                  "opacity-50": !!tiktokCreatorInfo?.[`${option.name}_disabled`]
                                })}
                              />
                              <p className={
                                cn("text-sm capitalize", {
                                  "text-blue-700": videos?.[index]?.interactionType[option.name],
                                  "text-gray-500": !!tiktokCreatorInfo?.[`${option.name}_disabled`]
                                })}
                              >
                                {option.name}
                              </p>
                            </button >
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <div className="flex gap-4 items-center">
                            <p className="text-sm font-medium">Disclose video content</p>
                            <Switch
                              checked={videos?.[index]?.disclose}
                              className="cursor-pointer"
                              onClick={() => {
                                !!videos &&
                                  editAll ?
                                  setVideos(videos.map((video) => ({ ...video, disclose: !videos[index].disclose }))) :
                                  setVideos(videos.map((v, i) => i === index ? {
                                    ...v,
                                    disclose: !videos[index].disclose,
                                  } : v));
                              }}
                            >
                              <SwitchThumb />
                            </Switch>
                          </div>
                        </div>
                        {videos[index].disclose && (
                          <div className="bg-blue-100 text-blue-900 text-sm p-3 rounded mb-1">
                            Your video will be labeled “Promotional content”. This cannot be changed once your video is posted.
                          </div>
                        )}
                        <p className="text-xs text-gray-500">Turn on to disclose that this video promotes goods or services in exchange for something of value. Your video could promote yourself, a third party, or both.</p>

                        {videos[index].disclose && (
                          <div className="flex flex-col gap-2 pt-4 px-4">
                            <div className="mb-3">
                              <label className="flex items-start space-x-3">
                                <input
                                  type="checkbox"
                                  checked={videos[index].yourBrand}
                                  onChange={() => editAll ?
                                    setVideos(videos.map((v) => ({ ...v, yourBrand: !videos[index].yourBrand }))) :
                                    setVideos(videos.map((v, i) => i === index ? {
                                      ...v,
                                      yourBrand: !videos[index].yourBrand
                                    } : v))}
                                  className="mt-[4px]"
                                />
                                <div>
                                  <p className="text-sm font-medium">Your brand</p>
                                  <p className="text-sm text-gray-600">
                                    You are promoting yourself or your own business. This video will be classified as Brand Organic.
                                  </p>
                                </div>
                              </label>
                            </div>

                            <div>
                              <label className="flex items-start space-x-3">
                                <input
                                  type="checkbox"
                                  disabled={videos?.[index]?.privacyStatus === "SELF_ONLY"}
                                  checked={videos?.[index].brandedContent}
                                  onChange={() => editAll ?
                                    setVideos(videos.map((v) => ({ ...v, brandedContent: !videos[index].brandedContent }))) :
                                    setVideos(videos.map((v, i) => i === index ? {
                                      ...v,
                                      brandedContent: !videos[index].brandedContent
                                    } : v))}
                                  className="mt-[4px]"
                                />
                                <div>
                                  <p className={cn("text-sm font-medium", { "text-gray-500": videos?.[index]?.privacyStatus === "SELF_ONLY" })} >Branded content</p>
                                  {videos?.[index]?.privacyStatus === "SELF_ONLY" && (<p className="text-red-600 text-xs">Visibility for branded content can"t be private.</p>)}
                                  <p className={cn("text-sm text-gray-600", { "text-gray-500": videos?.[index]?.privacyStatus === "SELF_ONLY" })}>
                                    You are promoting another brand or a third party. This video will be classified as Branded Content.
                                  </p>
                                </div>
                              </label>
                            </div>

                            {(videos?.[index].yourBrand || videos?.[index].brandedContent) && (
                              <p className="text-sm text-gray-600">
                                By posting, you agree to TikTok"s{" "}

                                {videos?.[index].brandedContent && (
                                  <>
                                    <a href="https://www.tiktok.com/legal/page/global/music-usage-confirmation/en" target="_blank" className="text-blue-600 underline">
                                      Branded Content Policy{" "}
                                    </a>
                                    and{" "}
                                  </>
                                )}
                                <a href="https://www.tiktok.com/legal/page/global/bc-policy/en" target="_blank" className="text-blue-600 underline">Music Usage Confirmation</a>.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
          {videos && videos.length > 0 && (
            <>
              <div className="flex gap-2 mt-5">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => {
                    setVideos(undefined)
                  }}
                  className="flex flex-1 gap-2"
                >
                  <RotateCcw strokeWidth={2} />
                  Reset Video{videos && videos?.length > 1 ? "s" : ""}
                </Button>
                <Button
                  variant="secondary"
                  type="submit"
                  disabled={!videos?.every(v => v.privacyStatus !== "" || !v.directPost)}
                  onClick={onSubmit}
                  className="flex flex-1 items-center gap-2"
                >
                  <CloudUpload />
                  Upload {videos && videos.length} Video{videos && videos.length > 1 ? "s" : ""} to TikTok
                </Button>
              </div>
              <div className="bg-amber-100 text-amber-900 text-sm p-3 mt-4 rounded">
                By posting, you agree to TikTok"s <a href="https://www.tiktok.com/legal/page/global/music-usage-confirmation/en" target="_blank" className="text-amber-600 underline">Music Usage Confirmation</a>.
              </div>
            </>
          )}

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
                <div className="flex gap-2 items-center">
                  <p className="text-xs font-medium">Upload Draft</p>
                  <Switch
                    checked={true}
                    className="flex items-center cursor-pointer"
                  >
                    <SwitchThumb />
                  </Switch>
                  <p className="text-xs font-medium">Direct Post</p>
                </div>
                <>
                  <div className="flex gap-2">
                    <div className="w-1/4 shrink-0">
                      <p className="text-sm font-medium">Title of your video</p>
                      <p className="text-xs text-gray-500">Title displayed on TikTok</p>
                    </div>
                    <input
                      className="border border-gray-300 rounded w-full h-10 px-2 py-1 outline-0 bg-transparent ml-2"
                      name="title"
                    />
                    <div className="flex items-start">
                      <KeyReferenceAddButton
                        type="title"
                        value=""
                        localReferences={localReferences}
                        setLocalReferences={setLocalReferences}
                      />
                      <KeyReferenceMenuButton
                        type="title"
                        localReferences={localReferences}
                        setLocalReferences={setLocalReferences}
                        callback={(key, value) => setVideos(videos?.map((video) => ({ ...video, [key]: value })))}
                      />
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
                        value={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-1/4 shrink-0">
                      <p className="text-sm font-medium">Video view access</p>
                      <p className="text-xs text-gray-500">Select who can view this video</p>
                    </div>
                    <div className="w-[calc(100%-236px)]">
                      <Select>
                        <SelectTrigger className="outline-0 border border-gray-300 bg-transparent rounded h-10 ml-2">
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-1/4 shrink-0">
                      <p className="text-sm font-medium">Allow user access</p>
                      <p className="text-xs text-gray-500">Give users permission to interact with your video</p>
                    </div>
                    <div className="flex gap-4 ml-2 w-[calc(100%-236px)]">
                      {Object.values(VIDEO_ACCESS_OPTIONS).map((option) => (
                        <button
                          key={option.name}
                          className="flex flex-col flex-1 items-center gap-2 mb-2 border border-gray-300 rounded p-2"
                        >
                          <option.icon strokeWidth={1.5} size={16} className={
                            cn("text-gray-600", {
                              "opacity-50": !!tiktokCreatorInfo?.[`${option.name}_disabled`]
                            })}
                          />
                          <p className={
                            cn("text-sm capitalize", {
                              "text-gray-500": !!tiktokCreatorInfo?.[`${option.name}_disabled`]
                            })}
                          >
                            {option.name}
                          </p>
                        </button >
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <div className="flex gap-4 items-center">
                        <p className="text-sm font-medium">Disclose video content</p>
                        <Switch
                          checked={false}
                          className="cursor-pointer"
                        >
                          <SwitchThumb />
                        </Switch>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">Turn on to disclose that this video promotes goods or services in exchange for something of value. Your video could promote yourself, a third party, or both.</p>
                  </div>
                </>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
