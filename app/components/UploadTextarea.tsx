import KeyReferenceAddButton from "@/app/components/KeyReferenceAddButton";
import KeyReferenceMenuButton from "@/app/components/KeyReferenceMenuButton";
import { Dispatch, SetStateAction } from "react";

type UploadTextareaProps = {
  editAll: boolean;
  videos: any[];
  setVideos: Dispatch<SetStateAction<any[]>>;
  editMultiple?: { [service: string]: boolean };
  setEditMultiple?: Dispatch<SetStateAction<{ [service: string]: boolean }>>;
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
  setEditMultiple,
  header,
  placeholder,
  type
}: UploadTextareaProps) => {

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
          onChange={event => editAll ?
            !!videos && setVideos(videos.map((video) => ({ ...video, [type]: event.currentTarget.value }))) :
            !!videos && setVideos(videos.map((v, i) => i === index ? { ...v, [type]: event.currentTarget.value } : v))}
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
            callback={(key, value) => editAll ?
              setVideos(videos.map((video) => ({ ...video, [key]: value }))) :
              setVideos(videos.map((v, i) => i === index ? { ...v, [key]: value } : v))}
          />
        </div>
      </div>
    </div>
  );
};

export default UploadTextarea;