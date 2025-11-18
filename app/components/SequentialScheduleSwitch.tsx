import { Switch } from "@/app/components/primitives/Switch";
import { InstagramVideoProps, SanitizedVideoProps, TikTokVideoProps } from "@/types";

type VideoArrayType = SanitizedVideoProps[] | TikTokVideoProps[] | InstagramVideoProps[];

type SequentialScheduleSwitchProps = {
  sequentialDate: { date: string; interval: number } | undefined;
  setSequentialDate: (value: { date: string; interval: number } | undefined) => void;
  setVideos: React.Dispatch<React.SetStateAction<any[]>>;
}

const SequentialScheduleSwitch = ({ sequentialDate, setSequentialDate, setVideos }: SequentialScheduleSwitchProps) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 items-center">
        <p className="text-sm font-medium">Schedule Dates Sequentially</p>
        <Switch
          checked={sequentialDate !== undefined}
          onClick={() => {
            setVideos(videos => {
              if (sequentialDate) {
                return videos;
              }
              return videos.map((video, index) => {
                const scheduleDate = new Date();
                scheduleDate.setDate(scheduleDate.getDate() + index * 2); // Default interval of 2 days
                return {
                  ...video,
                  scheduleDate: scheduleDate.toISOString().split("T")[0],
                };
              });
            });
            setSequentialDate(sequentialDate ? undefined : { date: new Date().toISOString().split("T")[0], interval: 2 })
          }}
          className="cursor-pointer"
        />
      </div>
      {!!sequentialDate && (
        <div className="flex flex-col gap-2">
          <input type="date" className="border border-gray-300 rounded h-10 px-2"
            value={sequentialDate.date.split("T")[0]}
            onChange={(e) => {
              setVideos(videos => {
                return videos.map((video, index) => {
                  const scheduleDate = new Date(e.target.value);
                  scheduleDate.setDate(scheduleDate.getDate() + index * sequentialDate.interval);
                  return {
                    ...video,
                    scheduleDate: scheduleDate.toISOString().split("T")[0],
                  };
                });
              });
              setSequentialDate({ ...sequentialDate, date: e.target.value })
            }}
          />
          <div className="flex gap-2 items-center">
            <p className="text-xs text-gray-500">Videos scheduled</p>
            <input
              type="number"
              min={1}
              className="border border-gray-300 rounded h-10 px-2 w-12"
              value={sequentialDate.interval}
              onChange={(e) => {
                setVideos(videos => {
                  return videos.map((video, index) => {
                    const scheduleDate = new Date(sequentialDate.date);
                    scheduleDate.setDate(scheduleDate.getDate() + index * Number(e.target.value));
                    return {
                      ...video,
                      scheduleDate: scheduleDate.toISOString().split("T")[0],
                    };
                  });
                });
                setSequentialDate({ ...sequentialDate, interval: Number(e.target.value) })
              }}
            />
            <p className="text-xs text-gray-500"> days apart</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default SequentialScheduleSwitch;