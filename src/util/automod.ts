import { isRestricted } from "../data/reconsiderWords";
import logger from "./logger";
import prisma from "./prisma";

type AutoModHandler = (uid: number, content: string) => void;

function registerAutomodHandler(reference: string): AutoModHandler {
  return async (uid: number, content: string) => {
    const { hasMatch, matchedWords } = isRestricted(content);
    if (hasMatch) {
      await prisma.automodTrigger.create({
        data: {
          user: {
            connect: {
              id: uid,
            },
          },
          reference,
          content,
          matched: matchedWords.map((m) => m.matched),
        },
      });
    } else {
      logger().info(
        `Automod has verified ${reference} for user ${uid}. No inappropriate content detected.`
      );
    }
  };
}

export default registerAutomodHandler;
