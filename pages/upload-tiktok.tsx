import { MenuProvider, Menu, MenuButton, MenuItem } from "@/app/components/primitives/Menu";
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
import clsx from "clsx";
import prisma from "@/lib/prisma";
import { Reference } from "@prisma/client";
const transparentImage = require("@/public/transparent.png");
import { getServerSession } from "next-auth"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { useCallback, useEffect, useState } from "react";
import { BookMarked, BookmarkPlus, MessageCircle, SwitchCamera, Upload, Trash2, RotateCcw, MessagesSquare, CloudUpload, X } from "lucide-react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { getCookie } from "cookies-next"
import { TikTokUserCreatorInfo, TikTokVideoProps } from "@/types"
import generateVideoThumb from "@/app/utils/generateVideoThumb";
import { cn } from "@/app/utils/cn";
import secondsToMinutesAndSeconds from "@/app/utils/secondsToMinutes";

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

const CHUNK_SIZE = 10000000; // 10MB

const ALL_PRIVACY_STATUS_OPTIONS = [
  { id: "PUBLIC_TO_EVERYONE", label: "Public to Everyone" },
  { id: "MUTUAL_FOLLOW_FRIENDS", label: "Mutual Follow Friends" },
  { id: "FOLLOWER_OF_CREATOR", label: "Followers of Creator" },
  { id: "SELF_ONLY", label: "Unlisted" },
];

type VideoAccessOption = {
  name: "comment" | "duet" | "stitch";
  icon: React.ComponentType<{ strokeWidth?: number; size?: number; className?: string }>;
};

const VIDEO_ACCESS_OPTIONS: VideoAccessOption[] = [
  { name: "comment", icon: MessageCircle },
  { name: "duet", icon: MessagesSquare },
  { name: "stitch", icon: SwitchCamera }
];

type KeyReferenceMenuProps = {
  type: string;
  localReferences: Reference[];
  setLocalReferences: React.Dispatch<React.SetStateAction<Reference[]>>;
  setVideos: React.Dispatch<React.SetStateAction<TikTokVideoProps[] | undefined>>;
  currentVideoIndex: number;
};

const KeyReferenceMenu = ({ type, localReferences, setLocalReferences, setVideos, currentVideoIndex }: KeyReferenceMenuProps) => {
  const setReference = (value: string, key: string) => {
    setVideos((prevVideos) => {
      if (!prevVideos) return prevVideos;
      return prevVideos.map((video, index) => {
        if (index === currentVideoIndex) {
          return {
            ...video,
            [key]: value,
          };
        }
        return video;
      });
    });
  };

  const deleteReference = (id: string) => {
    fetch(`/api/reference/delete/${id}`, {
      method: "DELETE",
    }).then(() => {
      setLocalReferences(localReferences.filter((reference) => reference.id !== id));
    });
  };

  return (
    <MenuProvider>
      <MenuButton>
        <BookMarked strokeWidth={1.5} size={24} className={clsx("text-gray-600", { "opacity-50": localReferences.length === 0 })} />
      </MenuButton>
      <Menu>
        {localReferences
          .filter((reference) => reference.type === type)
          .map((ref) =>
            <MenuItem key={ref.id}>
              <button
                type="button"
                key={ref.id}
                onClick={() => setReference(ref.value, type)}
                className="truncate max-w-48 mr-2"
              >
                {ref.value}
              </button>
              <button type="button" onClick={() => deleteReference(ref.id)} className="hover:bg-gray-300 rounded">
                <Trash2 strokeWidth={1} size={18} />
              </button>
            </MenuItem>
          )
        }
      </Menu>
    </MenuProvider>
  )
};

type KeyReferenceAddButtonProps = {
  type: string;
  value: string;
  localReferences: Reference[];
  setLocalReferences: React.Dispatch<React.SetStateAction<Reference[]>>;
};

const KeyReferenceAddButton = ({ type, value, localReferences, setLocalReferences }: KeyReferenceAddButtonProps) => {
  const disabled = !value ||
    !!localReferences
      .filter((reference) => reference.type === type)
      .find((reference) => reference.value === value);

  const setReferencePost = useCallback((value: string, type: string) => {
    fetch("/api/reference/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        referenceTitle: value.split(" ").slice(0, 2).join(" "),
        referenceValue: value,
        referenceType: type,
        publish: true,
      }),
    }).then(async (data) => {
      const newReference = await data.json();
      setLocalReferences([...localReferences, newReference]);
    });
  }, []);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => setReferencePost(value, type)}
      className="hover:bg-gray-200 rounded-md p-1 disabled:opacity-50 h-fit disabled:bg-transparent"
    >
      <BookmarkPlus size={24} strokeWidth={1.5} className={clsx("text-gray-600", { "opacity-50": disabled })} />
    </button>
  );
};

type UploadChunksProps = {
  file: File;
  uploadUrl: string;
  setUploadProgress: React.Dispatch<React.SetStateAction<number>>;
  setVideos: React.Dispatch<React.SetStateAction<TikTokVideoProps[] | undefined>>;
  setDisclose?: React.Dispatch<React.SetStateAction<boolean>>;
  setYourBrand?: React.Dispatch<React.SetStateAction<boolean>>;
  setBrandedContent?: React.Dispatch<React.SetStateAction<boolean>>;
};

const uploadChunks = async ({ file, uploadUrl, setUploadProgress, setVideos, setDisclose, setYourBrand, setBrandedContent }: UploadChunksProps) => {
  const totalSize = file.size;
  let offset = 0;
  let chunkIndex = 0;
  while (offset + CHUNK_SIZE < totalSize) {
    let contentRange = ""
    let chunk = null;
    if ((offset + (CHUNK_SIZE * 2)) > totalSize) {
      chunk = file.slice(offset, totalSize);
      contentRange = `bytes ${offset}-${totalSize - 1}/${totalSize}`;
    } else {
      chunk = file.slice(offset, offset + CHUNK_SIZE);
      contentRange = `bytes ${offset}-${offset + chunk.size - 1}/${totalSize}`;
    }

    const res = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Range": contentRange,
        "Content-Length": chunk.size.toString(),
        "Content-Type": "video/mp4",
      },
      body: chunk,
    });

    if (!res.ok) {
      console.error(`Chunk ${chunkIndex} failed, Response status: ${res.status}`);
      return;
    }
    if (res.status === 206) {
      setUploadProgress((prev) => prev + (chunk.size / totalSize) * 100);
    }
    if (res.status === 201) {
      setVideos(undefined);
      setUploadProgress(0);
      setDisclose?.(false);
      setYourBrand?.(false);
      setBrandedContent?.(false);
      return;
    }

    offset += CHUNK_SIZE;
    chunkIndex++;
  }
};

export default function UploadTikTokPage({ references }: { references: Reference[] }) {
  const tikTokAccessToken = getCookie("tiktok-tokens");

  const [videos, setVideos] = useState<TikTokVideoProps[] | undefined>(undefined);
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(0);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [localReferences, setLocalReferences] = useState<Reference[]>(references || []);
  const [disclose, setDisclose] = useState<boolean>(false);
  const [yourBrand, setYourBrand] = useState<boolean>(false);
  const [brandedContent, setBrandedContent] = useState<boolean>(false);
  const [tiktokCreatorInfo, setTiktokCreatorInfo] = useState<TikTokUserCreatorInfo>();
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const { minutes, remainingSeconds } = secondsToMinutesAndSeconds(tiktokCreatorInfo?.max_video_post_duration_sec || 0)

  const onDrop = useCallback((acceptedFiles: any) => {
    if (acceptedFiles.length) {
      acceptedFiles.forEach(async (file: any) => {
        const thumb = await generateVideoThumb(file);
        setThumbnails((prev) => [...prev, thumb as string]);
        setVideos((prev) => [
          ...prev || [], {
            file,
            title: "",
            privacyStatus: "",
            commercialUseContent: false,
            commercialUseOrganic: false,
            interactionType: {
              comment: false,
              duet: false,
              stitch: false,
            },
            directPost: true,
          }]);
      });
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const getTikTokCreatorInfo = async () => {
    fetch("/api/tiktok/get-creator-info", {
      method: "GET",
    })
      .then(response => response.json())
      .then(({ data }) => {
        setTiktokCreatorInfo({ ...data });
      })
      .catch(error => {
        console.error("Fetch error:", error);
      });
  }

  const uploadTikTokVideo = async ({ draft }: { draft: boolean }) => {
    if (!videos) return;
    await fetch("/api/tiktok/direct-post-init", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: `tokens=${JSON.parse(tikTokAccessToken as string || "{}").access_token}`,
      },
      body: JSON.stringify({
        draft,
        post_info: {
          title: videos[currentVideoIndex].title,
          privacy_level: videos[currentVideoIndex]?.privacyStatus || "SELF_ONLY",
          disable_duet: !videos[currentVideoIndex]?.interactionType.duet,
          disable_comment: !videos[currentVideoIndex]?.interactionType.comment,
          disable_stitch: !videos[currentVideoIndex]?.interactionType.stitch,
          video_cover_timestamp_ms: 1000,
          brand_content_toggle: brandedContent,
          brand_organic_toggle: yourBrand,
        },
        source_info: {
          source: "FILE_UPLOAD",
          video_size: videos[currentVideoIndex]?.file?.size || 0,
          chunk_size: CHUNK_SIZE,
          total_chunk_count: Math.floor((videos[currentVideoIndex]?.file?.size || 0) / CHUNK_SIZE)
        }
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(async ({ data }) => {
        await uploadChunks({ file: videos[currentVideoIndex].file, uploadUrl: data.upload_url, setUploadProgress, setVideos, setDisclose, setYourBrand, setBrandedContent });
      })
      .catch((error) => {
        console.error("Error uploading video:", error);
        setUploadProgress(0);
      });
  };

  const onSubmit = async (event: React.ChangeEvent<any>) => {
    event.preventDefault();
    if (!tikTokAccessToken) {
      console.error("No access token found");
      return;
    }
    if (!!videos && videos.length > 0) {
      await uploadTikTokVideo({ draft: videos[currentVideoIndex].directPost });
    }
  };

  useEffect(() => {
    getTikTokCreatorInfo();
  }, []);

  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto mt-6 p-6">
      <form action="uploadVideo" method="post" encType="multipart/form-data" className="mt-12 w-full">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <Image src="/tiktok.svg" alt="TikTok Logo" width="30" height="12" />
            <p className="text-xs mt-auto">Upload video max: {minutes}m {remainingSeconds}s</p>
          </div>
          <div className="flex gap-4">
            {tiktokCreatorInfo?.creator_avatar_url && <img src={tiktokCreatorInfo.creator_avatar_url} alt="YouTube User Thumbnail" width="35" height="35" className="rounded-full" />}
            <h2 className="text-2xl font-bold text-gray-700">{tiktokCreatorInfo?.creator_nickname}</h2>
          </div>
        </div>

        <div className="mt-2 mb-5">
          {videos && videos.length > 0 && videos.map((video, index) => (
            <div className="flex gap-6 mb-6" key={video.file.name}>
              <div className="flex flex-col shrink-0 w-1/4">
                <img
                  src={thumbnails[index] || transparentImage}
                  alt="thumbnail"
                  className="rounded-xl h-full object-cover"
                />

                {!!videos && videos.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    <div className="font-semibold text-xs truncate ml-2">{videos[index]?.file.name}</div>
                    <div className="font-semibold text-xs ml-auto mr-2">{`${Math.round(videos[index]?.file.size / 100000) / 10}MB`}</div>
                  </div>
                )}
              </div>
              <div className={cn("flex flex-col w-full", { "opacity-40": !videos || videos.length === 0 })}>
                <div className="flex flex-col gap-4 h-fit w-full border border-gray-100 rounded-xl p-4 bg-white">
                  {uploadProgress > 0 && (
                    <div className="flex gap-2 w-full items-center">
                      <p className="text-sm font-medium w-1/4 shrink-0">Upload progress</p>
                      <div className="px-2 w-full"><Progress value={uploadProgress} /></div>
                    </div>
                  )}
                  <div className="flex gap-2 items-center">
                    <p className="text-xs font-medium">Upload Draft</p>
                    <Switch
                      checked={video.directPost}
                      onClick={() => setVideos(videos.map((v, i) => i === index ? { ...v, directPost: !v.directPost } : v))}
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
                          setThumbnails(thumbnails.filter((_, i) => i !== index));
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
                          onChange={event => !!videos && setVideos(videos.map((v, i) => i === index ? { ...v, title: event.currentTarget.value } : v))}
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
                          <KeyReferenceMenu
                            type="title"
                            localReferences={localReferences}
                            setLocalReferences={setLocalReferences}
                            setVideos={setVideos}
                            currentVideoIndex={index}
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
                            onValueChange={(value) => !!videos && setVideos(videos.map((v, i) => i === index ? { ...v, privacyStatus: value } : v))}
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
                                  setVideos(videos.map((v, i) => i === index ? {
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
                              checked={disclose}
                              className="cursor-pointer"
                              onClick={() => {
                                setDisclose(!disclose);
                                !!videos &&
                                  setVideos(videos.map((v, i) => i === index ? {
                                    ...v,
                                    commercialUseContent: !disclose,
                                  } : v)
                                  );
                                if (!disclose) {
                                  setYourBrand(false);
                                  setBrandedContent(false);
                                } else {
                                  setYourBrand(true);
                                }
                              }}
                            >
                              <SwitchThumb />
                            </Switch>
                          </div>
                        </div>
                        {disclose && (
                          <div className="bg-blue-100 text-blue-900 text-sm p-3 rounded mb-1">
                            Your video will be labeled “Promotional content”. This cannot be changed once your video is posted.
                          </div>
                        )}
                        <p className="text-xs text-gray-500">Turn on to disclose that this video promotes goods or services in exchange for something of value. Your video could promote yourself, a third party, or both.</p>

                        {disclose && (
                          <div className="flex flex-col gap-2 pt-4 px-4">
                            <div className="mb-3">
                              <label className="flex items-start space-x-3">
                                <input
                                  type="checkbox"
                                  checked={yourBrand}
                                  onChange={() => setYourBrand(!yourBrand)}
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
                                  checked={brandedContent}
                                  onChange={() => setBrandedContent(!brandedContent)}
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

                            {(yourBrand || brandedContent) && (
                              <p className="text-sm text-gray-600">
                                By posting, you agree to TikTok"s{" "}

                                {brandedContent && (
                                  <>
                                    <a href="https://www.tiktok.com/legal/page/global/music-usage-confirmation/en" className="text-blue-600 underline">
                                      Branded Content Policy{" "}
                                    </a>
                                    and{" "}
                                  </>
                                )}
                                <a href="https://www.tiktok.com/legal/page/global/bc-policy/en" className="text-blue-600 underline">Music Usage Confirmation</a>.
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
          <div className="flex gap-6 mt-8">
            <div className="flex flex-col shrink-0 w-1/4 gap-2">
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
              <div className="mt-1">&nbsp;</div>
            </div>
            <div className="flex flex-col w-full opacity-40">
              <div className="flex flex-col gap-5 h-fit w-full border border-gray-100 rounded-xl p-4 bg-white">
                {uploadProgress > 0 && (
                  <div className="flex gap-2 w-full items-center">
                    <p className="text-sm font-medium w-1/4 shrink-0">Upload progress</p>
                    <div className="px-2 w-full"><Progress value={uploadProgress} /></div>
                  </div>
                )}
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
                      <KeyReferenceMenu
                        type="title"
                        localReferences={localReferences}
                        setLocalReferences={setLocalReferences}
                        setVideos={setVideos}
                        currentVideoIndex={Infinity}
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
                          checked={disclose}
                          className="cursor-pointer"
                        >
                          <SwitchThumb />
                        </Switch>
                      </div>
                    </div>
                    {disclose && (
                      <div className="bg-blue-100 text-blue-900 text-sm p-3 rounded mb-1">
                        Your video will be labeled “Promotional content”. This cannot be changed once your video is posted.
                      </div>
                    )}
                    <p className="text-xs text-gray-500">Turn on to disclose that this video promotes goods or services in exchange for something of value. Your video could promote yourself, a third party, or both.</p>

                    {disclose && (
                      <div className="flex flex-col gap-2 pt-4 px-4">
                        <div className="mb-3">
                          <label className="flex items-start space-x-3">
                            <input
                              type="checkbox"
                              checked={yourBrand}
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
                              checked={true}
                              className="mt-[4px]"
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-5">
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                setVideos(undefined)
                setDisclose(false);
                setYourBrand(false);
              }}
              className="flex flex-1 gap-2"
            >
              <RotateCcw strokeWidth={2} />
              Reset Video{videos && videos?.length > 1 ? "s" : ""}
            </Button>
            <Button
              variant="secondary"
              type="submit"
              disabled={true}
              onClick={onSubmit}
              className="flex flex-1 items-center gap-2"
            >
              <CloudUpload />
              Upload {videos && videos.length} Video{videos && videos.length > 1 ? "s" : ""} to TikTok
            </Button>
          </div>
          <div className="bg-amber-100 text-amber-900 text-sm p-3 mt-4 rounded">
            By posting, you agree to TikTok"s <a href="https://www.tiktok.com/legal/page/global/music-usage-confirmation/en" className="text-amber-600 underline">Music Usage Confirmation</a>.
          </div>
        </div>
      </form>
    </div>
  );
}
