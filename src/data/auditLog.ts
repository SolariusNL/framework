import { TeamAuditLogType } from "@prisma/client";
import {
  HiEye,
  HiPencil,
  HiSpeakerphone,
  HiUserAdd,
  HiUserRemove,
} from "react-icons/hi";
import { IconType } from "react-icons/lib";

const auditLogMeta = new Map<
  TeamAuditLogType,
  { icon: IconType; label: string; type: "add" | "remove" | "change" }
>([
  [
    TeamAuditLogType.REMOVE_USER,
    { icon: HiUserRemove, label: "Remove user", type: "remove" },
  ],
  [
    TeamAuditLogType.UPDATE_INVITED_USERS,
    { icon: HiUserAdd, label: "Updated invited users", type: "add" },
  ],
  [
    TeamAuditLogType.UPDATE_PRIVACY_STATUS,
    { icon: HiEye, label: "Updated privacy status", type: "change" },
  ],
  [
    TeamAuditLogType.UPDATE_SHOUT,
    { icon: HiSpeakerphone, label: "Updated shout", type: "change" },
  ],
  [
    TeamAuditLogType.UPDATE_TEAM_DETAILS,
    { icon: HiPencil, label: "Updated team details", type: "change" },
  ],
]);

export default auditLogMeta;
