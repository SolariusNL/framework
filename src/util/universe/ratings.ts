import { RatingType } from "@prisma/client";

function getRatingTypeDescription(type: RatingType): string {
  switch (type) {
    case RatingType.EC:
      return "Everyone can play this game. No age restrictions.";
    case RatingType.E:
      return "Everyone can play this game. No age restrictions.";
    case RatingType.E10:
      return "Everyone 10 and older can play this game.";
    case RatingType.T:
      return "Teens 13 and older can play this game.";
    case RatingType.M:
      return "Mature 17 and older can play this game.";
    case RatingType.AO:
      return "Adults only 18 and older can play this game.";
    case RatingType.RP:
      return "Rating Pending";
  }
}

export { getRatingTypeDescription };
