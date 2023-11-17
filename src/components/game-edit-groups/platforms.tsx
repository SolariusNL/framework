import { gamePlatforms } from "@/data/game-platforms";
import { Text } from "@mantine/core";
import { FC } from "react";
import GameDataGroup, { UniversalGroupProps } from "./game-data-group";

const PlatformsGroup: FC<UniversalGroupProps> = ({ game, className }) => {
  return (
    <GameDataGroup label="Platforms" onEdit={() => {}} className={className}>
      {Object.entries(gamePlatforms).map(([key, value]) => {
        return (
          <div className="flex items-center gap-2" key={key}>
            <div className="text-dimmed flex justify-center">{value.icon}</div>
            <Text>{value.label}</Text>
          </div>
        );
      })}
    </GameDataGroup>
  );
};

export default PlatformsGroup;
