import { showNotification } from "@mantine/notifications";
import { getCookie } from "cookies-next";
import { HiCheckCircle, HiXCircle } from "react-icons/hi";

export enum AdminAction {
  ADJUST_TICKETS = "adjust-tickets",
  RESET_USERNAME = "reset-username",
  LOGOUT_SESSIONS = "logout-sessions",
  RESET_EMAIL = "reset-email",
  RESET_PASSWORD = "reset-password",
  RESET_BIO = "reset-bio",
  EDIT_EMPLOYEE = "edit-employee",
  ADJUST_SUBSCRIPTION = "adjust-subscription",
  UNBAN = "unban",
  UNWARN = "unwarn",
  SEND_EMAIL = "send-email",
  ADJUST_VERIFICATION = "adjust-verification",
  ADJUST_PROTECTED = "adjust-protected",
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
  if (res.success === true) {
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
