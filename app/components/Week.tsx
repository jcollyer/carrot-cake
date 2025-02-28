import Day from '@/app/components/Day';
import moment from 'moment';

type Props = {
  date: any,
  month: any,
  select: (date:any) => void,
  selected: any,
  scheduledVideos: any[],
  editVideo: (video:any) => void,
};

export function Week({
  date,
  month,
  select,
  selected,
  scheduledVideos,
  editVideo,
}:Props) {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = {
      name: date.format('dd').substring(0, 1),
      number: date.date(),
      isCurrentMonth: date.month() === month.month(),
      isToday: date.isSame(new Date(), 'day'),
      date,
    };
    const videoScheduled = scheduledVideos.filter(
      video => {
        if (video.status.publishAt) {
          return (
            moment(video.status.publishAt).format('YYYY-MM-DD') === date.format('YYYY-MM-DD')
          );
        }

        if (video.snippet.publishedAt) {
          return (
            moment(video.snippet.publishedAt).format('YYYY-MM-DD') ===
            date.format('YYYY-MM-DD')
          );
        }
      },
    );

    days.push(
      <Day
        day={day}
        selected={selected}
        select={select}
        key={i}
        videoScheduled={videoScheduled}
        editVideo={editVideo}
      />,
    );

    date = date.clone();
    date.add(1, 'day');
  }

  return (
    <div className="flex w-full border-t border-gray-100">
      {days}
    </div>
  );
}

export default Week;

