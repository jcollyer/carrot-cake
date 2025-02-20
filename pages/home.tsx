import { useEffect, useState } from "react";
import Image from 'next/image';
import { useRouter } from 'next/router';
import { getCookie, setCookie, deleteCookie } from 'cookies-next'
import { CircleX } from 'lucide-react';
import { Categories } from '@/app/utils/categories';
import Calendar from '@/app/components/Calendar';
import clsx from 'clsx';
import { VideoProps, YouTubeVideo } from '@/types/video'
import { useContext } from 'react';
import { AuthContext } from '@/app/components/Layout';

export default function Home() {
  const { push } = useRouter();
  useEffect(() => {
    if (!authenticated) {
      push('/');
    }
  }, []);

  const { authenticated } = useContext(AuthContext);
  const [tokens, setTokens] = useState(getCookie('tokens'));
  const [playlistToken, setPlaylistToken] = useState(getCookie('userPlaylistId'));
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [editVideo, setEditVideo] = useState<VideoProps>({
    categoryId: '',
    description: '',
    file: '',
    id: '',
    scheduleDate: '',
    tags: '',
    title: '',
    thumbnail: '',
  });

  const connect = async () => {
    listenCookieChange(({ oldValue, newValue }) => {
      console.log(`Cookie changed from "${oldValue}" to "${newValue}"`);
      if (oldValue !== newValue) {
        setTokens(newValue);
      }
    }, 1000);
    await fetch('/api/youtube/connect-yt', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(async (res) => {
      const oAuthCallback = await res.json();
      window.open(oAuthCallback.url, '_blank', 'location=yes,height=570,width=520,scrollbars=yes,status=yes');
    });
  }

  const getPlaylistId = async () => {
    await fetch('/api/youtube/get-playlist-id', {
      method: 'GET',
      headers: {
        cookie: `tokens=${tokens}`,
      },
    }).then(async (res) => {
      const { playlistId } = await res.json();
      setCookie('userPlaylistId', playlistId, { maxAge: 31536000 });
      setPlaylistToken(playlistId);
    });
  }

  const getVideos = async () => {
    await fetch('/api/youtube/get-videos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: `tokens=${tokens}`,
      },
      body: JSON.stringify({ playlistId: playlistToken }),
    }).then(async (res) => {
      const videos = await res.json();
      setVideos(videos);
    });
  }

  const listenCookieChange = (callback: (values: { oldValue: string, newValue: string }) => void, interval = 1000) => {
    let lastCookie = getCookie('tokens') as string;
    setInterval(() => {
      const tokens = getCookie('tokens') as string;
      if (tokens !== lastCookie) {
        try {
          callback({ oldValue: lastCookie, newValue: tokens });
        } finally {
          lastCookie = tokens;
        }
      }
    }, interval);
  };

  const saveEditVideo = async () => {
    await fetch('/api/youtube/update-video', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: `tokens=${tokens}`,
      },
      body: JSON.stringify(editVideo),
    })
      .then(response => response.json())
      .then(() => {
        const updatedScheduledVideos = videos.map(video => {
          if (video.id === editVideo.id) {
            return {
              ...video,
              snippet: {
                ...video.snippet,
                title: editVideo.title,
                description: editVideo.description,
                categoryId: editVideo.categoryId,
                tags: editVideo.tags,
              },
              status: {
                publishAt: editVideo.scheduleDate,
              },
            };
          }
          return video;
        });

        setVideos(updatedScheduledVideos);
        setEditVideo({
          description: '',
          categoryId: '',
          file: '',
          id: '',
          scheduleDate: '',
          tags: '',
          title: '',
          thumbnail: '',
        });
      })
      .catch(error => {
        console.error('Error updating video:', error);
      });
  };

  const closeEditVideo = () => {
    setEditVideo({
      description: '',
      categoryId: '',
      file: '',
      id: '',
      scheduleDate: '',
      tags: '',
      title: '',
      thumbnail: '',
    });
  };

  useEffect(() => {
    if (tokens && !playlistToken)
      getPlaylistId();
  }, [tokens]);

  useEffect(() => {
    if (playlistToken)
      getVideos();
  }, [playlistToken]);

  return (
    <main className="flex">
      <div className="w-full">
        <div className="flex flex-col items-center">
          <h1 className="text-7xl mt-32 text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Carrot Cake</h1>
          {videos.length === 0 && (<button onClick={() => connect()} className="flex gap-2 mt-6 items-center bg-white hover:bg-gray-100 border border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 rounded-lg px-5 py-2.5">
            <Image src="/youtube_logo.png" alt="Youtube Logo" width="50" height="20" className="w-12" />
            <p className="text-lg">Connect to Youtube</p>
          </button>)}
        </div>
        {videos.length > 0 && (
          <div className="flex flex-col items-center gap-8">
            <Calendar
              scheduledVideos={videos}
              setEditVideo={setEditVideo}
            />
            <button
              className="text-gray-700 hover:text-gray-400 border border-gray-600 hover:border-gray-400 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 "
              onClick={() => {
                deleteCookie("userPlaylistId");
                deleteCookie("tokens");
                setVideos([]);
              }}>
              Disconnect from Youtube
            </button>
          </div>
        )}
      </div>
      <div className={clsx({ "w-[400px]": !!editVideo?.description }, "fixed right-0 z-10 w-0 transition-[width] h-screen border-l drop-shadow bg-gray-100 border-gray-50")}>
        <div className="flex flex-col w-[400px] gap-2 pt-6 px-8 h-full">
          <div className="flex items-center mb-10">
            <h3 className="text-gray-700 text-xl font-bold">Edit Video</h3>
            <CircleX className="ml-auto text-gray-500 hover:text-gray-900 cursor-pointer" size="34" strokeWidth={1} onClick={() => closeEditVideo()} />
          </div>
          <div className="flex flex-col gap-6">
            <div className="flex gap-2 items-center">
              <p className="font-semibold">Title:</p>
              <input
                onChange={(event) => setEditVideo({ ...editVideo, title: event.currentTarget.value })}
                className="border border-gray-300 outline-0 bg-transparent grow py-1 px-2 rounded"
                name="title"
                value={editVideo.title}
                placeholder="Title"
              />
            </div>
            <div className="flex flex-col gap-2">
              <p className="font-semibold">Description:</p>
              <textarea
                onChange={(event) => setEditVideo({ ...editVideo, description: event.currentTarget.value })}
                className="border border-gray-300 outline-0 bg-transparent grow h-40 p-2 rounded"
                name="description"
                value={editVideo.description}
                placeholder="Description"
              />
            </div>
            <div className="flex gap-2">
              <p className="font-semibold">Scheduled Date:</p>
              <input
                type="date"
                onChange={(event) => setEditVideo({ ...editVideo, scheduleDate: event.currentTarget.value })}
                className="bg-transparent"
                name="scheduleDate"
                value={editVideo.scheduleDate}
                placeholder="Schedule Date"
              />
            </div>
            <div className="flex gap-2 items-center">
              <p className="font-semibold">CategoryId:</p>
              <select
                onChange={(event) => setEditVideo({ ...editVideo, categoryId: event.currentTarget.value })}
                className="outline-0 bg-transparent border-gray-300 border px-1 py-2 rounded w-full"
                name="categoryId"
                defaultValue={editVideo.categoryId}
              >
                {Categories.map(item => (
                  <option key={item.label} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <p className="font-semibold">Tags:</p>
              <textarea
                name="tags"
                className="border border-gray-300 outline-0 bg-transparent grow h-32 p-2 rounded"
                onChange={(event) => setEditVideo({ ...editVideo, tags: event.currentTarget.value })}
                value={editVideo.tags}
                placeholder="Tags"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-5">
            <button
              className="py-2 rounded-lg border text-orange-500 border-orange-500 hover:text-orange-600 hover:border-orange-600"
              onClick={() => saveEditVideo()}
              type="button"
            >
              Update
            </button>
            <button
              className="py-1 rounded-lg border border-gray-700 hover:border-gray-900"
              onClick={() => closeEditVideo()}
              type="button"
            >
              Exit
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
