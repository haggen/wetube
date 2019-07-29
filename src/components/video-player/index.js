import React, { useMemo } from "react";
import YouTube from "react-youtube";

import style from "./style.module.css";

export const playerStates = {
  unstarted: -1,
  ended: 0,
  playing: 1,
  paused: 2,
  buffering: 3,
  cued: 5
};

Object.keys(playerStates).forEach(name => {
  playerStates[playerStates[name]] = name;
});

export function VideoPlayer({ playerRef, url, onVideoPlayerStateChange }) {
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
    onVideoPlayerStateChange(e.data);
  };

  const options = {
    playerVars: {
      // controls: 0,
      // disablekb: 1
    }
  };

  return (
    <YouTube
      containerClassName={style.video}
      opts={options}
      videoId={videoId}
      onReady={e => handleReady(e)}
      onStateChange={e => handleStateChange(e)}
    />
  );
}
