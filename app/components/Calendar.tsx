import { Dispatch, SetStateAction, useState } from 'react';
import moment from 'moment';
import { ChevronLeft, ChevronRight } from "lucide-react";
import  Week from '@/app/components/Week';
import { Categories } from '@/app/utils/categories';
import type { YouTubeVideo } from '@/types/video';

type Props = {
  scheduledVideos: YouTubeVideo[];
  setEditVideoSelected: Dispatch<SetStateAction<any>>;
};

export function Calendar({ scheduledVideos, setEditVideoSelected }: Props) {
  const [month, setMonth] = useState(moment());
  const [selected, setSelected] = useState(moment().startOf('day'));
  const [duck, setDuck] = useState(0);

  const previous = () => {
    setDuck(duck - 1);
    setMonth(month.subtract(1, 'month'));
  };

  const next = () => {
    setDuck(duck + 1);
    setMonth(month.add(1, 'month'));
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
      .startOf('month')
      .add(1, 'w')
      .day('Sunday');
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
          editVideo={({
            id,
            title,
            description,
            scheduleDate,
            categoryId,
            tags,
          }) =>
            setEditVideoSelected({
              id,
              title,
              description,
              scheduleDate,
              categoryId,
              tags,
            })}
        />,
      );
      date.add(1, 'w');
      done = count++ > 2 && monthIndex !== date.month();
      monthIndex = date.month();
    }

    return weeks;
  };

  return (
    <section className="mt-16 mx-12 bg-white w-full max-w-[900px] border border-gray-200 text-center rounded-md">
      <header className="text-gray-700 font-lg font-bold uppercase select-none border-t border-gray-100">
        <div className="items-center py-2 bg-gray-200 flex w-full border-b border-gray-300">
          <ChevronLeft
            className="text-gray-600"
            onClick={() => previous()}
          />
          <span className="flex-[1]">{month.format('MMMM YYYY')}</span>
          <ChevronRight
            className="text-gray-600"
            onClick={() => next()}
          />
        </div>
        <div className="flex w-full text-gray-600 py-3">
          <span className="flex-1 border-r border-gray-200">Sun</span>
          <span className="flex-1 border-r border-gray-200">Mon</span>
          <span className="flex-1 border-r border-gray-200">Tue</span>
          <span className="flex-1 border-r border-gray-200">Wed</span>
          <span className="flex-1 border-r border-gray-200">Thu</span>
          <span className="flex-1 border-r border-gray-200">Fri</span>
          <span className="flex-1">Sat</span>
        </div>
      </header>
      {renderWeeks()}
    </section>
  );
}

export default Calendar;
