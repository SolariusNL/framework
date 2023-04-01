import { Col, createStyles, Grid, Text, Title } from "@mantine/core";
import { Prism } from "@mantine/prism";

const useStyles = createStyles((theme) => ({
  wrapper: {
    padding: `${theme.spacing.xl * 2}px ${theme.spacing.xl}px`,
  },

  title: {
    fontFamily: `Inter, ${theme.fontFamily}`,
    fontSize: 36,
    lineHeight: 1.1,
    marginBottom: theme.spacing.md,
    color: theme.colorScheme === "dark" ? theme.white[5] : theme.black[5],
  },
}));

const Power = () => {
  const { classes } = useStyles();

  return (
    <div className={classes.wrapper}>
      <Grid gutter={80}>
        <Col span={12} md={7}>
          <Prism language="typescript">
            {`import { datastore, players } from "@frameworkts/services";
import type { DatastoreBase } from "@frameworkts/services/datastore";
const master = datastore.createMaster<{
  xp: number;
  gold: number;
} extends DatastoreBase<infer T> ? T : never>("master", {
  initialData: {
    xp: 0,
    gold: 50,
  },
  onSet: (key, value) => {
    console.log(\`Set \${key} to \${value}\`);
  },
  onGet: (key, value) => {
    console.log(\`Got \${key} as \${value}\`);
  },
  onRemove: (key) => {
    console.log(\`Removed \${key}\`);
  },
}).factory().getClient();

const plrDs = master.createBucket("player", master.types.default);

players.on("exit", async (plr) => {
  await plrDs.saveAsync({
    xp: plr.getTag<number>("xp"),
    gold: plr.getTag<number>("gold"),
  });
});
      `}
          </Prism>
        </Col>
        <Col span={12} md={5}>
          <Title className={classes.title} order={2}>
            Power at your fingertips
          </Title>
          <Text color="dimmed">
            Framework unlocks creativity, freedom, and imagination. This is
            achieved by our use and consistent support of modern technologies
            such as TypeScript, React, and Node.js. Our powerful tools empower
            people like you to create stunning experiences without the hassle.
          </Text>
        </Col>
      </Grid>
    </div>
  );
};

export default Power;
