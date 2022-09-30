import { Center, Group, Text } from "@mantine/core";
import { HiExclamationCircle } from "react-icons/hi";

interface EmptyStateProps {
  title: string;
  body: string;
  action?: any;
}

/**
 * @deprecated
 * Use ModernEmptyState instead
 */
const EmptyState = ({ title, body, action }: EmptyStateProps) => {
  return (
    <Center p={32}>
      <Group>
        <HiExclamationCircle
          style={{
            marginBottom: "auto",
          }}
          size={32}
        />
        <Text size="lg" weight={550}>
          {title}
          <br />
          <Text weight={400}>{body}</Text>
          {action && (
            <>
              <br />
              {action}
            </>
          )}
        </Text>
      </Group>
    </Center>
  );
};

export default EmptyState;
