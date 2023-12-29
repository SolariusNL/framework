import clsx from "@/util/clsx";
import { NonUser } from "@/util/prisma-types";
import { MantineColor, Paper, Text, useMantineTheme } from "@mantine/core";
import { openModal } from "@mantine/modals";

type BadgeProps = {
  title: string;
  description: string;
  icon: React.FC<{ color: MantineColor; size: number }> | React.ReactElement;
  color: MantineColor;
};
export type BaseBadgeProps = {
  user: NonUser;
};

const Badge = ({ title, description, icon: Icon, color }: BadgeProps) => {
  const { colors } = useMantineTheme();
  return (
    <Paper
      withBorder
      p="xs"
      radius="md"
      sx={(theme) => ({
        border: `1px solid 10`,
        background: "transparent",
        cursor: "pointer",
        "&:hover": {
          backgroundColor:
            theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[1],
        },
      })}
      onClick={() => {
        openModal({
          title,
          children: (
            <Text size="sm" color="dimmed">
              {description}
            </Text>
          ),
        });
      }}
      className={clsx("transform transition-all duration-200", "flex-grow")}
    >
      <div className="flex items-center gap-2">
        {typeof Icon === "function" ? (
          <Icon color={colors[color][5]} size={24} />
        ) : (
          Icon
        )}
        <Text weight={500}>{title}</Text>
      </div>
    </Paper>
  );
};

export default Badge;
