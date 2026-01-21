import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/app/components/primitives/Dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/primitives/Select";
import { Progress } from "@/app/components/primitives/Progress";
import Button from "@/app/components/primitives/Button";
import { Switch, SwitchThumb } from "@/app/components/primitives/Switch";
import KeyReferenceAddButton from "@/app/components/KeyReferenceAddButton";
import KeyReferenceMenuButton from "@/app/components/KeyReferenceMenuButton";
import UploadPreview from "@/app/components/UploadPreview";
import { cn } from "@/app/utils/cn";
import { ALL_PRIVACY_STATUS_OPTIONS, VIDEO_ACCESS_OPTIONS } from "@/app/constants";
import { useEffect, useState } from "react";
import moment from "moment";
import { getCookie } from "cookies-next"
import { TikTokUserCreatorInfo, TikTokVideoProps } from "@/types";
import SequentialScheduleSwitch from "./SequentialScheduleSwitch";
import { CloudUpload, RotateCcw, TriangleAlert } from "lucide-react";
import { Reference } from "@prisma/client";

type TiktokUploadDialogContentProps = {
  videos: TikTokVideoProps[];
  setVideos: React.Dispatch<React.SetStateAction<any[]>>;
  references: Reference[];
  setResetVideos: (reset: boolean) => void;
  setUploadVideoModalOpen: (open: boolean) => void;
};

const TiktokUploadDialogContent = ({ videos, setVideos, references, setResetVideos, setUploadVideoModalOpen }: TiktokUploadDialogContentProps) => {
  const tikTokAccessTokens = getCookie("tiktok-tokens") as string;
  const [localReferences, setLocalReferences] = useState<Reference[]>(references || []);
  const [tiktokCreatorInfo, setTiktokCreatorInfo] = useState<TikTokUserCreatorInfo>();
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
      }).then(response => response.json())
        .then(async ({ data }) => {
          console.log("Scheduled video response:", data);
        })
        .catch(error => {
          console.error("Fetch error:", error);
        });
    } catch (error) {
      console.error("Error scheduling video:", error);
    }
  }

  const onSubmit = async (index?: number) => {
    if (!tikTokAccessTokens) {
      console.error("No access token found");
      return;
    }
    if (index !== undefined) {
      await scheduleVideoToTikTok(videos[index]);
    } else {
      if (!!videos && videos.length > 0) {
        for (const video of videos) {
          await scheduleVideoToTikTok(video);
        }
      }
    }
  };

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

  useEffect(() => {
    getTikTokCreatorInfo();
  }, []);

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
          service="TikTok"
          video={video}
          index={index}
          avatarUrl={tiktokCreatorInfo?.creator_avatar_url || null}
          nickname={tiktokCreatorInfo?.creator_nickname || ""}
          onSubmit={onSubmit}
          disabled={video.directPost && (video.privacyStatus === "" || (video.disclose && (!video.yourBrand && !video.brandedContent)))}
          disabledReason={video.disclose && (!video.yourBrand && !video.brandedContent) ? "You need to indicate if your content promotes yourself, a third party, or both." : "You need to indecate who can view this video."}
          setResetVideos={setResetVideos}
          setUploadVideoModalOpen={setUploadVideoModalOpen}
        >
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
          </div>
          {video.directPost && (
            <>
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">Caption</p>
                <div className="relative group/caption">

                  <textarea
                    onChange={event => editAll ?
                      !!videos && setVideos(videos.map((video) => ({ ...video, title: event.currentTarget.value }))) :
                      !!videos && setVideos(videos.map((v, i) => i === index ? { ...v, title: event.currentTarget.value } : v))}
                    className="border border-gray-300 rounded min-h-12 w-full px-2 py-1 outline-0 bg-transparent"
                    placeholder="Add a title that describes your video"
                    name="title"
                    value={videos && videos[index]?.title}
                    maxLength={100}
                  />
                  <div className="absolute bottom-4 right-4 text-xs text-gray-500">{videos && videos[index]?.title.length}/100</div>
                  <div className="absolute hidden group-hover/caption:flex top-1/2 right-2 -translate-y-1/2">
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
              </div>

              <div className="flex gap-2">
                <div className="shrink-0">
                  <p className="text-sm font-medium">Scheduled Date</p>
                  <p className="text-xs text-gray-500">Video release</p>
                </div>
                <div className="w-full">
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

              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">Who can view this video</p>
                <div className="w-full">
                  <Select
                    onValueChange={(value) => editAll ?
                      !!videos && setVideos(videos.map((video) => ({ ...video, privacyStatus: value }))) :
                      !!videos && setVideos(videos.map((v, i) => i === index ? { ...v, privacyStatus: value } : v))}
                    value={videos && videos[index]?.privacyStatus}
                  >
                    <SelectTrigger className="outline-0 border border-gray-300 bg-transparent rounded h-10">
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
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">Allow user to</p>
                <div className="flex gap-6 items-center">
                  {Object.values(VIDEO_ACCESS_OPTIONS).map((option) => (
                    <div
                      key={option.name}
                      className={cn("flex items-center gap-2",
                        { "border-blue-700": videos?.[index]?.interactionType[option.name] }
                      )}
                    >
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          const checked = (e.target as HTMLInputElement).checked;
                          editAll ?
                            setVideos(videos.map((video) => ({
                              ...video,
                              interactionType: {
                                ...video.interactionType,
                                [option.name]: checked,
                              }
                            }))) :
                            setVideos(videos.map((v, i) => i === index ? {
                              ...v,
                              interactionType: {
                                ...v.interactionType,
                                [option.name]: checked,
                              }
                            } : v));
                        }}
                        disabled={!!tiktokCreatorInfo?.[`${option.name}_disabled`]}
                        checked={videos?.[index]?.interactionType[option.name]}
                        className="size-4"
                      />

                      <p className={
                        cn("text-sm capitalize", {
                          "text-blue-700": videos?.[index]?.interactionType[option.name],
                          "text-gray-500": !!tiktokCreatorInfo?.[`${option.name}_disabled`]
                        })}
                      >
                        {option.name}
                      </p>
                    </div>
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
                  <div className="flex gap-3 text-sm p-3 rounded-lg mb-1 bg-blue-100">
                    <div className="size-4 shrink-0 p-2 bg-blue-600 rounded-full inline-flex items-center justify-center mt-1 mb-2">
                      <p className="font-semibold text-white">!</p>
                    </div>
                    <p>Your video will be labeled {videos?.[index].brandedContent ? '"Paid partnership"' : '"Promotional content"'}. <br />This cannot be changed once your video is posted.</p>
                  </div>
                )}
                <p className="text-xs text-gray-600">Turn on to disclose that this video promotes goods or services in exchange for something of value. Your video could promote yourself, a third party, or both.</p>

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
                        By posting, you agree to TikTok's{" "}

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
              disabled={!videos?.every(v => v.privacyStatus !== "" || !v.directPost)}
              onClick={(e) => {
                e.preventDefault();
                setConfirmUploadVideoModalOpen(true);
              }}
              className="flex flex-1 items-center gap-2"
            >
              <CloudUpload />
              Upload {videos && videos.length} Video{videos && videos.length > 1 ? "s" : ""} to TikTok
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
              <div className="flex gap-2 items-center bg-amber-100 text-amber-900 text-sm p-3 mt-4 rounded">
                <TriangleAlert size={18} />
                By posting, you agree to TikTok"s <a href="https://www.tiktok.com/legal/page/global/music-usage-confirmation/en" target="_blank" className="text-amber-600 underline">Music Usage Confirmation</a>.
              </div>
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
  );
};

export default TiktokUploadDialogContent;