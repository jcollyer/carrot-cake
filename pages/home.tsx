import { useEffect, useState } from "react";
import Image from 'next/image';
import { useRouter } from 'next/router';
import { getCookie, setCookie, deleteCookie } from 'cookies-next'
import { CircleX } from 'lucide-react';
import { Categories } from '@/app/utils/categories';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/primitives/Tabs";
import Calendar from '@/app/components/Calendar';
import clsx from 'clsx';
import { YTVideoProps, YouTubeVideo, YouTubeUserInfo } from '@/types/video'
import { useSession } from "next-auth/react"
import moment from 'moment';

export default function Home() {
  const { push } = useRouter();
  const { data: session } = useSession();
  useEffect(() => {
    if (!session) {
      push('/');
    }
  }, []);

  const [tokens, setTokens] = useState(getCookie('tokens'));
  const [playlistId, setPlaylistId] = useState(getCookie('userPlaylistId'));
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [connectedTiktok, setConnectedTiktok] = useState(false);
  const [editVideo, setEditVideo] = useState<YTVideoProps>({
    categoryId: '',
    description: '',
    file: '',
    id: '',
    scheduleDate: '',
    tags: '',
    title: '',
    thumbnail: '',
  });
  const [ytUserInfo, setYtUserInfo] = useState<YouTubeUserInfo>({});

  const connectTt = async () => {
    console.log('Connecting to TikTok');

    await fetch('/api/tiktok/connect-tiktok', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }).then(async (res) => {
      const oAuthCallback = await res.json();
      console.log('Response from TikTok connect:', oAuthCallback);
      window.open(oAuthCallback.url, '_blank', 'location=yes,height=570,width=520,scrollbars=yes,status=yes');
    });
  }

  const connectYt = async () => {
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
      setPlaylistId(playlistId);
    });
  }

  const getYTChannelInfo = async () => {
    await fetch('/api/youtube/get-channel', {
      method: 'GET',
      headers: {
        cookie: `tokens=${tokens}`,
      },
    }).then(async (res) => {
      const { data } = await res.json();
      const {snippet} = data;
      const {title, thumbnails} = snippet;
      console.log("thumbnails", thumbnails);
      const {medium} = thumbnails;

      setYtUserInfo({
        title,
        thumbnail: medium.url,
      });
    });
  }

  const getVideos = async () => {
    await fetch('/api/youtube/get-videos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: `tokens=${tokens}`,
      },
      body: JSON.stringify({ playlistId }),
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
    if (tokens && !playlistId)
      getPlaylistId();
      getYTChannelInfo();
  }, [tokens]);

  useEffect(() => {
    if (playlistId)
      getVideos();
  }, [playlistId]);
console.log("=------", ytUserInfo)
  return (
    <main className="flex">
      <div className="w-full">
        <div className="flex flex-col items-center">
          {videos.length === 0 && (
            <>
              <h3 className="text-lg max-w-96 text-center my-8">Connect your Social Media account now to start uploading, scheduling, and managing your videos effortlessly!</h3>
              <div className="flex flex-col gap-2 w-50">
                <button onClick={() => connectYt()} className="flex gap-4 items-center bg-white hover:bg-gray-100 border border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 rounded-lg px-5 py-2.5">
                  <Image src="/youtube_logo.png" alt="Youtube Logo" width="50" height="20" className="w-12" />
                  <p className="text-lg">Connect to Youtube</p>
                </button>
                <button
                  className="flex items-center gap-4 text-gray-700 hover:text-gray-400 border border-gray-600 hover:border-gray-400 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 "
                  onClick={() => connectTt()}>
                  <Image src="/tiktok.svg" alt="TikTok Logo" width="20" height="8" />
                  Continue with TikTok
                </button>
              </div>
            </>
          )}
        </div>
        {!!ytUserInfo && (
          <div className="flex flex-col items-center gap-4 mt-8 mb-4">
            {!!ytUserInfo?.thumbnail && <img src={ytUserInfo.thumbnail} alt="YouTube User Thumbnail" width="100" height="100" className="rounded-full" />}
            {/* {!!ytUserInfo?.thumbnail && <img loading="lazy" src="https://yt3.ggpht.com/j8Dk-lJSrUxcCJF7by6hTy093ydzML6A1P-HnfccPurGz3pw0w7oubwgkTxrYChSY6Xsnn9X3bM=s240-c-k-c0x00ffffff-no-rj" alt="YouTube User Thumbnail" width="100" height="100" className="rounded-full" />} */}
            {/* {!!ytUserInfo?.thumbnail && <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/2019_Toyota_Corolla_Icon_Tech_VVT-i_Hybrid_1.8.jpg/960px-2019_Toyota_Corolla_Icon_Tech_VVT-i_Hybrid_1.8.jpg" alt="YouTube User Thumbnail" width="100" height="100" className="rounded-full" />} */}
            
            <h2 className="text-2xl font-bold text-gray-800">{ytUserInfo?.title}</h2>
          </div>
        )}
        {videos.length > 0 && (
          <Tabs defaultValue="youtube" className="mt-[3px] max-w-screen-lg mx-auto">
            <TabsList aria-label="social media opitons" className="px-5">
              <TabsTrigger value="youtube">YouTube</TabsTrigger>
              <TabsTrigger value="tiktok">TikTok</TabsTrigger>
            </TabsList>
            <TabsContent value="youtube">
              <div className="flex flex-col items-center gap-8 mb-16 px-4">
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
            </TabsContent>
            <TabsContent value="tiktok">
              <div className="flex flex-col items-center gap-8 mb-16 px-4">
                {!!connectedTiktok && (
                  <>
                    <div>TikTok calander</div>
                    <button
                      className="text-gray-700 hover:text-gray-400 border border-gray-600 hover:border-gray-400 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 "
                      onClick={() => {
                        deleteCookie("userPlaylistId");
                        deleteCookie("tokens");
                        setVideos([]);
                      }}>
                      Disconnect from Tiktok
                    </button>
                  </>
                )}
                {!connectedTiktok && (
                  <button
                    className="flex items-center gap-4 text-gray-700 hover:text-gray-400 border border-gray-600 hover:border-gray-400 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2 "
                    onClick={() => connectTt()}>
                    <Image src="/tiktok.svg" alt="TikTok Logo" width="20" height="8" />
                    Continue with TikTok
                  </button>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
      <div className={clsx({ "w-[400px]": !!editVideo?.description }, "fixed right-0 z-10 w-0 transition-[width] h-screen border-l drop-shadow bg-gray-100 border-gray-50")}>
        <div className="flex flex-col w-[400px] gap-2 pt-6 px-8 h-full overflow-auto pb-10">
          <div className="flex items-center mb-2">
            <h3 className="text-gray-700 text-xl font-bold">Edit Video</h3>
            <CircleX className="ml-auto text-gray-500 hover:text-gray-900 cursor-pointer" size="34" strokeWidth={1} onClick={() => closeEditVideo()} />
          </div>
          <div className="flex flex-col gap-6">
            <img src={editVideo.thumbnail} alt="Thumbnail" width="340" height="210" />
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
                className="border border-gray-300 outline-0 bg-transparent grow h-32 p-2 rounded"
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
                value={moment(editVideo.scheduleDate).format("YYYY-MM-DD")}
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
                className="border border-gray-300 outline-0 bg-transparent grow h-16 p-2 rounded"
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
