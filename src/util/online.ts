import { User } from "@prisma/client";

const isUserOnline = (user: Pick<User, "lastSeen">) => {
  const threshold = 5 * 60 * 1000;
  const now = Date.now();
  const lastSeen = new Date(user.lastSeen).getTime();

  return now - lastSeen < threshold;
};

export default isUserOnline;
