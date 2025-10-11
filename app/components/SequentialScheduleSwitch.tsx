import { Switch } from "@/app/components/primitives/Switch";

type SequentialScheduleSwitchProps = {
  sequentialDate: { date: string; interval: number } | undefined;
  setSequentialDate: (value: { date: string; interval: number } | undefined) => void;
}

const SequentialScheduleSwitch = ({ sequentialDate, setSequentialDate }: SequentialScheduleSwitchProps) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2 items-center">
        <p className="text-sm font-medium">Schedule Dates Sequentially</p>
        <Switch
          checked={sequentialDate !== undefined}
          onClick={() => setSequentialDate(sequentialDate ? undefined : { date: new Date().toISOString(), interval: 2 })}
          className="cursor-pointer"
        />
      </div>
      {!!sequentialDate && (
        <div className="flex flex-col gap-2">
          <input type="date" className="border border-gray-300 rounded h-10 px-2"
            value={sequentialDate.date.split("T")[0]}
            onChange={(e) => setSequentialDate({ ...sequentialDate, date: e.target.value })}
          />
          <div className="flex gap-2 items-center">
            <p className="text-xs text-gray-500">Videos scheduled</p>
            <input
              type="number"
              min={1}
              className="border border-gray-300 rounded h-10 px-2 w-12"
              value={sequentialDate.interval}
              onChange={(e) => setSequentialDate({ ...sequentialDate, interval: Number(e.target.value) })}
            />
            <p className="text-xs text-gray-500"> days apart</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default SequentialScheduleSwitch;