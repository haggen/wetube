import { useEffect } from "react";
import { uniqueId } from "../lib/unique-id";

export const useRoomId = () => {
  const roomId =
    window.location.pathname === "/"
      ? uniqueId()
      : window.location.pathname.substring(1);

  useEffect(() => {
    window.history.pushState({}, null, "/" + roomId);
  }, [roomId]);

  return roomId;
};
