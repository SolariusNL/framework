import { OAuthScope } from "@prisma/client";

const scopes: Record<OAuthScope, string> = {
  [OAuthScope.USER_CHATS_READ]: "read your chats",
  [OAuthScope.USER_CHATS_WRITE]: "send chats using your account",
  [OAuthScope.USER_PROFILE_READ]: "read your profile",
  [OAuthScope.USER_TEAMS_JOIN]: "join teams on your behalf",
  [OAuthScope.USER_TEAMS_LEAVE]: "leave teams on your behalf",
  [OAuthScope.USER_EMAIL_READ]: "read your email address",
};
const ownerDescriptions: Record<OAuthScope, string> = {
  [OAuthScope.USER_CHATS_READ]: "Read chats of users",
  [OAuthScope.USER_CHATS_WRITE]: "Send chats on behalf of users",
  [OAuthScope.USER_PROFILE_READ]: "Read profiles of users",
  [OAuthScope.USER_TEAMS_JOIN]: "Join teams on behalf of users",
  [OAuthScope.USER_TEAMS_LEAVE]: "Leave teams on behalf of users",
  [OAuthScope.USER_EMAIL_READ]: "Read email addresses of users",
};

export default scopes;
export { ownerDescriptions };
