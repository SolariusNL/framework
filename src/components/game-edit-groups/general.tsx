import { getGenreText } from "@/util/universe/genre";
import { RatingType } from "@prisma/client";
import { FC } from "react";
import {
  HiOutlineShieldCheck,
  HiOutlineStatusOnline,
  HiOutlineTag,
  HiOutlineTicket,
  HiOutlineUserGroup,
} from "react-icons/hi";
import GameDataEntry from "../game-data-entry";
import GameDataGroup, { UniversalGroupProps } from "./game-data-group";

const GeneralGroup: FC<UniversalGroupProps> = ({ game, className }) => {
  return (
    <GameDataGroup label="General" onEdit={() => {}} className={className}>
      <div className="grid md:grid-cols-2 gap-2 grid-cols-1">
        <GameDataEntry
          label="Max players"
          icon={<HiOutlineUserGroup />}
          value={game.maxPlayersPerSession.toString()}
        />
        <GameDataEntry
          label="Genre"
          icon={<HiOutlineTag />}
          value={getGenreText(game.genre)}
        />
        <GameDataEntry
          label="Age rating"
          icon={<HiOutlineStatusOnline />}
          value={game.rating?.type ?? RatingType.RP}
        />
        <GameDataEntry
          label="Paid access"
          icon={<HiOutlineShieldCheck />}
          value={game.paywall ? "Yes" : "No"}
        />
        <GameDataEntry
          label="Entry price"
          icon={<HiOutlineTicket />}
          value={game.paywall ? `${game.paywallPrice}T$` : "Free"}
        />
      </div>
    </GameDataGroup>
  );
};

export default GeneralGroup;
