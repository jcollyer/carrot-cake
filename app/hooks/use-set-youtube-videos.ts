import generateVideoThumb from "@/app/utils/generateVideoThumb";
import { SanitizedVideoProps } from "@/types"
import moment from "moment";
import getVideoResolution from "@/app/utils/getVideoResolution";
const transparentImage = require("@/public/transparent.png");

export const useSetYoutubeVideos = () => {
  const setYoutubeVideos = async (
    file: File,
    setVideos: React.Dispatch<React.SetStateAction<any[]>>
  ) => {
    const thumbnail = await generateVideoThumb(file);
    const resolution = await getVideoResolution(file);

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
        thumbnail: thumbnail || transparentImage,
        uploadProgress: 0,
      },
    ]);
  };

  return { setYoutubeVideos };
};

export default useSetYoutubeVideos;
