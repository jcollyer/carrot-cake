import Week from "@/app/components/Week";
import ButtonIcon from "@/app/components/primitives/ButtonIcon";
import { ChevronLeft, ChevronRight } from "lucide-react";
import moment from "moment";
import { Dispatch, SetStateAction, useState } from "react";
import type { SanitizedVideoProps } from "@/types";

type Props = {
  scheduledVideos: SanitizedVideoProps[];
  setEditVideo: Dispatch<SetStateAction<any>>;
  canEdit: boolean;
  title: string;
};

export function Calendar({ scheduledVideos, setEditVideo, canEdit, title }: Props) {
  const [month, setMonth] = useState(moment());
  const [selected, setSelected] = useState(moment().startOf("day"));
  const [duck, setDuck] = useState(0);

  const previous = () => {
    setDuck(duck - 1);
    setMonth(month.subtract(1, "month"));
  };

  const next = () => {
    setDuck(duck + 1);
    setMonth(month.add(1, "month"));
  };

  const select = (day: any) => {
    setSelected(day.date);
    setMonth(day.date.clone());
  };

  const renderWeeks = () => {
    const weeks = [];
    let done = false;
    const date = month
      .clone()
      .startOf("month")
      .add(1, "w")
      .day("Sunday");
    let count = 0;
    let monthIndex = date.month();

    while (!done) {
      weeks.push(
        <Week
          key={date.clone().toString()}
          date={date.clone()}
          month={month}
          select={day => select(day)}
          selected={selected}
          scheduledVideos={scheduledVideos}
          setEditVideo={setEditVideo}
          canEdit={canEdit}
        />,
      );
      date.add(1, "w");
      done = count++ > 2 && monthIndex !== date.month();
      monthIndex = date.month();
    }

    return weeks;
  };

  return (
    <div className="flex flex-col gap-[2px] w-full">
      <h2 className="text-sm text-gray-400 uppercase font-semibold mr-auto">{title}</h2>
      <section className="bg-white w-full max-w-screen-xl border border-gray-200 text-center rounded-md">
        <header className="font-lg font-bold uppercase select-none border-t border-gray-100">
          <div className="items-center p-2 bg-gray-200 flex w-full border-b border-gray-300">
            <ButtonIcon
              icon={ChevronLeft}
              label="Previous Month"
              size={22}
              strokeWidth={2}
              onClick={() => previous()}
              tooltip
            />
            <p className="text-xs text-gray-500 w-full">{month.format("MMMM YYYY")}</p>
            <ButtonIcon
              icon={ChevronRight}
              label="Next Month"
              size={22}
              strokeWidth={2}
              onClick={() => next()}
              tooltip
            />
          </div>
          <div className="flex w-full py-3">
            <span className="flex-1 border-r border-gray-200 text-gray-600 text-xs">Sun</span>
            <span className="flex-1 border-r border-gray-200 text-gray-600 text-xs">Mon</span>
            <span className="flex-1 border-r border-gray-200 text-gray-600 text-xs">Tue</span>
            <span className="flex-1 border-r border-gray-200 text-gray-600 text-xs">Wed</span>
            <span className="flex-1 border-r border-gray-200 text-gray-600 text-xs">Thu</span>
            <span className="flex-1 border-r border-gray-200 text-gray-600 text-xs">Fri</span>
            <span className="flex-1 text-gray-600 text-xs">Sat</span>
          </div>
        </header>
        {renderWeeks()}
      </section>
    </div>
  );
}

export default Calendar;
