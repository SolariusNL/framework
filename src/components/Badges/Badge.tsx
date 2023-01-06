import {
  Group,
  MantineColor,
  Paper,
  Stack,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { User } from "../../util/prisma-types";

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
      shadow="md"
      p={12}
      radius="md"
      sx={(theme) => ({
        backgroundColor:
          theme.colorScheme === "dark"
            ? theme.colors.dark[9]
            : theme.colors.gray[0],
        border: `1px solid ${colors[color][5]}`,
      })}
    >
      <div
        style={{
          display: "flex",
          gap: "16px",
          width: "100%",
        }}
      >
        <div>
            <Icon color={colors[color][5]} size={24} />
        </div>
        <Group>
          <Stack spacing={3}>
            <Text weight={500} size="lg">
              {title}
            </Text>
            <Text size="sm" color="dimmed">
              {description}
            </Text>
          </Stack>
        </Group>
      </div>
    </Paper>
  );
};

export default Badge;
