'use client'
import { useEffect, useState } from "react";
import { getCookie, setCookie, deleteCookie } from 'cookies-next'

export default function Home() {
  const tokens = getCookie('tokens');
  const playlistId = getCookie('userPlaylistId');

  const [videos, setVideos] = useState([]);

  const connect = async () => {
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

  useEffect(() => {
    if (tokens)
      getPlaylistId();
  }, [tokens]);

  useEffect(() => {
    if (playlistId)
      getVideos();
  }, [playlistId]);

  return (
    <main>
      <h1>Carrot Cake</h1>
      <button onClick={() => connect()}>Connect to YT</button>
      <>
        {!!videos && videos.map((video: { snippet: { title: string, description: string, thumbnails: { medium: { url: string } } } }) => (
          <div key={video.snippet.title}>
            <div>
              <button onClick={() => {
                deleteCookie("userPlaylistId");
                deleteCookie("tokens");
                setVideos([]);
              }}>Disconnect YT</button>
            </div>
            <div>
              <h2>{video.snippet.title}</h2>
              <p>{video.snippet.description}</p>
              <img src={video.snippet.thumbnails.medium.url} alt="" />
            </div>
          </div>
        ))}
      </>
    </main>
  );
}
