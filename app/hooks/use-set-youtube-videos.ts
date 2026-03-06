import generateVideoThumb from "@/app/utils/generateVideoThumb";
import { SanitizedVideoProps } from "@/types"
import moment from "moment";
import getVideoResolution from "@/app/utils/getVideoResolution";
import { base64ToArrayBuffer } from "@/app/utils/base64ToArrayBuffer";
const transparentImage = require("@/public/transparent.png");

export const useSetYoutubeVideos = () => {
  const setYoutubeVideos = async (
    file: File,
    index: number,
    setVideos: React.Dispatch<React.SetStateAction<any[]>>
  ) => {
    const thumb = await generateVideoThumb(file);
    const resolution = await getVideoResolution(file);
        const thumbArrayBuffer = base64ToArrayBuffer(
          (thumb as string).split(",")[1]
        );
    

    setVideos((videos: SanitizedVideoProps[]) => [
      ...videos,
      {
        categoryId: "1",
        description: "",
        file,
        resolution,
        url: "youtube-upload",
        title: "",
        scheduleDate: moment().format("YYYY-MM-DD"),
        tags: undefined,
        thumbnail: thumb || transparentImage,
        uploadProgress: 0,
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
  };

  return { setYoutubeVideos };
};

export default useSetYoutubeVideos;
