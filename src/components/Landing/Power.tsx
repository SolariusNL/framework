import { Col, createStyles, Grid, Text, Title } from "@mantine/core";
import { Prism } from "@mantine/prism";

const useStyles = createStyles((theme) => ({
  wrapper: {
    padding: `${theme.spacing.xl * 2}px ${theme.spacing.xl}px`,
  },

  title: {
    fontFamily: `Inter, ${theme.fontFamily}`,
    fontSize: 36,
    fontWeight: 900,
    lineHeight: 1.1,
    marginBottom: theme.spacing.md,
    color: theme.colorScheme === "dark" ? theme.white[5] : theme.black[5],
  },
}));

const Power = () => {
  const { classes, cx, theme } = useStyles();
  const examplecode = `
import Players from "@framework/services/players";

Players.on("playerJoin", (plr) => {
  plr.getWorld().sendMessage(String.format("%s has joined the server!", plr.getName()));
      
  plr.on("beforeDisconnect", () => {
    plr.getWorld().sendMessage(String.format("%s has left the server!", plr.getName()));
  });
});
  `.trim();

  return (
    <div className={classes.wrapper}>
      <Grid gutter={80}>
        <Col span={12} md={7}>
          <Prism language="typescript">{examplecode}</Prism>
        </Col>
        <Col span={12} md={5}>
          <Title className={classes.title} order={2}>
            Power to the players
          </Title>
          <Text color="dimmed">
            Framework is an open platform built on modern technologies that
            integrate seamlessly with your existing workflow. Building your
            first game is as easy as it gets.
          </Text>
        </Col>
      </Grid>
    </div>
  );
};

export default Power;
