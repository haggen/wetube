import React, { useRef, useState, useCallback, useEffect } from "react";

import { useRoomId } from "../../hooks/room-id";
import { useWebSocket } from "../../hooks/web-socket";
import { randomUser } from "../../lib/random-user";
import { VideoPlayer, playerStates } from "../video-player";
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

const localStorageUserKey = "user";

export function App() {
  const roomId = useRoomId();

  const [videoUrl, setVideoUrl] = useState();
  const playerRef = useRef(null);

  const savedUser = localStorage.getItem(localStorageUserKey);
  const [user, setUser] = useState(
    savedUser ? JSON.parse(savedUser) : randomUser()
  );

  const [actionLog, setActionLog] = useState([]);

  const makeAction = (action, extra = {}) => ({
    timestamp: Date.now(),
    action,
    user,
    ...extra
  });

  const pushAction = action => {
    console.log("Push action", action);

    setActionLog(log => log.concat(action));

    if (action.user.id === user.id) {
      switch (action.action) {
        case userActions.changedVideoUrl:
          broadcast(action);
          break;
        case userActions.playedVideo:
          broadcast(action);
          break;
        case userActions.pausedVideo:
          broadcast(action);
          break;
        case userActions.sentMessage:
          broadcast(action);
          break;
        case userActions.connected:
          broadcast(action);
          break;
        default:
          console.log("Unhandled action", action);
      }
    }
  };

  const [lastKnownPlayerState, setLastKnownPlayerState] = useState(
    playerStates.unstarted
  );

  const [readyState, broadcast] = useWebSocket(
    "wss://ws.crz.li/wetube/" + roomId,
    () => {
      pushAction(makeAction(userActions.connected));
    },
    message => {
      switch (message.action) {
        case userActions.connected:
          pushAction(message);
          break;
        case userActions.sentMessage:
          pushAction(message);
          break;
        case userActions.pausedVideo:
          pushAction(message);
          setLastKnownPlayerState(playerStates.paused);
          playerRef.current.pauseVideo();
          break;
        case userActions.playedVideo:
          pushAction(message);
          setLastKnownPlayerState(playerStates.playing);
          playerRef.current.seekTo(message.currentTime);
          playerRef.current.playVideo();
          break;
        case userActions.changedVideoUrl:
          pushAction(message);
          setVideoUrl(message.url);
          break;
        default:
          console.warn("Unhandled message", message);
      }
    }
  );

  useEffect(() => {
    localStorage.setItem(localStorageUserKey, JSON.stringify(user));
  }, [user]);

  const handleVideoUrlChange = value => {
    try {
      const url = new URL(value);
      if (/^(youtu\.be|www\.youtube\.com)$/.test(url.hostname)) {
        setVideoUrl(url);
        pushAction(makeAction(userActions.changedVideoUrl, { url }));
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const handleVideoPlayerStateChange = state => {
    if (playerRef.current.getPlayerState() === lastKnownPlayerState) {
      return;
    }

    switch (state) {
      case playerStates.playing:
        pushAction(
          makeAction(userActions.playedVideo, {
            currentTime: playerRef.current.getCurrentTime()
          })
        );
        setLastKnownPlayerState(playerStates.playing);
        break;
      case playerStates.paused:
        pushAction(makeAction(userActions.pausedVideo));
        setLastKnownPlayerState(playerStates.paused);
        break;
      default:
        console.warn("Unhandled playback state", state);
    }
  };

  const handleChatMessage = message => {
    pushAction(makeAction(userActions.sentMessage, { message }));
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
        <Profile onChange={user => setUser(user)} user={user} />
      </div>
      <div className={style.content}>
        <VideoPlayer
          className="video"
          playerRef={playerRef}
          url={videoUrl}
          onVideoPlayerStateChange={state =>
            handleVideoPlayerStateChange(state)
          }
        />
      </div>
      <div className={style.sidebar}>
        <Chat
          log={actionLog}
          onMessage={message => handleChatMessage(message)}
        />
      </div>
    </main>
  );
}
