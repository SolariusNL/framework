import { showNotification } from "@mantine/notifications";
import { getCookie } from "cookies-next";
import { HiCheckCircle } from "react-icons/hi";

async function shutdownNucleus(gameId: number) {
  await fetch(`/api/nucleus/shutdown/${gameId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: String(getCookie(".frameworksession")),
    },
  }).then(() => {
    showNotification({
      title: "Success",
      message: "Shutdown request sent to server",
      icon: HiCheckCircle({}),
    });
  });
}

export default shutdownNucleus;
