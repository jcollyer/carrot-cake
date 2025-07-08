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
  editVideo: (video: SanitizedVideoProps) => void,
  canEdit:boolean,
};

export function Day({ day, select, selected, videoScheduled, editVideo, canEdit }: Props) {
  const { date, isCurrentMonth, isToday, number } = day;
  if (!!videoScheduled) {
    return (
      <div
        className="flex flex-col flex-1 text-left rounded-sm bg-cover bg-center max-w-[128px]"
        style={{
          backgroundImage: `url(${videoScheduled.thumbnail})`,
        }}
      >
        <div className="flex-grow">
          <div className="flex justify-center items-center w-6 h-6 border text-gray-50 border-gray-50 rounded-full mt-2 ml-1">{number}</div>
          <p className="text-white mx-1 mt-6 truncate font-bold text-lg">{videoScheduled.title}</p>
          <p className="text-white text-sm mx-1 line-clamp-2">{videoScheduled.description}</p>
        </div>
        {canEdit && (
          <button
            className="ml-auto mr-2 mb-2"
            onClick={() =>
              editVideo({
                id: videoScheduled.id,
                title: videoScheduled.title,
                description: videoScheduled.description,
                scheduleDate: videoScheduled.scheduleDate,
                categoryId: videoScheduled.categoryId,
                tags: videoScheduled.tags,
                thumbnail: videoScheduled.thumbnail,
              })}
          >
            <Pencil size={16} className="text-gray-100" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      key={date.toString()}
      className="flex-1 justify-center items-center border-l border-gray-100 py-5"
      onClick={() => select(day)}
    >
      {number}
    </div>
  );
}

export default Day;
