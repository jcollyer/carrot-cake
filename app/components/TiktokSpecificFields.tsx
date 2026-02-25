import { Switch, SwitchThumb } from "@/app/components/primitives/Switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/app/components/primitives/Select";
import { ALL_PRIVACY_STATUS_OPTIONS, VIDEO_ACCESS_OPTIONS } from "@/app/constants";
import { TikTokUserCreatorInfo, TikTokVideoProps } from "@/types";
import { Info } from "lucide-react";
import { cn } from "@/app/utils/cn";

const TiktokSpecificFields = ({
  videos,
  setVideos,
  index,
  editAll,
  tiktokCreatorInfo
}: {
  videos: TikTokVideoProps[];
  setVideos: React.Dispatch<React.SetStateAction<TikTokVideoProps[]>>;
  index: number;
  editAll: boolean;
  tiktokCreatorInfo?: TikTokUserCreatorInfo;
}) => {
  return (
    <div className="flex flex-col gap-4 w-full border-2 border-gray-600 rounded p-4">
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
                <SelectItem key={item.id} value={item.id} disabled={videos?.[index].brandedContent && item.id === "SELF_ONLY"}>
                  {item.label}
                  {videos?.[index].brandedContent && item.id === "SELF_ONLY" && (
                    <div className="flex gap-2 items-center mt-1">
                      <Info size={16} className="text-red-700" />
                      <p className="text-xs text-red-700">Branded content visibility cannot be set to private</p>
                    </div>
                  )}
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
                { "border-blue-700": videos?.[index]?.interactionType?.[option.name] }
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
                checked={videos?.[index]?.interactionType?.[option.name]}
                className="size-4"
              />

              <p className={
                cn("text-sm capitalize", {
                  "text-blue-700": videos?.[index]?.interactionType?.[option.name],
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
    </div>
  );
}

export default TiktokSpecificFields;