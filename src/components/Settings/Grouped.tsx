import { Card, Stack, Text } from "@mantine/core";

interface Grouped {
  title: string;
  children: React.ReactNode;
  dark?: boolean;
}

const Grouped = ({ title, children, dark }: Grouped) => {
  return (
    <Card
      withBorder
      shadow="sm"
      sx={(theme) => ({
        overflow: "visible",
        ...(dark && {
          backgroundColor:
            theme.colorScheme === "dark"
              ? theme.colors.dark[9]
              : theme.colors.light,
        }),
      })}
    >
      <Text weight={750} color="dimmed" mb={16}>
        {title}
      </Text>

      <Stack>{children}</Stack>
    </Card>
  );
};

export default Grouped;
