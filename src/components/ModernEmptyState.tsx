import { Center, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { HiXCircle } from "react-icons/hi";

interface ModernEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  body: string;
}

const ModernEmptyState = ({ icon, title, body }: ModernEmptyStateProps) => {
  return (
    <Stack p={32}>
      <div style={{ textAlign: "center" }}>
        <ThemeIcon
          sx={{
            border: "1px solid",
            borderColor: "gray",
          }}
          mb={12}
          /**
           * Variant can include default for
           * some reason its a type error
           */
          /** @ts-ignore */
          variant="default"
        >
          {icon || <HiXCircle />}
        </ThemeIcon>
        <Title order={4} mb={4}>
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
