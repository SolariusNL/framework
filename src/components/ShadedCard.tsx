import { Card, CardProps, Text } from "@mantine/core";

const ShadedCard = (
  props: CardProps & {
    children: React.ReactNode;
    title?: string;
    titleWithBorder?: boolean;
    onClick?: () => void;
    // @deprecated
    solid?: boolean;
  }
) => {
  return (
    <Card
      sx={(theme) => ({
        backgroundColor:
          theme.colorScheme === "dark"
            ? theme.colors.dark[9]
            : theme.colors.gray[0],
        overflow: "visible",
      })}
      {...props}
    >
      {props.title && (
        <Card.Section
          inheritPadding
          py="xs"
          mb={16}
          withBorder={props.titleWithBorder}
        >
          <Text color="dimmed" weight={700} size="sm">
            {props.title}
          </Text>
        </Card.Section>
      )}
      {props.children}
    </Card>
  );
};

export default ShadedCard;
