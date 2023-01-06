import { ApiKeyPermission } from "@prisma/client";

const apiKeyPermissions = new Map<
  ApiKeyPermission,
  { name: string; description: string }
>([
  [
    ApiKeyPermission.GATEWAY,
    { name: "Gateway", description: "Access to the socket gateway" },
  ],
  [
    ApiKeyPermission.USER_CHAT_READ,
    { name: "User Chat Read", description: "Read user chat messages" },
  ],
  [
    ApiKeyPermission.USER_CHAT_WRITE,
    { name: "User Chat Write", description: "Write user chat messages" },
  ],
  [
    ApiKeyPermission.USER_CHECKLIST_READ,
    { name: "User Checklist Read", description: "Read user checklists" },
  ],
  [
    ApiKeyPermission.USER_CHECKLIST_WRITE,
    { name: "User Checklist Write", description: "Write user checklists" },
  ],
  [
    ApiKeyPermission.USER_GAMES_READ,
    { name: "User Games Read", description: "Read user games" },
  ],
  [
    ApiKeyPermission.USER_GAMES_WRITE,
    { name: "User Games Write", description: "Write user games" },
  ],
  [
    ApiKeyPermission.USER_MEDIA_READ,
    { name: "User Media Read", description: "Read user media" },
  ],
  [
    ApiKeyPermission.USER_PROFILE_READ,
    { name: "User Profile Read", description: "Read user profiles" },
  ],
  [
    ApiKeyPermission.USER_PROFILE_WRITE,
    { name: "User Profile Write", description: "Write user profiles" },
  ],
]);

export default apiKeyPermissions;
