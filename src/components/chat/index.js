import React, { useRef, useLayoutEffect } from "react";
import useStayScrolled from "react-stay-scrolled";

import { userActionTypes } from "../app";

import style from "./style.module.css";

const formattedAction = action => {
  switch (action.type) {
    case userActionTypes.sentMessage:
      return "says: " + action.message;
    case userActionTypes.pausedVideo:
      return "paused the video.";
    case userActionTypes.playedVideo:
      return "played the video.";
    case userActionTypes.changedVideoUrl:
      return "changed video URL to " + action.url;
    case userActionTypes.connected:
      return "connected.";
    default:
      return "unknown action";
  }
};

export function Chat({ log, onMessage }) {
  const overflowingRef = useRef();
  const { stayScrolled } = useStayScrolled(overflowingRef);

  useLayoutEffect(() => {
    stayScrolled();
  }, [stayScrolled, log.length]);

  const handleChatKeyDown = e => {
    if (e.key === "Enter") {
      onMessage(e.target.value);
      e.preventDefault();
      e.target.value = "";
    }
  };

  return (
    <aside className={style.layout}>
      <div ref={overflowingRef} className={style.history}>
        <ul>
          {(log || []).map(action => (
            <li key={action.timestamp}>
              <strong style={{ backgroundColor: action.user.color }}>
                {action.user.name}
              </strong>{" "}
              {formattedAction(action)}
            </li>
          ))}
        </ul>
      </div>
      <textarea
        className={style.textarea}
        placeholder="Say something..."
        onKeyDown={e => handleChatKeyDown(e)}
      />
    </aside>
  );
}
