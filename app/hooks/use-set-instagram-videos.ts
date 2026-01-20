import { InstagramVideoProps } from "@/types";
import moment from "moment";
import generateVideoThumb from "../utils/generateVideoThumb";
import { base64ToArrayBuffer } from "../utils/base64ToArrayBuffer";

export const useSetInstagramVideos = () => {
  const setInstagramVideos = async ({
    file,
    index,
    fileData,
    setVideos,
  }: {
    file: File;
    index: number;
    fileData: ArrayBuffer;
    setVideos: React.Dispatch<React.SetStateAction<InstagramVideoProps[]>>;
  }) => {
    const thumb = await generateVideoThumb(file);
    const thumbArrayBuffer = base64ToArrayBuffer(
      (thumb as string).split(",")[1]
    );

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
    fetch(
      `/api/s3/presigned?fileName=${
        file.name.split(".mp4")[0]
      }-thumb.png&contentType=image/png&s3Bucket=AWS_S3_IG_THUMBS_BUCKET_NAME&region=us-east-2`
    )
      .then((res) => res.json())
      .then((res) => {
        const body = new Blob([thumbArrayBuffer], { type: "image/png" });

        fetch(res.signedUrl, {
          body,
          method: "PUT",
        }).then(async (data) => {
          const thumbnail = data?.url?.split("?")[0];
          setVideos((prev) =>
            prev.map((v, i) => (i === index ? { ...v, thumbnail } : v))
          );
        });
      });

    // Upload the video to S3
    fetch(
      `/api/s3/presigned?fileName=${file.name}&contentType=${file.type}&s3Bucket=AWS_S3_IG_BUCKET_NAME&region=us-east-2`
    )
      .then((res) => res.json())
      .then((res) => {
        const body = new Blob([fileData], { type: file.type });

        fetch(res.signedUrl, {
          body,
          method: "PUT",
        }).then(async (data) => {
          const url = data?.url?.split("?")[0];
          setVideos((prev) =>
            prev.map((v, i) => (i === index ? { ...v, url } : v))
          );
        });
      });
  };
  return { setInstagramVideos };
};

export default useSetInstagramVideos;
