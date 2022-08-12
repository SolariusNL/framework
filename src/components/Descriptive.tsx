import { Group, Stack, Text } from "@mantine/core";

interface DescriptiveProps {
  children: React.ReactNode;
  title: string;
  description: string;
  required?: boolean;
}

const Descriptive = ({
  children,
  title,
  description,
  required = false,
}: DescriptiveProps) => {
  return (
    <Stack spacing={7}>
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
