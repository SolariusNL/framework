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

const code = {
  "data.ts": `"use client";

import { LocalStorageBuilder } from "@fw/localstorage";

const storage = new LocalStorageBuilder()
  .addTable(
    "saves",
    ...
  )
  .build();

storage.tables.saves.insert({
  name: "My Save",
  date: new Date(),
  level: 1,
});

export default storage;`,
};

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
            Unbelievably flexible and easy to use, Framework is the perfect
            solution for any game project. Whether you're a solo developer or a
            100-person team, Framework is the best choice.
          </Text>
        </Col>
        <Col span={12} md={7}>
          <Prism.Tabs defaultValue="data.ts">
            <Prism.TabsList>
              <Prism.Tab
                value="data.ts"
                icon={<TsIcon width={16} height={16} />}
              >
                data.ts
              </Prism.Tab>
            </Prism.TabsList>
            <Prism.Panel language="typescript" value="data.ts" withLineNumbers>
              {code["data.ts"]}
            </Prism.Panel>
          </Prism.Tabs>
        </Col>
      </Grid>
    </Container>
  );
};

export default CodeSample;
