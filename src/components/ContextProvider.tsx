import { showNotification } from "@mantine/notifications";
import { getCookie } from "cookies-next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { HiBell, HiXCircle } from "react-icons/hi";
import { io, Socket } from "socket.io-client";
import SocketContext from "../contexts/Socket";

const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const router = useRouter();

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

      socket.on("@user/logout", () => {
        console.log("logout");
        router.push("/login");
        showNotification({
          title: "You have been logged out",
          message: "You have been logged out from another device.",
          icon: <HiXCircle />,
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
