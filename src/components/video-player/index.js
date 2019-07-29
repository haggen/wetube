import React, { useMemo } from "react";
import YouTube from "react-youtube";

import style from "./style.module.css";

export const playbackStates = {
  unstarted: -1,
  ended: 0,
  playing: 1,
  paused: 2,
  buffering: 3,
  cued: 5
};

Object.keys(playbackStates).forEach(name => {
  playbackStates[playbackStates[name]] = name;
});

export function VideoPlayer({ playerRef, url, onInteraction }) {
  const videoId = useMemo(() => {
    try {
      const parsedUrl = new URL(url);

      if (parsedUrl.hostname === "www.youtube.com") {
        return parsedUrl.searchParams.get("v");
      } else if (parsedUrl.hostname === "youtu.be") {
        return parsedUrl.pathname.substring(1);
      }
    } catch {
      return null;
    }
  }, [url]);

  const handleReady = e => {
    playerRef.current = e.target;
  };

  const handleStateChange = e => {
    console.log("Player state change:", e);
  };

  const togglePlaybackState = e => {
    const playbackState = playerRef.current.getPlayerState();
    switch (playbackState) {
      case playbackStates.playing:
        playerRef.current.pauseVideo();
        onInteraction(playbackStates.paused);
        break;
      default:
        playerRef.current.playVideo();
        onInteraction(playbackStates.playing);
    }
  };

  const options = {
    playerVars: {
      controls: 0,
      disablekb: 1
    }
  };

  return (
    <div className={style.layout}>
      <YouTube
        containerClassName={style.video}
        opts={options}
        videoId={videoId}
        onReady={e => handleReady(e)}
        onStateChange={e => handleStateChange(e)}
      />
      <menu type="toolbar" className={style.controls}>
        <button onClick={e => togglePlaybackState(e)}>Play/Pause</button>
      </menu>
    </div>
  );
}
