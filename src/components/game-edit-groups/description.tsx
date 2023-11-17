import { Text } from "@mantine/core";
import { FC } from "react";
import GameDataGroup, { UniversalGroupProps } from "./game-data-group";

const DescriptionGroup: FC<UniversalGroupProps> = ({ game, className }) => {
  return (
    <GameDataGroup label="Description" onEdit={() => {}} className={className}>
      <Text>
        This is a sample game description! Lorem ipsum dolor sit amet,
        consectetur adipiscing elit. Quisque euismod, nisl eu lacinia
        scelerisque, tellus velit tincidunt odio, quis vestibulum nunc dolor!
      </Text>
    </GameDataGroup>
  );
};

export default DescriptionGroup;
