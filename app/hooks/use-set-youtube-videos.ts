import generateVideoThumb from "@/app/utils/generateVideoThumb";
import { SanitizedVideoProps } from "@/types"
import moment from "moment";
const transparentImage = require("@/public/transparent.png");

export const useSetYoutubeVideos = () => {
  const setYoutubeVideos = async (
    file: File,
    setVideos: React.Dispatch<React.SetStateAction<any[]>>
  ) => {
    const thumbnail = await generateVideoThumb(file);

    setVideos((videos: SanitizedVideoProps[]) => [
      ...videos,
      {
        categoryId: "1",
        description: "",
        file,
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
