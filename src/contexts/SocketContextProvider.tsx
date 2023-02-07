import { showNotification } from "@mantine/notifications";
import { getCookie } from "cookies-next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { HiBell, HiCheck, HiXCircle } from "react-icons/hi";
import { io, Socket } from "socket.io-client";
import SocketContext from "./Socket";

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
        } else {
          router.push("/");
          showNotification({
            title: "Unbanned",
            message:
              "You have been unbanned from Framework. You may now continue using the site. Thank you for your patience.",
            icon: <HiCheck />,
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
