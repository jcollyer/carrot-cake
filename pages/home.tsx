import Button from '@/app/components/primitives/Button';
import { useEffect, useState } from "react";
import Image from 'next/image';
import { getServerSession } from "next-auth"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
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
import { YTVideoProps, YouTubeVideo, YouTubeUserInfo, TikTokUserInfo } from '@/types/video'
import moment from 'moment';

export const getServerSideProps = async (context:any) => {
  const session = await getServerSession(context.req, context.res, authOptions);
  if (!session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  return {
    props: {
      session,
    },
  };
};

export default function Home() {
  const [tokens, setTokens] = useState(getCookie('tokens'));
  const [tiktokTokens, setTiktokTokens] = useState(getCookie('tiktok-tokens'));
  const [playlistId, setPlaylistId] = useState(getCookie('userPlaylistId'));
  const [videos, setVideos] = useState<YouTubeVideo[]>();
  const [ytUserInfo, setYtUserInfo] = useState<YouTubeUserInfo>();
  const [tiktokUserInfo, setTiktokUserInfo] = useState<TikTokUserInfo>();
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


  const connectTt = async () => {
    listenCookieChange(({ oldValue, newValue }) => {
      if (oldValue !== newValue) {
        setTiktokTokens(newValue);
      }
    }, 1000, "tiktok-tokens");
    await fetch('/api/tiktok/connect-tiktok', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }).then(async (res) => {
      const oAuthCallback = await res.json();
      window.open(oAuthCallback.url, '_blank', 'location=yes,height=570,width=520,scrollbars=yes,status=yes');
    });
  }

  const connectYt = async () => {
    listenCookieChange(({ oldValue, newValue }) => {
      if (oldValue !== newValue) {
        setTokens(newValue);
      }
    }, 1000, "youtube-tokens");
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

  const getTikTokUserInfo = async () => {
    fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${JSON.parse(tiktokTokens as string || "{}").access_token}`,
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setTiktokUserInfo({
          thumbnail: data.data.user.avatar_url,
          userName: data.data.user.display_name,
        });
      })
      .catch(error => {
        console.error('Fetch error:', error);
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
      const { snippet } = data;
      const { title, thumbnails } = snippet;
      const { medium } = thumbnails;

      setYtUserInfo({
        userName: title,
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

  const listenCookieChange = (callback: (values: { oldValue: string, newValue: string }) => void, interval = 1000, tokenType = "youtube-tokens") => {
    let lastCookie = tokenType === "youtube-tokens" ? getCookie('tokens') as string : getCookie('tiktok-tokens') as string;
    setInterval(() => {
      const tokens = tokenType === "youtube-tokens" ? getCookie('tokens') as string : getCookie('tiktok-tokens') as string;
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
        const updatedScheduledVideos = videos?.map(video => {
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
    if (tiktokTokens) {
      getTikTokUserInfo();
    }
  }, [tiktokTokens])

  useEffect(() => {
    if (playlistId)
      getVideos();
  }, [playlistId]);

  return (
    <main className="flex mt-8">
      <div className="w-full">
        <div className="flex flex-col items-center">
          {(!videos && !tiktokUserInfo) && (
            <div className="max-w-96 flex flex-col gap-4 items-center mt-16">
              <h1 className="text-2xl text-transparent text-center leading-[1.2] bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">CARROT-CAKE APP</h1>
              <h3 className="text-center">Connect your Social Media account now to start uploading, scheduling, and managing your videos effortlessly!</h3>
              <div className="flex flex-col gap-2 w-50">
                <Button
                  variant="white"
                  size="xlarge"
                  className="flex gap-4 items-center"
                  onClick={() => connectYt()}
                >
                  <Image src="/youtube_logo.png" alt="Youtube Logo" width="50" height="20" className="w-12" />
                  Continue with Youtube
                </Button>
                <Button
                  variant="white"
                  size="xlarge"
                  className="flex gap-4"
                  onClick={() => connectTt()}
                >
                  <Image src="/tiktok.svg" alt="TikTok Logo" width="40" height="16" />
                  Continue with TikTok
                </Button>
              </div>
            </div>
          )}
        </div>
        {(!!videos || !!tiktokUserInfo) && (
          <Tabs defaultValue="youtube" className="mt-[3px] max-w-screen-lg mx-auto">
            <TabsList aria-label="social media opitons" className="px-5">
              <TabsTrigger value="youtube">YouTube</TabsTrigger>
              <TabsTrigger value="tiktok">TikTok</TabsTrigger>
            </TabsList>

            <TabsContent value="youtube">
              <div className="flex flex-col items-center gap-8 mb-16 px-4">
                {!!ytUserInfo && (
                  <>
                    <div className="flex gap-4">
                      {ytUserInfo.thumbnail && <img src={ytUserInfo.thumbnail} alt="YouTube User Thumbnail" width="35" height="35" className="rounded-full" />}
                      <h2 className="text-2xl font-bold text-gray-800">{ytUserInfo.userName}</h2>
                    </div>

                    <Calendar
                      scheduledVideos={videos || []}
                      setEditVideo={setEditVideo}
                    />
                    <Button
                      variant="secondary"
                      className="w-fit ml-auto mt-4"
                      onClick={() => {
                        deleteCookie("userPlaylistId");
                        deleteCookie("tokens");
                        setVideos([]);
                      }}
                    >
                      Disconnect from Youtube
                    </Button>
                  </>
                )}
                {!ytUserInfo && (
                  <Button
                    variant="white"
                    size="xlarge"
                    className="flex gap-4 mt-4"
                    onClick={() => connectYt()}
                  >
                    <Image src="/youtube_logo.png" alt="Youtube Logo" width="50" height="20" className="w-12" />
                    Continue with Youtube
                  </Button>
                )}
              </div>
            </TabsContent>

            <TabsContent value="tiktok">
              <div className="flex flex-col items-center gap-8 mb-16 px-4">
                {!!tiktokUserInfo && (
                  <>
                    <div className="flex gap-4">
                      {tiktokUserInfo.thumbnail && <img src={tiktokUserInfo.thumbnail} alt="YouTube User Thumbnail" width="35" height="35" className="rounded-full" />}
                      <h2 className="text-2xl font-bold text-gray-800">{tiktokUserInfo.userName}</h2>
                    </div>

                    <Calendar
                      scheduledVideos={videos || []}
                      setEditVideo={setEditVideo}
                    />

                    <Button
                      className="w-fit ml-auto mt-4"
                      variant="secondary"
                      onClick={() => {
                        deleteCookie("userPlaylistId");
                        deleteCookie("tokens");
                        setVideos([]);
                      }}
                    >
                      Disconnect from Tiktok
                    </Button>
                  </>
                )}
                {!tiktokUserInfo && (
                  <Button
                    variant="white"
                    size="xlarge"
                    className="flex gap-4 mt-4"
                    onClick={() => connectTt()}
                  >
                    <Image src="/tiktok.svg" alt="TikTok Logo" width="40" height="16" />
                    Continue with TikTok
                  </Button>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
      <div className={clsx({ "w-[400px]": !!editVideo?.description }, "fixed right-0 top-0 z-10 w-0 transition-[width] h-screen border-l drop-shadow bg-gray-100 border-gray-50")}>
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
            <Button
              variant="primary"
              onClick={() => saveEditVideo()}
              type="button"
            >
              Update
            </Button>
            <Button
              variant="secondary"
              onClick={() => closeEditVideo()}
              type="button"
            >
              Exit
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
