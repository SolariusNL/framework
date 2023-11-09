import TsIcon from "@/icons/TypeScript";
import clsx from "@/util/clsx";
import { rem } from "@/util/rem";
import { Col, Container, Grid, Text, Title, createStyles } from "@mantine/core";
import { Prism } from "@mantine/prism";
import { FC } from "react";

const useStyles = createStyles((theme) => ({
  wrapper: {
    padding: `calc(${theme.spacing.xl} * 2) ${theme.spacing.xl}`,
  },

  title: {
    fontSize: rem(36),
    fontWeight: 900,
    lineHeight: 1.1,
    marginBottom: theme.spacing.md,
  },
}));

const CodeSample: FC = () => {
  const { classes } = useStyles();

  return (
    <Container className={clsx(classes.wrapper, "my-16 py-16 mx-auto")}>
      <Grid gutter={80}>
        <Col span={12} md={5}>
          <Title className={classes.title} order={2}>
            Build your games however you like
          </Title>
          <Text color="dimmed">
            Experience in JavaScript or Lua? You&apos;re already one step ahead.
            Our variety of language bindings makes it easy for anyone to get
            started with their first game.
          </Text>
        </Col>
        <Col span={12} md={7}>
          <Prism.Tabs defaultValue="styles.css">
            <Prism.TabsList>
              <Prism.Tab
                value="server.ts"
                icon={<TsIcon width={16} height={16} />}
              >
                server.ts
              </Prism.Tab>
              <Prism.Tab
                value="server.lua"
                icon={<TsIcon width={16} height={16} />}
              >
                server.lua
              </Prism.Tab>
            </Prism.TabsList>

            <Prism.Panel language="typescript" value="server.ts">
              {"console.log('test');"}
            </Prism.Panel>
            {/** @FIXME add lua language support https://v5.mantine.dev/others/prism/#languages  https://codesandbox.io/s/stupefied-hellman-lfudm?file=/src/App.tsx */}
            <Prism.Panel language="lua" value="server.lua">
              {"print('hellow world');"}
            </Prism.Panel>
          </Prism.Tabs>
        </Col>
      </Grid>
    </Container>
  );
};

export default CodeSample;
