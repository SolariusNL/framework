import { CloseButton, Paper, Text } from "@mantine/core";
import React from "react";
import clsx from "../util/clsx";

type FilterIndicatorProps = {
  onClick: () => void;
  text: string;
  className?: string;
};

const FilterIndicator: React.FC<FilterIndicatorProps> = ({
  onClick,
  text,
  className,
}) => {
  const paperClassName = clsx(
    "flex rounded-full w-fit items-center gap-2 p-1 pr-4 px-2 dark:bg-mantine-paper-dark bg-gray-100 dark:hover:bg-mantine-paper-dark/50 hover:bg-gray-200 cursor-pointer transition-all",
    className
  );

  return (
    <Paper className={paperClassName} onClick={onClick}>
      <CloseButton
        size="sm"
        className="text-dimmed transition-all"
        radius="xl"
      />
      <Text size="sm" weight={500} color="dimmed">
        {text}
      </Text>
    </Paper>
  );
};

export default FilterIndicator;
