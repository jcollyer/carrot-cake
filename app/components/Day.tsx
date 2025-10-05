import { Pencil } from "lucide-react";
import type { SanitizedVideoProps } from "@/types";

type Props = {
  day: {
    date: any,
    isCurrentMonth: boolean,
    isToday: boolean,
    number: number,
  },
  select: (day: any) => void,
  selected: any,
  videoScheduled: SanitizedVideoProps | undefined,
  videosScheduled: SanitizedVideoProps[] | undefined,
  setEditVideo: (video: SanitizedVideoProps) => void,
  canEdit: boolean,
  mediaType?: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM",
};

export function Day({ day, select, selected, videoScheduled, videosScheduled, setEditVideo, canEdit, mediaType }: Props) {
  const { date, isCurrentMonth, isToday, number } = day;

  if (!!videosScheduled?.length) {
    return (
      <div className="relative flex flex-col w-[14%]">
        <div className="absolute top-2 left-2 flex justify-center items-center z-10 size-5 bg-white text-xs rounded-full">{number}</div>
        {videosScheduled.map((video) =>
          <div
            key={video.id}
            className="relative flex flex-col flex-1 overflow-hidden text-left rounded-sm bg-cover bg-center bg-gray-800 border-r border-b border-gray-300"
            style={{
              backgroundImage: `url(${video.thumbnail})`,
              height: `${100 / videosScheduled.length}%`,
            }}
          >
            <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50"></div>
            {/* backup for thumbs from IG database which can be .mp4 */}
            {mediaType === "VIDEO" && (
              <video className="absolute -top-6 left-0 w-[200%]" muted>
                <source className="w-full" src={video.thumbnail} type="video/mp4" />
              </video>
            )}
            <div className="flex flex-col z-10 h-full">
              <div className="mt-auto mb-2">
                <p className="text-white mx-1 mt-6 truncate font-bold text-lg">{video.title}</p>
                <p className="text-white text-sm mx-1 line-clamp-2">{video.description}</p>
              </div>
              {canEdit && (
                <button
                  className="absolute top-1 right-1 bg-white bg-opacity-20 hover:bg-opacity-40 text-white p-1 rounded-full transition"
                  onClick={() =>
                    setEditVideo({
                      id: video.id,
                      title: video.title,
                      description: video.description,
                      scheduleDate: video.scheduleDate,
                      categoryId: video.categoryId,
                      tags: video.tags,
                      thumbnail: video.thumbnail,
                    })}
                >
                  <Pencil size={16} className="text-gray-100" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      key={date.toString()}
      className="flex flex-1 border-l border-gray-100 pt-2 pb-12  w-[14%]"
      onClick={() => select(day)}
    >
      <div className="text-xs ml-3">{number}</div>
    </div>
  );
}

export default Day;
