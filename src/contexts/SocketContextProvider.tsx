import SocketContext from "@/contexts/Socket";
import { showNotification } from "@mantine/notifications";
import { getCookie } from "cookies-next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { HiBell, HiXCircle } from "react-icons/hi";
import { Socket, io } from "socket.io-client";

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
        reconnectionAttempts: 25,
        reconnectionDelay: 1000,
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
        router.push("/login");
        showNotification({
          title: "You have been logged out",
          message: "You have been logged out of your account.",
          icon: <HiXCircle />,
        });
      });

      socket.on("@user/ban", (data) => {
        const { banned } = data;
        if (banned) {
          router.push("/punished");
          showNotification({
            title: "Banned",
            message:
              "You have been banned from Framework. Please review your notice and check your email for more information.",
            icon: <HiXCircle />,
          });
        }
      });

      socket.on("@user/warning", () => {
        router.reload();
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
