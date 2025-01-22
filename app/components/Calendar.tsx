import { Dispatch, SetStateAction, useState } from 'react';
import moment from 'moment';
import { ChevronLeft, ChevronRight } from "lucide-react";
import  Week from '@/app/components/Week';
import { Categories } from '@/app/utils/categories';
import type { YouTubeVideo } from '@/types/video';

type Props = {
  scheduledVideos: YouTubeVideo[];
  setLocallScheduledVideoData: Dispatch<SetStateAction<never[]>>;
};

export function Calendar({ scheduledVideos, setLocallScheduledVideoData }: Props) {
  const [month, setMonth] = useState(moment());
  const [selected, setSelected] = useState(moment().startOf('day'));
  const [duck, setDuck] = useState(0);
  const [editVideoSelected, setEditVideoSelected] = useState<YouTubeVideo>({});

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

  const closeEditVideo = () => {
    setEditVideoSelected({});
  };

  const updateEditVideoSelected = (event: React.ChangeEvent<any>, inputName: string) => {
    setEditVideoSelected({
      ...editVideoSelected,
      [`${inputName}`]:
        inputName === 'scheduleDate'
          ? `${event.currentTarget.value}T00:00:00Z`
          : event.currentTarget.value,
    });
  };

  // const saveEditVideo = () => {
  //   axios
  //     .post('/api/auth/updateVideo', {
  //       videoId: editVideoSelected.id,
  //       title: editVideoSelected.title,
  //       description: editVideoSelected.description,
  //       scheduleDate: editVideoSelected.scheduleDate,
  //       categoryId: editVideoSelected.categoryId,
  //       tags: editVideoSelected.tags,
  //     })
  //     .then(() => {
  //       const updatedScheduledVideos = scheduledVideos.map(video => {
  //         if (video.id === editVideoSelected.id) {
  //           return {
  //             ...video,
  //             snippet: {
  //               ...video.snippet,
  //               title: editVideoSelected.title,
  //               description: editVideoSelected.description,
  //               categoryId: editVideoSelected.categoryId,
  //               tags: editVideoSelected.tags,
  //             },
  //             status: {
  //               publishAt: editVideoSelected.scheduleDate,
  //             },
  //           };
  //         }
  //         return video;
  //       });

  //       setLocallScheduledVideoData(updatedScheduledVideos);
  //       setEditVideoSelected({});
  //     });
  // };

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

    <section className="block relative bg-[#ffffff] w-[900px] border-[solid] border-[1px] border-[#cccccc] mt-20 mx-[auto] mb-0 [box-shadow:0_0_15px_0_#c0c0c0] text-[1.3rem] text-center">
      <header className="text-[#ffffff] cursor-default text-[1.4rem] block font-bold uppercase select-none">
        <div className="items-center h-[40px] bg-[#444444] flex w-full">
          <ChevronLeft
            className="text-[3rem] leading-none"
            onClick={() => previous()}
          />
          <span className="flex-[1]">{month.format('MMMM YYYY')}</span>
          <ChevronRight
            className="text-[3rem] leading-none"
            onClick={() => next()}
          />
        </div>
        <div className="flex w-full text-[#444444] font-bold cursor-default text-[1.2rem]">
          <span className="flex justify-center items-center flex-[1] border-l-[solid_1px_#cccccc] cursor-pointer [transition:all_0.2s] px-[0] py-[10px] h-[45px]">Sun</span>
          <span className="flex justify-center items-center flex-[1] border-l-[solid_1px_#cccccc] cursor-pointer [transition:all_0.2s] px-[0] py-[10px] h-[45px]">Mon</span>
          <span className="flex justify-center items-center flex-[1] border-l-[solid_1px_#cccccc] cursor-pointer [transition:all_0.2s] px-[0] py-[10px] h-[45px]">Tue</span>
          <span className="flex justify-center items-center flex-[1] border-l-[solid_1px_#cccccc] cursor-pointer [transition:all_0.2s] px-[0] py-[10px] h-[45px]">Wed</span>
          <span className="flex justify-center items-center flex-[1] border-l-[solid_1px_#cccccc] cursor-pointer [transition:all_0.2s] px-[0] py-[10px] h-[45px]">Thu</span>
          <span className="flex justify-center items-center flex-[1] border-l-[solid_1px_#cccccc] cursor-pointer [transition:all_0.2s] px-[0] py-[10px] h-[45px]">Fri</span>
          <span className="flex justify-center items-center flex-[1] border-l-[solid_1px_#cccccc] cursor-pointer [transition:all_0.2s] px-[0] py-[10px] h-[45px]">Sat</span>
        </div>
      </header>
      {renderWeeks()}
      {!!Object.keys(editVideoSelected).length && (
        <div className="absolute top-12 bg-gray-400 w-1/2 left-0 right-0 m-auto p-8 rounded-lg color-white">
          <h3 className="mb-5">Edit Video</h3>
          <div className="flex mb-2">
            <p className="mr-2 text-slate-400">Title:</p>
            <input
              onChange={event => updateEditVideoSelected(event, 'title')}
              className="border-0 outline-0 bg-transparent grow"
              name="title"
              value={editVideoSelected.title}
              placeholder="Title"
            />
          </div>
          <div className="flex mb-2">
            <p className="mr-2 text-slate-400">Description:</p>
            <textarea
              onChange={event => updateEditVideoSelected(event, 'description')}
              className="border-0 outline-0 bg-transparent grow"
              name="description"
              value={editVideoSelected.description}
              placeholder="Description"
            />
          </div>
          <div className="flex mb-2">
            <p className="mr-2 text-slate-400">Scheduled Date:</p>
            <input
              type="date"
              onChange={event => updateEditVideoSelected(event, 'scheduleDate')}
              className="border-0 outline-0 bg-transparent border-slate-300"
              name="scheduleDate"
              value={editVideoSelected.scheduleDate && editVideoSelected.scheduleDate.split('T')[0]}
              placeholder="Schedule Date"
            />
          </div>
          <div className="flex mb-2">
            <p className="mr-2 text-slate-400">Category:</p>
            <select
              onChange={event => updateEditVideoSelected(event, 'categoryId')}
              className="outline-0 bg-transparent border-slate-300 border"
              name="categoryId"
              defaultValue={editVideoSelected.categoryId}
              // placeholder="CategoryId"
            >
              {Categories.map(item => (
                <option key={item.label} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex mb-2">
            <p className="mr-2 text-slate-400">Tags:</p>
            <textarea
              name="tags"
              className="border-0 outline-0 bg-transparent border-slate-300  h-12"
              onChange={event => updateEditVideoSelected(event, 'tags')}
              value={editVideoSelected.tags}
              placeholder="Tags"
            />
          </div>
          <div className="absolute bottom-6 right-0 left-0">
            <button
              className="font-bold py-2 px-4 rounded border border-slate-400 hover:border-slate-500 mr-3"
              // onClick={() => saveEditVideo()}
              type="button"
            >
              Update
            </button>
            <button
              className="font-bold py-2 px-4 rounded border border-slate-400 hover:border-slate-500"
              onClick={() => closeEditVideo()}
              type="button"
            >
              Exit
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default Calendar;
