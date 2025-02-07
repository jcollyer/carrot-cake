type Props = {
  day: {
    date: any,
    isCurrentMonth: boolean,
    isToday: boolean,
    number: number,
  },
  select: (day: any) => void,
  selected: any,
  videoScheduled: any[],
  editVideo: (video: any) => void,
};

export function Day({ day, select, selected, videoScheduled, editVideo }: Props) {
  const { date, isCurrentMonth, isToday, number } = day;
  if (videoScheduled.length > 0) {
    const video = videoScheduled[0];
    const { snippet, status } = video;
    return (
      <div
        className="flex flex-col flex-1 text-left rounded-sm bg-cover bg-center max-w-[128px]"
        style={{
          backgroundImage: `url(${snippet.thumbnails.default.url})`,
        }}
      >
        <div className="flex-grow">
          <div className="flex justify-center items-center w-6 h-6 bg-gray-200 rounded-full mt-2 ml-1">{number}</div>
          <p className="text-white mx-1 mt-4 mb-2 truncate font-medium text-lg">{snippet.title}</p>
          <p className="text-white text-sm mx-1 mb-3 line-clamp-2">{snippet.description}</p>
        </div>
        <button
          className="w-full font-bold py-0.5 text-gray-700 bg-gray-200 hover:bg-gray-300"
          onClick={() =>
            editVideo({
              id: video.id,
              title: snippet.title,
              description: snippet.description,
              scheduleDate: status.publishAt,
              categoryId: snippet.categoryId,
              tags: snippet.tags,
            })}
        >
          Update
        </button>
      </div>
    );
  }

  return (
    <button
      key={date.toString()}
      className="flex-1 justify-center items-center border-l-[1px] border-gray-100 cursor-pointer py-5"
      onClick={() => select(day)}
      type="button"
    >
      {number}
    </button>
  );
}

export default Day;
