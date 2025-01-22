type Props = {
  day: {
    date: any,
    isCurrentMonth: boolean,
    isToday: boolean,
    number: number,
  },
  select: (day:any) => void,
  selected: any,
  videoScheduled: any[],
  editVideo: (video:any) => void,
};

export function Day({ day, select, selected, videoScheduled, editVideo }:Props) {
  const { date, isCurrentMonth, isToday, number } = day;
  if (videoScheduled.length > 0) {
    const video = videoScheduled[0];
    const { snippet, status } = video;
    return (
      <div
        className="relative flex-[1] border-l-[solid_1px_#444] text-[white] text-left bg-cover bg-center max-w-[128px] pb-14 hover:bg-gray-200 first-child:border-l-[none] first-child:rounded-l-[10px] last-child:border-l-[none]"
        style={{
          backgroundImage: `url(${snippet.thumbnails.default.url})`,
        }}
      >
        <div className="flex justify-center items-center w-6 h-6 bg-gray-200 text-gray-700 text-xs font-bold rounded-full m-2">{number}</div>
        <p className="mx-3 font-bold truncate">{snippet.title}</p>
        <p className="mx-3 truncate">{snippet.description}</p>
        <button
          onClick={() =>
            editVideo({
              id: video.id,
              title: snippet.title,
              description: snippet.description,
              scheduleDate: status.publishAt,
              categoryId: snippet.categoryId,
              tags: snippet.tags,
            })}
          type="button"
          className="font-bold px-3 border-t border-slate-500 hover:bg-slate-500 bg-gray-500 w-full absolute bottom-0"
        >
          Edit Video
        </button>
      </div>
    );
  }

  return (
    <button
      key={date.toString()}
      className={`flex justify-center items-center flex-[1] border-l-[solid_1px_#333] cursor-pointer [transition:all_0.2s] px-[0] py-[10px] ${isToday ? 'bg-gray-300' : ''}${
        isCurrentMonth ? '' : 'color-gray-400'
      }${date.isSame(selected) ? 'bg-blue-600 color-white' : ''}`}
      onClick={() => select(day)}
      type="button"
    >
      {number}
    </button>
  );
}

export default Day;
