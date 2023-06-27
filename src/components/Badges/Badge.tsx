import { MantineColor, Paper, Text, useMantineTheme } from "@mantine/core";
import { openModal } from "@mantine/modals";
import clsx from "@/util/clsx";
import { User } from "@/util/prisma-types";

interface BadgeProps {
  user: User;
  title: string;
  description: string;
  icon: React.FC<{ color: MantineColor; size: number }>;
  color: MantineColor;
}

const Badge = ({ user, title, description, icon: Icon, color }: BadgeProps) => {
  const { colors } = useMantineTheme();
  return (
    <Paper
      withBorder
      p="xs"
      radius="md"
      sx={() => ({
        border: `1px solid ${colors[color][5]}`,
        background: "transparent",
        cursor: "pointer",
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
      className={clsx(
        "dark:hover:bg-zinc-900 hover:bg-gray-100 transform transition-all duration-200"
      )}
    >
      <div className="flex items-center gap-2">
        <Icon color={colors[color][5]} size={24} />
        <Text weight={500}>{title}</Text>
      </div>
    </Paper>
  );
};

export default Badge;
