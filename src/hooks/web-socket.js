import { useEffect, useRef } from "react";

export const useWebSocket = (url, connectionHandler, messageHandler) => {
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
        connectionHandler();
      };
      webSocketRef.current.onmessage = e => {
        messageHandler(JSON.parse(e.data));
      };
    }
  }, [messageHandler]);

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
