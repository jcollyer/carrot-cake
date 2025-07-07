import Day from "@/app/components/Day";
import moment from "moment";
import type { SanitizedVideoProps } from "@/types/video";

type Props = {
  date: moment.Moment,
  month: moment.Moment,
  select: (date:moment.Moment) => void,
  selected: any,
  scheduledVideos: SanitizedVideoProps[],
  editVideo: (video:SanitizedVideoProps) => void,
  canEdit: boolean,
};

export function Week({
  date,
  month,
  select,
  selected,
  scheduledVideos,
  editVideo,
  canEdit,
}:Props) {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = {
      name: date.format("dd").substring(0, 1),
      number: date.date(),
      isCurrentMonth: date.month() === month.month(),
      isToday: date.isSame(new Date(), "day"),
      date,
    };

    const videoScheduled = scheduledVideos.find(
      video => video.scheduleDate === date.format("YYYY-MM-DD"),
    );

    days.push(
      <Day
        day={day}
        selected={selected}
        select={select}
        key={i}
        videoScheduled={videoScheduled}
        editVideo={editVideo}
        canEdit={canEdit}
      />,
    );

    date = date.clone();
    date.add(1, "day");
  }

  return (
    <div className="flex w-full border-t border-gray-100">
      {days}
    </div>
  );
}

export default Week;

