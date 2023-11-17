import { contentWarnings } from "@/data/content-warnings";
import { Text } from "@mantine/core";
import { FC } from "react";
import { HiOutlineShieldExclamation } from "react-icons/hi";
import GameDataGroup, { UniversalGroupProps } from "./game-data-group";

const ContentWarningsGroup: FC<UniversalGroupProps> = ({ game, className }) => {
  return (
    <GameDataGroup
      label="Content warnings"
      onEdit={() => {}}
      className={className}
    >
      {game.contentWarnings.length > 0 ? (
        game.contentWarnings.map((cw, key) => (
          <div className="flex items-center gap-2" key={key}>
            <HiOutlineShieldExclamation className="text-dimmed flex-shrink-0" />
            <Text>{contentWarnings[cw]}</Text>
          </div>
        ))
      ) : (
        <div className="flex items-center gap-2">
          <HiOutlineShieldExclamation className="text-dimmed flex-shrink-0" />
          <Text>No content warnings defined</Text>
        </div>
      )}
    </GameDataGroup>
  );
};

export default ContentWarningsGroup;
