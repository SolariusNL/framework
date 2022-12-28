import { showNotification } from "@mantine/notifications";
import { getCookie } from "cookies-next";
import { useEffect, useState } from "react";
import { HiBell } from "react-icons/hi";
import { io, Socket } from "socket.io-client";
import SocketContext from "../contexts/Socket";

const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    let socket: Socket;
    if (typeof window !== "undefined") {
      socket = io({
        auth: {
          token: getCookie(".frameworksession"),
        },
      });
      setSocket(socket);

      socket.on("@user/notification", (updates) => {
        showNotification({
          title: updates.title,
          message: updates.message,
          icon: <HiBell />,
        });
      });
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export default SocketProvider;
