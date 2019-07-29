import { useEffect, useRef } from "react";

export const useWebSocket = (url, handler) => {
  const webSocketRef = useRef(null);

  useEffect(() => {
    webSocketRef.current = new WebSocket(url);
    return () => {
      webSocketRef.current.close();
    };
  }, [url]);

  useEffect(() => {
    if (webSocketRef.current) {
      webSocketRef.current.onopen = e => {
        handler({ action: "connected" });
      };
      webSocketRef.current.onmessage = e => {
        handler(JSON.parse(e.data));
      };
    }
  }, [handler]);

  const dispatch = payload => {
    if (webSocketRef.current) {
      webSocketRef.current.send(JSON.stringify(payload));
    }
  };

  return [
    webSocketRef.current ? webSocketRef.current.readyState : null,
    dispatch
  ];
};
