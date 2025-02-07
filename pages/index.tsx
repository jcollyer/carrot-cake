'use client'
import { useEffect, useState } from "react";
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
      <h1>Carrot Cake</h1>
      <button onClick={() => connect()}>Connect to YT</button>
      <button onClick={() => {
        deleteCookie("userPlaylistId");
        deleteCookie("tokens");
        setVideos([]);
      }}>Disconnect YT</button>
      {videos.length > 0 && <Calendar
        scheduledVideos={videos}
        setLocallScheduledVideoData={setVideos}
      />}
    </main>
  );
}
