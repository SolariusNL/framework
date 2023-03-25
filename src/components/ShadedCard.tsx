import { Card, CardProps, Text } from "@mantine/core";
import useAmoled from "../stores/useAmoled";
import { AMOLED_COLORS } from "../util/constants";

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
  const { enabled: amoled } = useAmoled();

  return (
    <Card
      sx={(theme) => ({
        backgroundColor:
          theme.colorScheme === "dark"
            ? amoled
              ? AMOLED_COLORS.paper
              : theme.colors.dark[9]
            : theme.colors.gray[0],
        overflow: "visible",
      })}
      withBorder
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
