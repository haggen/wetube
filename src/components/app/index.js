import React, { useRef, useState, useCallback, useEffect } from "react";

import { uniqueId } from "../../lib/unique-id";
import { useRoomId } from "../../hooks/room-id";
import { useWebSocket } from "../../hooks/web-socket";
import { VideoPlayer, playbackStates } from "../video-player";
import { Chat } from "../chat";
import { Profile } from "../profile";

import style from "./style.module.css";

export const userActions = {
  connected: "connected",
  sentMessage: "sent-message",
  changedVideoUrl: "changed-video-url",
  pausedVideo: "paused-video",
  playedVideo: "played-video"
};

export function App() {
  const roomId = useRoomId();

  const [videoUrl, setVideoUrl] = useState();
  // "https://www.youtube.com/watch?v=4rt695LhGjw"
  const playerRef = useRef(null);

  const savedProfile = localStorage.getItem("profile");

  const [author, setAuthor] = useState(
    savedProfile
      ? JSON.parse(savedProfile)
      : {
          id: uniqueId(),
          name: "John",
          color: "#ff0000"
        }
  );

  useEffect(() => {
    localStorage.setItem("profile", JSON.stringify(author));
  }, [author]);

  const [log, setLog] = useState([]);

  const pushLog = entry => {
    setLog(log => log.concat({ timestamp: Date.now(), ...entry }));
  };

  const handleVideoUrlChange = value => {
    try {
      const url = new URL(value);
      if (/^(youtu\.be|www\.youtube\.com)$/.test(url.hostname)) {
        setVideoUrl(url);
        broadcast({ action: userActions.changedVideoUrl, author, url });
        pushLog({ action: userActions.changedVideoUrl, author, url });
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const [readyState, broadcast] = useWebSocket(
    "wss://ws.crz.li/wetube/" + roomId,
    message => {
      switch (message.action) {
        case userActions.connected:
          if (message.author) {
            pushLog({ action: userActions.connected, author: message.author });
          } else {
            broadcast({ action: userActions.connected, author });
          }
          break;
        case userActions.sentMessage:
          pushLog(message);
          break;
        case userActions.pausedVideo:
          pushLog(message);
          playerRef.current.pauseVideo();
          break;
        case userActions.playedVideo:
          pushLog(message);
          playerRef.current.playVideo();
          break;
        case userActions.changedVideoUrl:
          pushLog(message);
          setVideoUrl(message.url);
          break;
        default:
          console.warn("Unhandled message", message);
      }
    }
  );

  const handlePlayerInteraction = playbackState => {
    switch (playbackState) {
      case playbackStates.playing:
        broadcast({ action: userActions.playedVideo, author });
        pushLog({ action: userActions.playedVideo, author });
        break;
      case playbackStates.paused:
        broadcast({ action: userActions.pausedVideo, author });
        pushLog({ action: userActions.pausedVideo, author });
        break;
      default:
        console.warn("Unhandled playback state", playbackState);
    }
  };

  const handleChatMessage = message => {
    broadcast({ action: userActions.sentMessage, author, message });
    pushLog({ action: userActions.sentMessage, author, message });
  };

  return (
    <main className={style.layout}>
      <div className={style.topbar}>
        <h1>
          <a href="/">WeTube</a>
        </h1>
        <input
          className="url"
          type="text"
          defaultValue={videoUrl ? videoUrl.toString() : ""}
          onChange={e => handleVideoUrlChange(e.target.value)}
          placeholder="YouTube video URL, e.g. https://www.youtube.com/watch?v=4rt695LhGjw"
        />
      </div>
      <div className={style.profile}>
        <Profile onChange={author => setAuthor(author)} author={author} />
      </div>
      <div className={style.content}>
        <VideoPlayer
          className="video"
          playerRef={playerRef}
          url={videoUrl}
          onInteraction={state => handlePlayerInteraction(state)}
        />
      </div>
      <div className={style.sidebar}>
        <Chat log={log} onMessage={message => handleChatMessage(message)} />
      </div>
    </main>
  );
}
