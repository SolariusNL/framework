import { OAuthScope } from "@prisma/client";

const scopes: Record<OAuthScope, string> = {
  [OAuthScope.USER_CHATS_READ]: "read your chats",
  [OAuthScope.USER_CHATS_WRITE]: "send chats using your account",
  [OAuthScope.USER_PROFILE_READ]: "read your profile",
  [OAuthScope.USER_TEAMS_JOIN]: "join teams on your behalf",
  [OAuthScope.USER_TEAMS_LEAVE]: "leave teams on your behalf",
  [OAuthScope.USER_EMAIL_READ]: "read your email address",
};

export default scopes;
