import { Card, createStyles, Group, Switch, Text } from "@mantine/core";
import useAmoled from "@/stores/useAmoled";
import clsx from "@/util/clsx";
import { AMOLED_COLORS } from "@/util/constants";

const useStyles = createStyles((theme) => ({
  card: {
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.white,
  },

  item: {
    "& + &": {
      marginTop: theme.spacing.md,
    },
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[8]
        : theme.colors.gray[1],
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
  },

  switch: {
    "& *": {
      cursor: "pointer",
    },
  },

  title: {
    lineHeight: 1,
  },
}));

interface SwitchesCardProps {
  title: string;
  description: string;
  data: {
    title: string;
    description: string;
    pointer: string;
    checked?: boolean;
  }[];
  onChange: (value: boolean, pointer: string) => void;
  dark?: boolean;
}

const SwitchCard: React.FC<SwitchesCardProps> = ({
  title,
  description,
  data,
  onChange,
  dark,
}) => {
  const { classes } = useStyles();
  const { enabled: amoled } = useAmoled();

  const items = data.map((item) => (
    <Group
      position="apart"
      className={clsx(classes.item, "bg-transparent")}
      noWrap
      spacing="xl"
      key={item.title}
    >
      <div>
        <Text>{item.title}</Text>
        <Text size="xs" color="dimmed">
          {item.description}
        </Text>
      </div>
      <Switch
        className={classes.switch}
        defaultChecked={item.checked || false}
        onChange={(event) => {
          onChange(event.currentTarget.checked, item.pointer);
        }}
      />
    </Group>
  ));

  return (
    <Card
      radius="md"
      p="lg"
      className={classes.card}
      sx={(theme) => ({
        ...(dark && {
          backgroundColor: amoled
            ? AMOLED_COLORS.paper
            : theme.colorScheme === "dark"
            ? theme.colors.dark[8]
            : theme.colors.gray[0],
        }),
      })}
    >
      <Text size="lg" className={classes.title} weight={500} mb="xs">
        {title}
      </Text>
      <Text size="xs" color="dimmed" mt={3} mb="md">
        {description}
      </Text>
      <Card
        sx={(theme) => ({
          ...(dark && {
            ...(dark && {
              backgroundColor:
                theme.colorScheme === "dark" ? theme.colors.dark[9] : "#FFF",
            }),
          }),
        })}
        p={0}
        className="flex flex-col"
      >
        {items}
      </Card>
    </Card>
  );
};

export default SwitchCard;
