import { FC } from "react";
import {
  HiOutlineFolderDownload,
  HiOutlineServer,
  HiShieldCheck
} from "react-icons/hi";
import GameDataEntry from "../game-data-entry";
import GameDataGroup, { UniversalGroupProps } from "./game-data-group";

const UpdateDeploymentGroup: FC<UniversalGroupProps> = ({
  game,
  className,
}) => {
  return (
    <GameDataGroup
      label="Update deployment"
      onEdit={() => {}}
      className={className}
    >
      <div className="grid md:grid-cols-2 gap-2 grid-cols-1">
        <GameDataEntry
          label="Restart all servers"
          icon={<HiOutlineServer />}
          value={game.restartOnUpdate ? "Enabled" : "Disabled"}
        />
        <GameDataEntry
          label="Enforce latest version"
          icon={<HiShieldCheck />}
          value={game.enforceLatestVersion ? "Enabled" : "Disabled"}
        />
        <GameDataEntry
          label="Attempt live update"
          icon={<HiOutlineFolderDownload />}
          value={game.attemptLiveUpdates ? "Enabled" : "Disabled"}
        />
      </div>
    </GameDataGroup>
  );
};

export default UpdateDeploymentGroup;
