import { User } from "@prisma/client";

export const Presence = {
  online(user: Pick<User, "lastSeen">) {
    const lastSeen = new Date(user.lastSeen);
    const now = new Date();
    const threshold = 5 * 60 * 1000;

    return now.getTime() - lastSeen.getTime() < threshold;
  },
};
