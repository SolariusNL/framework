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
  const codeExamples = [
    [
      "Greeting",
      `import { players, chat } from "@frameworkts/services";
players.on("join", ({ username }) => {
  chat.broadcast(\`Welcome to the server, \${username}!\`);
});`,
    ],
    [
      "Tools",
      `import { tool, interactable, part } from "@frameworkts/services";
import Tools from "@frameworkts/tools";
import { getOreTool } from "./ores";

const pickaxe = new Tools.Held("pickaxe-tool", {
  cooldown: 0.5,
  onUse: (plr, pickaxe, target) => {
    if (part.hasTag(target, "minable")) {
      const { ore } = part.getMetadata(target);
      plr.inventory.add(getOreTool(ore), 1);
    }
  },
  durability: {
    max: 100,
    current: 100,
    type: Tools.DurabilityType.USES,
  }
);

tool.registerGlobal(pickaxe);`,
    ],
  ];

  return (
    <div className={classes.wrapper}>
      <Grid gutter={80}>
        <Col span={12} md={7}>
          <Prism.Tabs defaultValue={codeExamples[0][0]}>
            <Prism.TabsList>
              {codeExamples.map(([name], index) => (
                <Prism.Tab key={index} value={name}>
                  {name}
                </Prism.Tab>
              ))}
            </Prism.TabsList>

            {codeExamples.map(([name, code], index) => (
              <Prism.Panel key={index} value={name} language="tsx">
                {code}
              </Prism.Panel>
            ))}
          </Prism.Tabs>
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
