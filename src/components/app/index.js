import React, { useRef, useState } from "react";

import { useRoomId } from "../../hooks/room-id";
import { useWebSocket } from "../../hooks/web-socket";
import { useCurrentUser } from "../../hooks/current-user";
import { Video, videoPlayerStates } from "../video";
import { Chat } from "../chat";
import { Profile } from "../profile";

import style from "./style.module.css";

export const userActionTypes = {
  connected: "connected",
  sentMessage: "sent-message",
  changedVideoUrl: "changed-video-url",
  pausedVideo: "paused-video",
  playedVideo: "played-video"
};

export function App() {
  const roomId = useRoomId();
  const [videoUrl, setVideoUrl] = useState();
  const videoPlayerRef = useRef();
  const [currentUser, setCurrentUser] = useCurrentUser();
  const [userActionLog, setUserActionLog] = useState([]);

  const handleOwnUserAction = action => {
    switch (action.type) {
      case userActionTypes.changedVideoUrl:
        broadcast(action);
        break;
      case userActionTypes.playedVideo:
        broadcast(action);
        break;
      case userActionTypes.pausedVideo:
        broadcast(action);
        break;
      case userActionTypes.sentMessage:
        broadcast(action);
        break;
      case userActionTypes.connected:
        broadcast(action);
        break;
      default:
        console.log("Unhandled own action", action);
    }
  };

  const handleRemoteUserAction = action => {
    switch (action.type) {
      case userActionTypes.connected:
        if (videoUrl) {
          broadcast(
            makeOwnUserAction(userActionTypes.changedVideoUrl, {
              url: videoUrl.toString()
            })
          );
        }
        break;
      case userActionTypes.sentMessage:
        break;
      case userActionTypes.pausedVideo:
        if (
          videoPlayerRef.current.getPlayerState() !== videoPlayerStates.paused
        ) {
          videoPlayerRef.current.pauseVideo();
        }
        break;
      case userActionTypes.playedVideo:
        if (
          videoPlayerRef.current.getPlayerState() !== videoPlayerStates.playing
        ) {
          videoPlayerRef.current.seekTo(action.currentTime);
          videoPlayerRef.current.playVideo();
        }
        break;
      case userActionTypes.changedVideoUrl:
        if (!videoUrl || action.url !== videoUrl.toString()) {
          setVideoUrl(action.url);
        }
        break;
      default:
        console.warn("Unhandled remote action", action);
    }
  };

  const pushUserAction = action => {
    console.log("Push user action", action);
    setUserActionLog(log => log.concat(action));
    if (action.user.id === currentUser.id) {
      handleOwnUserAction(action);
    } else {
      handleRemoteUserAction(action);
    }
  };

  const makeOwnUserAction = (type, data = {}) => ({
    timestamp: Date.now(),
    type,
    user: currentUser,
    ...data
  });

  const [, broadcast] = useWebSocket(
    "wss://ws.crz.li/wetube/" + roomId,
    () => {
      pushUserAction(makeOwnUserAction(userActionTypes.connected));
    },
    action => {
      pushUserAction(action);
    }
  );

  const handleVideoUrlChange = value => {
    try {
      const url = new URL(value);
      if (/^(youtu\.be|www\.youtube\.com)$/.test(url.hostname)) {
        setVideoUrl(url);
        pushUserAction(
          makeOwnUserAction(userActionTypes.changedVideoUrl, {
            url: url.toString()
          })
        );
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const handlePlayerStateChange = state => {
    switch (state) {
      case videoPlayerStates.playing:
        pushUserAction(
          makeOwnUserAction(userActionTypes.playedVideo, {
            currentTime: videoPlayerRef.current.getCurrentTime()
          })
        );
        break;
      case videoPlayerStates.paused:
        pushUserAction(makeOwnUserAction(userActionTypes.pausedVideo));
        break;
      default:
        console.warn("Unhandled playback state", state);
    }
  };

  const handleChatMessage = message => {
    pushUserAction(makeOwnUserAction(userActionTypes.sentMessage, { message }));
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
        <Profile onChange={user => setCurrentUser(user)} user={currentUser} />
      </div>
      <div className={style.content}>
        <Video
          className="video"
          playerRef={videoPlayerRef}
          url={videoUrl}
          onPlayerStateChange={state => handlePlayerStateChange(state)}
        />
      </div>
      <div className={style.sidebar}>
        <Chat
          log={userActionLog}
          onMessage={message => handleChatMessage(message)}
        />
      </div>
    </main>
  );
}
