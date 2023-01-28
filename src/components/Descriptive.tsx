import { Group, Stack, Text } from "@mantine/core";

interface DescriptiveProps {
  children: React.ReactNode;
  title: string;
  description: string;
  required?: boolean;
  className?: string;
}

const Descriptive = ({
  children,
  title,
  description,
  required = false,
  className,
}: DescriptiveProps) => {
  return (
    <Stack spacing={7} className={className}>
      <Stack spacing={0}>
        <Group spacing={3}>
          <Text size="sm" weight={500}>
            {title}
          </Text>
          {required && (
            <Text size="sm" color="red">
              *
            </Text>
          )}
        </Group>
        <Text size="xs" color="dimmed">
          {description}
        </Text>
      </Stack>
      {children}
    </Stack>
  );
};

export default Descriptive;
