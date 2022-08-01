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
    <Stack spacing={12}>
      {icon}
      <Stack spacing={3}>
        <Text weight={500} size="lg">
          {title}
        </Text>
        <Text size="sm" color="dimmed">
          {description}
        </Text>
      </Stack>
    </Stack>
  </Paper>
);

export default Badge;
