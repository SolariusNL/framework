import { gamePlatforms } from "@/data/game-platforms";
import { Text } from "@mantine/core";
import { FC } from "react";
import GameDataGroup, { UniversalGroupProps } from "./game-data-group";

const PlatformsGroup: FC<UniversalGroupProps> = ({ game, className }) => {
  return (
    <GameDataGroup label="Platforms" onEdit={() => {}} className={className}>
      {game.supportedPlatforms.map((pl, key) => (
        <div className="flex items-center gap-2" key={key}>
          <div className="text-dimmed flex justify-center flex-shrink-0">
            {gamePlatforms[pl].icon}
          </div>
          <Text>{gamePlatforms[pl].label}</Text>
        </div>
      ))}
    </GameDataGroup>
  );
};

export default PlatformsGroup;
