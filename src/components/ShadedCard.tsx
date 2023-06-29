import useAmoled from "@/stores/useAmoled";
import { AMOLED_COLORS } from "@/util/constants";
import { Card, CardProps, Text } from "@mantine/core";

const ShadedCard = (
  props: CardProps & {
    children: React.ReactNode;
    title?: string;
    titleWithBorder?: boolean;
    onClick?: () => void;
    // @deprecated
    solid?: boolean;
    black?: boolean;
  }
) => {
  const { enabled: amoled } = useAmoled();

  return (
    <Card
      sx={(theme) => ({
        backgroundColor:
          theme.colorScheme === "dark"
            ? props.black
              ? "#000000"
              : amoled
              ? AMOLED_COLORS.paper
              : theme.colors.dark[9]
            : props.black
            ? "#FFF"
            : theme.colors.gray[0] + "80",
        overflow: "visible",
      })}
      radius="md"
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
