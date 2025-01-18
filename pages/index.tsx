'use client'
import { useEffect, useState } from "react";
import Cookie from "js-cookie";

export default function Home() {
  const [videos, setVideos] = useState([]);

  const connect = async () => {
    await fetch('/api/connect-yt', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(async (res) => {
      const oAuthCallback = await res.json();
      window.open(oAuthCallback.url, '_blank', 'location=yes,height=570,width=520,scrollbars=yes,status=yes');
    });
    console.log('connect')
  }

  const playlistId = Cookie.get('userPlaylistId');

  const getVideos = async () => {
    const tokens = Cookie.get('tokens');

    await fetch('/api/get-videos', {
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
    if (playlistId)
      getVideos();
  }, [playlistId]);

  return (
    <main>
      <h1>Carrot Cake</h1>
      <button onClick={() => connect()}>Connect to YT</button>
      <>
      {!!videos && videos.map((video:{snippet:{title:string, description:string, thumbnails:{medium:{url:string}}}}) => (
        <>
        <div>
          <button onClick={() => {
            Cookie.remove("userPlaylistId");
            Cookie.remove("tokens");
            setVideos([]);
          }}>Disconnect YT</button>
        </div>
        <div>
          <h2>{video.snippet.title}</h2>
          <p>{video.snippet.description}</p>
          <img src={video.snippet.thumbnails.medium.url} alt="" />
        </div>
        </>
      ))}
      </>
    </main>
  );
}
