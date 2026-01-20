import { TikTokVideoProps } from "@/types";
import moment from "moment";
import getVideoResolution from "../utils/getVideoResolution";
import generateVideoThumb from "../utils/generateVideoThumb";
import { base64ToArrayBuffer } from "../utils/base64ToArrayBuffer";

export const useSetTiktokVideo = () => {
  const setTiktokVideo = async (
    file: File,
    index: number,
    fileData: ArrayBuffer,
    setVideos: React.Dispatch<React.SetStateAction<any[]>>,
  ) => {
    const resolution = await getVideoResolution(file);
    const thumb = await generateVideoThumb(file);
    const thumbArrayBuffer = base64ToArrayBuffer(
      (thumb as string).split(",")[1]
    );

    // Initialize video in state
    setVideos((prev) => [
      ...(prev || []),
      {
        file,
        id: "",
        url: "",
        title: "",
        thumbnail: "",
        resolution,
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
      },
    ]);

    // Upload the thumbnail to S3
    await fetch(
      `/api/s3/presigned?fileName=${
        file.name.split(".mp4")[0]
      }-thumb.png&contentType=image/png&s3Bucket=AWS_S3_TT_THUMBS_BUCKET_NAME&region=us-east-1`
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
            prev?.map((v, i) => (i === index ? { ...v, thumbnail } : v))
          );
        });
      });

    // Upload the video to S3
    await fetch(
      `/api/s3/presigned?fileName=${file.name}&contentType=${file.type}&s3Bucket=AWS_S3_TT_BUCKET_NAME&region=us-east-2`
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
            prev?.map((v, i) => (i === index ? { ...v, url } : v))
          );
        });
      });
  };

  return { setTiktokVideo };
};
