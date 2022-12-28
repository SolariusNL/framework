import { Card, Stack, Text } from "@mantine/core";

interface Grouped {
  title: string;
  children: React.ReactNode;
}

const Grouped = ({ title, children }: Grouped) => {
  return (
    <Card withBorder shadow="sm" sx={{ overflow: "visible" }}>
      <Text weight={750} color="dimmed" mb={16}>
        {title}
      </Text>

      <Stack>{children}</Stack>
    </Card>
  );
};

export default Grouped;
