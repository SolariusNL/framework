import { Text } from "@mantine/core";
import { FC } from "react";

type GameDataEntryProps = {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
};

const GameDataEntry: FC<GameDataEntryProps> = ({ icon, label, value }) => (
  <div>
    <div className="flex items-center gap-1 mb-1 text-dimmed">
      {icon}
      <Text weight={500} size="sm">
        {label}
      </Text>
    </div>
    {value}
  </div>
);

export default GameDataEntry;
