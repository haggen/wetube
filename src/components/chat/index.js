import React from "react";
import { userActions } from "../app";

import style from "./style.module.css";

const formattedAction = entry => {
  switch (entry.action) {
    case userActions.sentMessage:
      return "says: " + entry.message;
    case userActions.pausedVideo:
      return "paused the video.";
    case userActions.playedVideo:
      return "played the video.";
    case userActions.changedVideoUrl:
      return "changed video URL to " + entry.url;
    case userActions.connected:
      return "connected.";
    default:
      return "unknown action";
  }
};

export function Chat({ onMessage, log }) {
  const handleChatKeyDown = e => {
    if (e.key === "Enter") {
      onMessage(e.target.value);
      e.preventDefault();
      e.target.value = "";
    }
  };

  return (
    <aside className={style.layout}>
      <div className={style.history}>
        <ul>
          {(log || []).map(entry => (
            <li key={entry.timestamp}>
              <strong style={{ backgroundColor: entry.author.color }}>{entry.author.name}</strong> {formattedAction(entry)}
            </li>
          ))}
        </ul>
      </div>
      <textarea className={style.textarea} placeholder="Say something..." onKeyDown={e => handleChatKeyDown(e)} />
    </aside>
  );
}
