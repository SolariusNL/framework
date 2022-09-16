import { Group, Paper, Stack, Text } from "@mantine/core";
import { User } from "../../util/prisma-types";

interface BadgeProps {
  user: User;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const Badge = ({ user, title, description, icon }: BadgeProps) => (
  <Paper withBorder shadow="md" p={12} radius="md">
    <div
      style={{
        display: "flex",
        gap: "16px",
        width: "100%",
      }}
    >
      <div>{icon}</div>
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

export default Badge;
