import { ActionIcon, Center, Paper, RingProgress, Text } from "@mantine/core";
import { FC } from "react";

type GameStatCardState = "increased" | "decreased" | "neutral";
type GameStatCardProps = {
  value?: number;
  formattedValue: string;
  title: string;
  icon: React.ReactNode;
  tertiaryLabel?: string;
  state?: GameStatCardState;
};

const GameStatCard: FC<GameStatCardProps> = ({
  value,
  formattedValue,
  title,
  icon,
  tertiaryLabel,
  state = "neutral",
}) => (
  <Paper withBorder p="xs">
    <div className="flex items-center gap-3">
      {value ? (
        <RingProgress
          size={80}
          roundCaps
          thickness={8}
          sections={[
            {
              value,
              color: "blue",
            },
          ]}
          label={<Center>{icon}</Center>}
        />
      ) : (
        <div className="w-[80px] h-[80px] flex justify-center items-center">
          <ActionIcon
            size={56}
            variant="light"
            color={
              state === "neutral"
                ? "gray"
                : state === "increased"
                ? "green"
                : "red"
            }
            className="rounded-full"
          >
            {icon}
          </ActionIcon>
        </div>
      )}

      <div>
        <Text color="dimmed" size="xs" transform="uppercase" weight={700}>
          {title}
        </Text>
        <Text weight={700} size="xl">
          {formattedValue}
        </Text>
        {tertiaryLabel && (
          <Text color="dimmed" size="xs" mt={4}>
            {tertiaryLabel}
          </Text>
        )}
      </div>
    </div>
  </Paper>
);

export default GameStatCard;
