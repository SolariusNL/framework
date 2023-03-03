import { PremiumSubscriptionType } from "@prisma/client";
import { Socket } from "socket.io-client";

const PREMIUM_PAYOUTS = {
  [PremiumSubscriptionType.PREMIUM_ONE_MONTH]: 1200,
  [PremiumSubscriptionType.PREMIUM_SIX_MONTHS]: 7200,
  [PremiumSubscriptionType.PREMIUM_ONE_YEAR]: 14400,
};
const SOCKETS = {
  data: new Map<string, Socket>(),
  remove: (id: string) => {
    SOCKETS.data.delete(id);
  },
  get: (id: string) => {
    return SOCKETS.data.get(id);
  },
  set: (id: string, socket: Socket) => {
    SOCKETS.data.set(id, socket);
  },
};

export { PREMIUM_PAYOUTS, SOCKETS };
