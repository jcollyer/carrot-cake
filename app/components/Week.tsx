import Day from '@/app/components/Day';

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
      /* eslint-disable */
      video => {
        if (video.status.publishAt) {
          return (
            video.status.publishAt.split('T')[0] === date.format('YYYY-MM-DD')
          );
        }

        if (video.snippet.publishedAt) {
          return (
            video.snippet.publishedAt.split('T')[0] ===
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
    <div className="flex w-full border-t-[solid_1px_#cccccc]">
      {days}
    </div>
  );
}

export default Week;

