import { CHUNK_SIZE } from "@/app/constants";
import { TikTokVideoProps } from "@/types";
import { Dispatch, SetStateAction } from "react";

type UploadChunkParams = {
  offset: number;
  chunkIndex: number;
  setVideos: Dispatch<SetStateAction<TikTokVideoProps[] | undefined>>;
  file: File;
  uploadUrl: string;
  totalSize: number;
  videoIndex: number;
};

export const useUploadChunk = async ({
  offset,
  chunkIndex,
  setVideos,
  file,
  uploadUrl,
  totalSize,
  videoIndex,
}: UploadChunkParams): Promise<void> => {
  let contentRange = "";
  let chunk: Blob;

  if (offset + CHUNK_SIZE * 2 > totalSize) {
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
    setVideos((prev) =>
      prev?.map((v, i) =>
        i === 0
          ? {
              ...v,
              uploadProgress:
                (v.uploadProgress || 0) +
                Math.floor((chunk.size / totalSize) * 100),
            }
          : v
      )
    );
    await useUploadChunk({
      offset: offset + CHUNK_SIZE,
      chunkIndex: chunkIndex + 1,
      setVideos,
      file,
      uploadUrl,
      totalSize,
      videoIndex,
    });
  }

  if (res.status === 201) {
    setVideos((prev) => prev?.filter((_, i) => i !== videoIndex));
  }
};
