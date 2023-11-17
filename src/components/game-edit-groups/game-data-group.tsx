import { EditableGame } from "@/layouts/edit-game-layout";
import clsx from "@/util/clsx";
import { Button, Text } from "@mantine/core";
import { FC } from "react";
import { HiArrowsExpand } from "react-icons/hi";

type GameDataGroupProps = {
  label: string;
  onEdit: () => void;
  children: React.ReactNode;
  className?: string;
};
export type UniversalGroupProps = {
  game: EditableGame;
  className?: string;
};

const GameDataGroup: FC<GameDataGroupProps> = ({
  label,
  onEdit,
  children,
  className,
}) => {
  return (
    <div className={clsx("flex flex-col gap-2", className)}>
      <Text size="sm" color="dimmed" weight={600}>
        {label}
      </Text>
      {children}
      <Button
        variant="subtle"
        size="sm"
        className="w-fit"
        mt="xs"
        leftIcon={<HiArrowsExpand />}
      >
        Edit {label}
      </Button>
    </div>
  );
};

export default GameDataGroup;
