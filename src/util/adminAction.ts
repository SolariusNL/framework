import { HiCheckCircle, HiXCircle } from "react-icons/hi";
import { showNotification } from "@mantine/notifications";
import { getCookie } from "cookies-next";

export enum AdminAction {
  ADJUST_TICKETS = "adjust-tickets",
  RESET_USERNAME = "reset-username",
  LOGOUT_SESSIONS = "logout-sessions",
}

async function performAdminAction(action: AdminAction, data: any, uid: number) {
  const response = await fetch(`/api/admin/action/${uid}/${action}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: String(getCookie(".frameworksession")),
    },
    body: JSON.stringify(data),
  });
  const res = (await response.json()) as { success: boolean; error?: string };
  if (res.success) {
    showNotification({
      title: "Success",
      message: "Action performed successfully",
      icon: HiCheckCircle({}),
    });
  } else {
    showNotification({
      title: "Error",
      message: res.error || "An unknown error occurred",
      color: "red",
      icon: HiXCircle({}),
    });
  }
}

export default performAdminAction;
