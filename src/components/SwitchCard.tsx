import { Card, createStyles, Group, Switch, Text } from "@mantine/core";
import ShadedCard from "./ShadedCard";

const useStyles = createStyles((theme) => ({
  card: {
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[6] : theme.white,
  },

  item: {
    "& + &": {
      paddingTop: theme.spacing.md,
      marginTop: theme.spacing.md,
      borderTop: `1px solid ${
        theme.colorScheme === "dark"
          ? theme.colors.dark[4]
          : theme.colors.gray[2]
      }`,
    },
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
}

const SwitchCard: React.FC<SwitchesCardProps> = ({
  title,
  description,
  data,
  onChange,
}) => {
  const { classes } = useStyles();

  const items = data.map((item) => (
    <Group
      position="apart"
      className={classes.item}
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
        onLabel="ON"
        offLabel="OFF"
        className={classes.switch}
        defaultChecked={item.checked || false}
        size="lg"
        onChange={(event) => {
          onChange(event.currentTarget.checked, item.pointer);
        }}
      />
    </Group>
  ));

  return (
    <Card withBorder radius="md" p="lg" className={classes.card}>
      <Text size="lg" className={classes.title} weight={500}>
        {title}
      </Text>
      <Text size="xs" color="dimmed" mt={3} mb="xl">
        {description}
      </Text>
      <ShadedCard>{items}</ShadedCard>
    </Card>
  );
};

export default SwitchCard;
