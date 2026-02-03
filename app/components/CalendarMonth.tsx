import type { SanitizedVideoProps } from "@/types";
import { ChevronLeft, ChevronRight, ImageUp, Pencil, Smartphone } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/app/components/primitives/Tooltip";
import { useState, useMemo, useEffect } from "react";
import { cn } from "@/app/utils/cn";
import ButtonIcon from "./primitives/ButtonIcon";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

type CalendarProps = {
  scheduledVideos: SanitizedVideoProps[];
  canEdit?: boolean;
  setEditVideo: (video: SanitizedVideoProps) => void;
  title: string;
  hasStatus?: boolean;
  tiktokTokens?: string;
};

export default function Calendar({ scheduledVideos = [], canEdit = false, setEditVideo, title, hasStatus = false, tiktokTokens }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [videoStatuses, setVideoStatuses] = useState<{ [key: string]: any }>({});
  const today = new Date();

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);

    const startWeekday = start.getDay(); // 0-6 (Sun-Sat)
    const totalDaysInMonth = end.getDate();

    const cells: Date[] = [];

    // Previous month filler days
    for (let i = startWeekday - 1; i >= 0; i--) {
      const d = new Date(start);
      d.setDate(start.getDate() - (i + 1));
      cells.push(d);
    }

    // Current month days
    for (let day = 1; day <= totalDaysInMonth; day++) {
      cells.push(new Date(start.getFullYear(), start.getMonth(), day));
    }

    // Fill remaining cells to make exactly 35 (7 x 5)
    while (cells.length < 35) {
      const last = cells[cells.length - 1];
      const next = new Date(last);
      next.setDate(last.getDate() + 1);
      cells.push(next);
    }

    return cells;
  }, [currentMonth]);

  function goToPrevMonth() {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  }

  function goToNextMonth() {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  }

  const monthLabel = currentMonth.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const getVideoStatus = async (publishId: string) => {
    const accessToken = tiktokTokens;
    if (!publishId || !accessToken) return null;
    try {
      const response = await fetch("/api/tiktok/publish-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ publishId, accessToken }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error getting publish status:", error);
      return null;
    }
  }

  useEffect(() => {
    if (hasStatus && scheduledVideos.length > 0) {
      const fetchStatuses = async () => {
        const statuses: { [key: string]: any } = {};
        for (const video of scheduledVideos) {
          if (video.publishId) {
            const status = await getVideoStatus(video.publishId);
            statuses[video.publishId] = status;
          }
        }
        setVideoStatuses(statuses);
      };
      fetchStatuses();
    }
  }, [scheduledVideos, hasStatus, tiktokTokens]);

  return (
    <>
      <h2 className="text-sm text-gray-400 uppercase font-semibold mr-auto">{title}</h2>
      <div className="bg-white w-full max-w-screen-xl border border-gray-200 text-center rounded-md">
        <header className="select-none border-t border-gray-100">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-200 border-b border-gray-300">

            <ButtonIcon
              icon={ChevronLeft}
              label="Previous Month"
              size={22}
              strokeWidth={2}
              onClick={goToPrevMonth}
              tooltip
            />

            <h2 className="text-xs font-semibold text-gray-600">{monthLabel.toUpperCase()}</h2>

            <ButtonIcon
              icon={ChevronRight}
              label="Next Month"
              size={22}
              strokeWidth={2}
              onClick={goToNextMonth}
              tooltip
            />
          </div>
        </header>

        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b bg-gray-50 text-center text-sm font-medium">
          {DAYS.map((day) => (
            <div key={day} className="py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 grid-rows-5">
          {days.map((date, idx) => {
            const isCurrentMonth =
              date.getMonth() === currentMonth.getMonth();

            const isToday = isSameDay(date, today);
            const videosScheduled = scheduledVideos.filter((video) => {
              // Parse date string "YYYY-MM-DD" without timezone conversion
              const [year, month, day] = (video.scheduleDate || "").split("-").map(Number);
              const videoDate = new Date(year, month - 1, day);
              return isSameDay(date, videoDate);
            });
            const videoScheduled = videosScheduled.length > 0;

            return (
              <div
                key={idx}
                className={cn("relative h-24 border",
                  !isCurrentMonth ? "bg-gray-50 text-gray-400" : "bg-white",
                  isToday ? "border border-gray-400" : ""
                )}
              >

                {videosScheduled.map((video) => {
                  return (
                    <div
                      key={video.id}
                      className={cn("relative flex flex-col flex-1 overflow-hidden text-left rounded-sm bg-cover bg-center bg-gray-800 border-r border-b border-gray-300")}
                      style={{
                        backgroundImage: `url(${video.thumbnail})`,
                        height: `${100 / videosScheduled.length}%`,
                      }}
                    >
                      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50"></div>
                      {/* backup for thumbs from IG database which can be .mp4 */}
                      {video.mediaType === "VIDEO" && (
                        <video className="absolute -top-6 left-0 w-[200%]" muted>
                          <source className="w-full" src={video.thumbnail} type="video/mp4" />
                        </video>
                      )}
                      <div className="flex flex-col z-10 h-full">
                        <div className="mt-auto mb-2">
                          <p className="text-white mx-1 mt-6 truncate font-bold text-lg">{video.title}</p>
                          <p className="text-white text-sm mx-1 line-clamp-2">{video.description}</p>
                        </div>
                        {canEdit && (
                          <button
                            className={cn("absolute top-1 left-1 bg-white bg-opacity-20 hover:bg-opacity-40 text-white p-1 rounded-full transition")}
                            onClick={() =>
                              setEditVideo({
                                id: video.id,
                                title: video.title,
                                description: video.description,
                                scheduleDate: video.scheduleDate,
                                categoryId: video.categoryId,
                                tags: video.tags,
                                thumbnail: video.thumbnail,
                              })}
                          >
                            <Pencil size={16} className="text-gray-100" />
                          </button>
                        )}
                        {hasStatus && Object.keys(videoStatuses).includes(video.publishId || "") && (
                          <TooltipProvider>
                            <Tooltip delayDuration={100}>
                              <TooltipTrigger asChild>
                                <div className={cn("size-3 rounded-full bg-white absolute bottom-2 left-2 shadow-sm cursor-pointer", {
                                  "bg-green-500": videoStatuses[video.publishId || ""]?.data?.status === "PUBLISH_COMPLETE",
                                  "bg-yellow-500": videoStatuses[video.publishId || ""]?.data?.status === "PROCESSING_DOWNLOAD",
                                  "bg-red-500": videoStatuses[video.publishId || ""]?.data?.status === "FAILED",
                                  "bg-gray-100": videoStatuses[video.publishId || ""]?.data?.status === "SEND_TO_USER_INBOX",
                                })}>
                                  &nbsp;
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="flex gap-2 items-center">
                                  <ImageUp className="text-gray-600" size="16" strokeWidth={2.5} />
                                  <p className="text-gray-600 font-semibold">Tiktok upload status: {videoStatuses[video.publishId || ""]?.data?.status}</p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>

                  )
                }
                )}
                <div className="absolute right-2 top-1 text-sm font-medium">
                  <p className={cn({
                    "text-white": videoScheduled,
                  })}>{date.getDate()}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
