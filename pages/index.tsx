import { useEffect, useState } from "react";
import Image from 'next/image';
import { getCookie, setCookie, deleteCookie } from 'cookies-next'
import Calendar from '@/app/components/Calendar';

export default function Home() {
  const [tokens, setTokens] = useState(getCookie('tokens'));
  const [playlistToken, setPlaylistToken] = useState(
    getCookie('userPlaylistId'),
  );
  const [videos, setVideos] = useState([]);

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
        'Content-Type': 'application/json',
        cookie: `tokens=${tokens}`,
      },
    }).then(async (res) => {
      const { playlistId } = await res.json();
      setCookie('userPlaylistId', playlistId);
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

  useEffect(() => {
    if (tokens)
      getPlaylistId();
  }, [tokens]);

  useEffect(() => {
    if (playlistToken)
      getVideos();
  }, [playlistToken]);

  return (
    <main>
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
            setLocallScheduledVideoData={setVideos}
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
    </main>
  );
}
