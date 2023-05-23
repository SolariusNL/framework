import { User } from "@prisma/client";

export const Activity = {
  online(user: Pick<User, "lastSeen">) {
    const threshold = 5 * 60 * 1000;
    const now = Date.now();
    const lastSeen = new Date(user.lastSeen).getTime();

    return now - lastSeen < threshold;
  },
};
