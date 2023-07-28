import { Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { HiXCircle } from "react-icons/hi";

interface ModernEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  body: string;
  shaded?: boolean;
}

const ModernEmptyState = ({
  icon,
  title,
  body,
  shaded,
}: ModernEmptyStateProps) => {
  return (
    <Stack
      p={32}
      sx={(theme) => ({
        ...(shaded && {
          backgroundColor:
            theme.colorScheme === "dark"
              ? theme.colors.dark[9]
              : theme.colors.gray[1],
          borderRadius: theme.radius.md,
        }),
      })}
    >
      <div style={{ textAlign: "center" }}>
        {icon || <HiXCircle size={28} />}
        <Title order={4} mb={4} mt={12}>
          {title}
        </Title>
        <Text color="dimmed" size="sm">
          {body}
        </Text>
      </div>
    </Stack>
  );
};

export default ModernEmptyState;
