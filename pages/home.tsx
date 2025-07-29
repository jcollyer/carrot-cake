import Button from "@/app/components/primitives/Button";
import SocialDisplay from "@/app/components/SocialDisplay";
import { useEffect, useState } from "react";
import Image from "next/image";
import { getServerSession } from "next-auth"
import { authOptions } from "@/pages/api/auth/[...nextauth]"
import { getCookie, setCookie, deleteCookie } from "cookies-next"
import { CircleX } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/primitives/Tabs";
import Calendar from "@/app/components/Calendar";
import {
  sanitizeYTMetadata,
  sanitizeTikTokMetadata,
  sanitizeInstagramMetadata
} from "@/app/utils/sanitizeApiData";
import { useGetYouTubeUserInfo } from "@/app/hooks/use-get-youtube-user-info";
import { CATEGORIES, IG_CONNECT_URL } from "@/app/constants";
import { useRouter } from "next/router";
import clsx from "clsx";
import {
  SanitizedVideoProps,
  InstagramVideo,
  YouTubeVideo,
  YouTubeUserInfo,
  TikTokVideo,
  TikTokUserInfo,
  InstagramUserInfo,
} from "@/types"
import moment from "moment";

export const getServerSideProps = async (context: any) => {
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
  const router = useRouter();
  const [youtubeTokens, setYouTubeTokens] = useState(getCookie("youtube-tokens"));
  const [tiktokTokens, setTiktokTokens] = useState(getCookie("tiktok-tokens"));
  const [instagramToken, setInstagramToken] = useState(getCookie("ig-access-token"));
  const [playlistId, setPlaylistId] = useState(getCookie("userPlaylistId"));
  const [youTubeVideos, setYouTubeVideos] = useState<YouTubeVideo[]>();
  const [tiktokVideos, setTiktokVideos] = useState<TikTokVideo[]>([]);
  const [instagramVideos, setInstagramVideos] = useState<InstagramVideo[]>([]);
  const [ytUserInfo, setYtUserInfo] = useState<YouTubeUserInfo>();
  const [tiktokUserInfo, setTiktokUserInfo] = useState<TikTokUserInfo>();
  const [instagramUserData, setInstagramUserData] = useState<InstagramUserInfo>();
  const [editVideo, setEditVideo] = useState<SanitizedVideoProps>({
    categoryId: "",
    description: "",
    file: "",
    id: "",
    scheduleDate: "",
    tags: "",
    title: "",
    thumbnail: "",
  });
  const [tabOpen, setTabOpen] = useState("youtube");

  const connectTt = async () => {
    listenCookieChange(({ oldValue, newValue }) => {
      if (oldValue !== newValue) {
        setTiktokTokens(newValue);
      }
    }, 1000, "tiktok-tokens");
    await fetch("/api/tiktok/connect-tiktok", {
      method: "GET",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }).then(async (res) => {
      const oAuthCallback = await res.json();
      window.open(oAuthCallback.url, "_blank", "location=yes,height=570,width=520,scrollbars=yes,status=yes");
    });
  }

  const connectYt = async () => {
    listenCookieChange(({ oldValue, newValue }) => {
      if (oldValue !== newValue) {
        setYouTubeTokens(newValue);
      }
    }, 1000, "youtube-tokens");
    await fetch("/api/youtube/connect-yt", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then(async (res) => {
      const oAuthCallback = await res.json();
      window.open(oAuthCallback.url, "_blank", "location=yes,height=570,width=520,scrollbars=yes,status=yes");
    });
  }

  const connectIg = () => {
    listenCookieChange(({ oldValue, newValue }) => {
      if (oldValue !== newValue) {
        setInstagramToken(newValue);
      }
    }, 1000, "ig-access-token");
    const igConnect = IG_CONNECT_URL;
    window.open(igConnect, "_blank", "location=yes,height=570,width=520,scrollbars=yes,status=yes");
  }

  const getTikTokUserInfo = async () => {
    fetch("/api/tiktok/get-user-info", {
      method: "GET",
    })
      .then(response => response.json())
      .then(({ data }) => {
        const { user } = data;
        setTiktokUserInfo({ ...user });
        setTabOpen("tiktok");
      })
      .catch(error => {
        console.error("Fetch error:", error);
      });
  }

  const getInstagramUserData = async () => {
    fetch("/api/instagram/get-user-data", {
      method: "GET",
      headers: {
        cookie: `${instagramToken}`,
      },
    }).then(async (data) => {
      const user = await data.json();
      setInstagramUserData(user);
      setTabOpen("instagram");
    });
  }

  const getTikTokUserVideos = async () => {
    fetch("/api/tiktok/get-user-videos", {
      method: "POST",
    })
      .then(response => response.json())
      .then(data => setTiktokVideos(data.data.videos))
      .catch(error => {
        console.error("Fetch error:", error);
      });
  }

  const getInstagramUserVideos = async () => {
    fetch("/api/instagram/get-user-videos", {
      method: "GET",
      headers: {
        cookie: `${instagramToken}`,
      },
    }).then(async (data) => {
      const videos = await data.json();
      setInstagramVideos(videos.data);
    });
  }

  const getPlaylistId = async () => {
    await fetch("/api/youtube/get-playlist-id", {
      method: "GET",
      headers: {
        cookie: `youtube-tokens=${youtubeTokens}`,
      },
    }).then(async (res) => {
      const { playlistId } = await res.json();
      setCookie("userPlaylistId", playlistId, { maxAge: 31536000 });
      setPlaylistId(playlistId);
    });
  }

  useEffect(() => {
    const getUserInfo = async () => {
      if (youtubeTokens) {
        const data = await useGetYouTubeUserInfo({ tokens: youtubeTokens as string })
        setYtUserInfo({ ...data })
      }
    }
    getUserInfo()
  }, [youtubeTokens]);

  const getYouTubeVideos = async () => {
    await fetch("/api/youtube/get-videos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: `youtube-tokens=${youtubeTokens}`,
      },
      body: JSON.stringify({ playlistId }),
    }).then(async (res) => {
      const videos = await res.json();
      setYouTubeVideos(videos);
      setTabOpen("youtube");
    });
  }

  const listenCookieChange = (callback: (values: { oldValue: string, newValue: string }) => void, interval = 1000, tokenType = "youtube-tokens") => {
    let lastCookie = getCookie(tokenType) as string;
    setInterval(() => {
      const tokens = getCookie(tokenType) as string;
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
    await fetch("/api/youtube/update-video", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: `youtube-tokens=${youtubeTokens}`,
      },
      body: JSON.stringify(editVideo),
    })
      .then(response => response.json())
      .then(() => {
        const updatedScheduledVideos = youTubeVideos?.map(video => {
          if (video.id === editVideo.id) {
            return {
              ...video,
              snippet: {
                ...video.snippet,
                title: editVideo.title,
                description: editVideo.description,
                categoryId: editVideo.categoryId,
                tags: editVideo?.tags,
              },
              status: {
                publishAt: editVideo.scheduleDate,
              },
            };
          }
          return video;
        });

        setYouTubeVideos(updatedScheduledVideos);
        setEditVideo({
          description: "",
          categoryId: "",
          file: "",
          id: "",
          scheduleDate: "",
          tags: "",
          title: "",
          thumbnail: "",
        });
      })
      .catch(error => {
        console.error("Error updating video:", error);
      });
  };

  const closeEditVideo = () => {
    setEditVideo({
      description: "",
      categoryId: "",
      file: "",
      id: "",
      scheduleDate: "",
      tags: "",
      title: "",
      thumbnail: "",
    });
  };

  useEffect(() => {
    if (youtubeTokens && !playlistId) {
      getPlaylistId();
    }
  }, [youtubeTokens]);

  useEffect(() => {
    if (tiktokTokens) {
      getTikTokUserInfo();
      getTikTokUserVideos();
    }
  }, [tiktokTokens])

  useEffect(() => {
    if (playlistId)
      // getYTChannelInfo();
      getYouTubeVideos();
  }, [playlistId]);

  useEffect(() => {
    if (instagramToken) {
      setTabOpen("instagram");
      getInstagramUserData();
      getInstagramUserVideos();
    }
  }, [instagramToken]);

  return (
    <main className="flex mt-8">
      <div className="w-full">
        <div className="flex flex-col items-center">
          {(!youTubeVideos && !tiktokUserInfo && !instagramUserData) && (
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
                <Button
                  variant="white"
                  size="xlarge"
                  className="flex gap-4 justify-center items-center"
                  onClick={() => connectIg()}
                >
                  <Image src="/ig_logo.svg" alt="Instagram Logo" width="40" height="18" />
                  Connect to Instagram
                </Button>
              </div>
            </div>
          )}
        </div>
        {(!!youTubeVideos || !!tiktokUserInfo || !!instagramUserData) && (
          <Tabs defaultValue={tabOpen} className="mt-[3px] max-w-screen-lg mx-auto">
            <TabsList aria-label="social media opitons" className="px-5">
              <TabsTrigger value="youtube">
                <div className="flex items-center gap-2">
                  <Image src="/youtube_logo.png" alt="YouTube Logo" width="16" height="16" />
                  <p className="font-semibold">YouTube</p>
                </div>
              </TabsTrigger>
              <TabsTrigger value="tiktok">
                <div className="flex items-center gap-2">
                  <Image src="/tiktok.svg" alt="TikTok Logo" width="16" height="6" />
                  <p className="font-semibold">TikTok</p>
                </div>
              </TabsTrigger>
              <TabsTrigger value="instagram">
                <div className="flex items-center gap-2">
                  <Image src="/ig_logo.svg" alt="Instagram Logo" width="16" height="6" />
                  <p className="font-semibold">Instagram</p>
                </div>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="youtube">
              <div className="flex flex-col gap-6 mb-16 px-4">
                {!!ytUserInfo ? (
                  <>
                    <SocialDisplay
                      userName={ytUserInfo.userName}
                      thumbnail={ytUserInfo.thumbnail}
                      videoCount={ytUserInfo.videoCount}
                      subscriberCount={ytUserInfo.subscriberCount}
                      viewCount={ytUserInfo.viewCount}
                      type="youtube"
                      onLogout={() => {
                        deleteCookie("userPlaylistId");
                        deleteCookie("youtube-tokens");
                        setYouTubeVideos([]);
                        setYtUserInfo(undefined);
                        setPlaylistId("");
                        router.push("/");
                      }}
                    />
                    <Calendar
                      scheduledVideos={sanitizeYTMetadata(youTubeVideos) || []}
                      setEditVideo={setEditVideo}
                      title="Uploaded Videos"
                      canEdit
                    />
                  </>
                ) : (
                  <Button
                    variant="white"
                    size="xlarge"
                    className="flex gap-4 mt-4 w-fit"
                    onClick={() => connectYt()}
                  >
                    <Image src="/youtube_logo.png" alt="Youtube Logo" width="50" height="20" className="w-12" />
                    Continue with Youtube
                  </Button>
                )}
              </div>
            </TabsContent>

            <TabsContent value="tiktok">
              <div className="flex flex-col gap-4 mb-16 px-4">
                {!!tiktokUserInfo && (
                  <>
                    <SocialDisplay
                      userName={tiktokUserInfo.display_name}
                      thumbnail={tiktokUserInfo.avatar_url}
                      videoCount={tiktokUserInfo.video_count}
                      likesCount={tiktokUserInfo.likes_count}
                      onLogout={() => {
                        deleteCookie("tiktok-tokens");
                        setTiktokVideos([]);
                        setTiktokUserInfo(undefined);
                      }}
                      type="tiktok"
                    />
                    <Calendar
                      scheduledVideos={sanitizeTikTokMetadata(tiktokVideos) || []}
                      setEditVideo={setEditVideo}
                      title="Uploaded Videos"
                      canEdit={false}
                    />
                  </>
                )}
                {!tiktokUserInfo && (
                  <Button
                    variant="white"
                    size="xlarge"
                    className="flex gap-4 mt-4 w-fit"
                    onClick={() => connectTt()}
                  >
                    <Image src="/tiktok.svg" alt="TikTok Logo" width="40" height="16" />
                    Continue with TikTok
                  </Button>
                )}
              </div>
            </TabsContent>

            <TabsContent value="instagram">
              <div className="flex flex-col gap-6 mb-16 px-4">
                {!!instagramUserData && (
                  <>
                    <SocialDisplay
                      userName={instagramUserData.username}
                      thumbnail={instagramUserData.profile_picture_url}
                      videoCount={instagramUserData.media_count}
                      followsCount={instagramUserData.follows_count}
                      followersCount={instagramUserData.followers_count}
                      onLogout={() => {
                        deleteCookie("ig-access-token");
                        setInstagramUserData(undefined);
                      }}
                      type="instagram"
                    />
                    <Calendar
                      scheduledVideos={sanitizeInstagramMetadata(instagramVideos) || []}
                      setEditVideo={setEditVideo}
                      title="Uploaded Videos"
                      canEdit={false}
                    />
                  </>
                )}
                {!instagramUserData && (
                  <Button
                    variant="white"
                    size="xlarge"
                    className="flex gap-4 mt-4 w-fit"
                    onClick={() => connectIg()}
                  >
                    <Image src="/ig_logo.svg" alt="Instagram Logo" width="50" height="20" className="w-12" />
                    Connect Instagram
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
          <div className="flex flex-col gap-8">
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
                {CATEGORIES.map(item => (
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
