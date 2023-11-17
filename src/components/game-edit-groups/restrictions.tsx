import { FC } from "react";
import {
  HiOutlineChatAlt,
  HiOutlineIdentification,
  HiOutlineShieldExclamation
} from "react-icons/hi";
import GameDataEntry from "../game-data-entry";
import GameDataGroup, { UniversalGroupProps } from "./game-data-group";

const RestrictionsGroup: FC<UniversalGroupProps> = ({ game, className }) => {
  return (
    <GameDataGroup label="Restrictions" onEdit={() => {}} className={className}>
      <div className="flex flex-col gap-2">
        <GameDataEntry
          label="Minimum account age"
          icon={<HiOutlineIdentification />}
          value={
            game.requiredAccountAge === 0
              ? "No restriction"
              : game.requiredAccountAge.toString() + " days"
          }
        />
        <GameDataEntry
          label="Parental controls"
          icon={<HiOutlineShieldExclamation />}
          value={game.hasParentalControls ? "Enabled" : "Disabled"}
        />
        <GameDataEntry
          label="Chat filter"
          icon={<HiOutlineChatAlt />}
          value={game.chatFilterEnabled ? "Enabled" : "Disabled"}
        />
      </div>
    </GameDataGroup>
  );
};

export default RestrictionsGroup;
