import KeyReferenceAddButton from "@/app/components/KeyReferenceAddButton";
import KeyReferenceMenuButton from "@/app/components/KeyReferenceMenuButton";
import { Dispatch, SetStateAction } from "react";

type UploadTextareaProps = {
  editAll: boolean;
  videos: any[];
  setVideos: Dispatch<SetStateAction<any[]>>;
  editMultiple?: { [service: string]: boolean };
  index: number;
  localReferences: {
    title: string;
    value: string;
    type: string;
    id: string;
    userId: string | null;
    publish: boolean;
  }[];
  setLocalReferences: Dispatch<SetStateAction<{
    id: string;
    userId: string | null;
    title: string;
    value: string;
    type: string;
    publish: boolean;
  }[]>>
  header: string;
  placeholder: string;
  type: string;
}

const UploadTextarea = ({
  editAll,
  videos,
  setVideos,
  index,
  localReferences,
  setLocalReferences,
  editMultiple,
  header,
  placeholder,
  type
}: UploadTextareaProps) => {

  // When multiple platforms are active, a single textarea must populate the
  // correct field for every selected service.  Instagram reads `caption` while
  // TikTok / YouTube read `title`, so we always write to all relevant fields
  // to avoid the other platform receiving an empty value.
  const getFieldUpdates = (value: string): Record<string, string> => {
    const updates: Record<string, string> = { [type]: value };
    if (editMultiple?.instagram) updates.caption = value;
    if (editMultiple?.tiktok || editMultiple?.youtube) updates.title = value;
    return updates;
  };

  return (
    <div className="relative flex flex-col gap-2">
      {!!editMultiple && Object.values(editMultiple).filter(Boolean).length > 0 && (
        <div className="absolute top-0 right-0 flex gap-1">
          {editMultiple?.instagram && (
            <p className="bg-yellow-100 text-yellow-800 text-xs px-1 py-px rounded">IG</p>
          )}
          {editMultiple?.youtube && (
            <p className="bg-yellow-100 text-yellow-800 text-xs px-1 py-px rounded">YT</p>
          )}
          {editMultiple?.tiktok && (
            <p className="bg-yellow-100 text-yellow-800 text-xs px-1 py-px rounded">TT</p>
          )}
        </div>
      )}
      <p className="text-sm font-medium">{header}</p>
      <div className="relative group/caption">
        <textarea
          onChange={event => {
            const updates = getFieldUpdates(event.currentTarget.value);
            editAll
              ? !!videos && setVideos(videos.map((video) => ({ ...video, ...updates })))
              : !!videos && setVideos(videos.map((v, i) => i === index ? { ...v, ...updates } : v));
          }}
          className="border border-gray-300 rounded min-h-12 w-full px-2 py-1 outline-0 bg-transparent"
          placeholder={placeholder}
          name={type}
          value={videos && videos[index]?.[type]}
          maxLength={100}
        />
        <div className="absolute bottom-4 right-4 text-xs text-gray-500">{videos && videos[index]?.[type]?.length}/100</div>
        <div className="absolute hidden group-hover/caption:flex top-1/2 right-2 -translate-y-1/2">
          <KeyReferenceAddButton
            type={type}
            value={videos && videos[index]?.[type] || ""}
            localReferences={localReferences}
            setLocalReferences={setLocalReferences}
          />
          <KeyReferenceMenuButton
            type={type}
            localReferences={localReferences}
            setLocalReferences={setLocalReferences}
            callback={(key, value) => {
              const updates = getFieldUpdates(value);
              editAll
                ? setVideos(videos.map((video) => ({ ...video, ...updates })))
                : setVideos(videos.map((v, i) => i === index ? { ...v, ...updates } : v));
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default UploadTextarea;