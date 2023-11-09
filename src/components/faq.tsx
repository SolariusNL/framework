import { rem } from "@/util/rem";
import {
  Accordion,
  Anchor,
  Container,
  Title,
  createStyles,
} from "@mantine/core";
import { FC } from "react";

const useStyles = createStyles((theme) => ({
  wrapper: {
    paddingTop: `calc(${theme.spacing.xl} * 4)`,
    paddingBottom: `calc(${theme.spacing.xl} * 4)`,
  },
  item: {
    border: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[3]
    }`,
    "&:hover": {
      borderColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[4]
          : theme.colors.gray[5],
    },
  },
}));

const Faq: FC = () => {
  const { classes } = useStyles();
  return (
    <Container size="sm" className={classes.wrapper}>
      <Title align="center" className="mb-12">
        Frequently Asked Questions
      </Title>

      <Accordion variant="separated">
        <Accordion.Item className={classes.item} value="reset-password">
          <Accordion.Control>How can I join?</Accordion.Control>
          <Accordion.Panel>
            At this time, Framework is in a closed, invite-only period. You can
            request an invite code by{" "}
            <Anchor href="mailto:invite@solarius.me">reaching out to us</Anchor>{" "}
            at our email address.
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item className={classes.item} value="another-account">
          <Accordion.Control>
            How can I contribute to the project?
          </Accordion.Control>
          <Accordion.Panel>
            Framework is an open-source project. You can contribute to the
            project by visiting our{" "}
            <Anchor href="https://github.com/SolariusNL/framework">
              GitHub
            </Anchor>{" "}
            page.
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item className={classes.item} value="newsletter">
          <Accordion.Control>
            What is the difference between Framework and Roblox?
          </Accordion.Control>
          <Accordion.Panel>
            We are very similar in the sense that we are both game platforms
            with a focus on user-generated content. Framework is different in
            the sense that we are open-source, community-driven, and free. We
            also have a focus on privacy and safety.
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item className={classes.item} value="credit-card">
          <Accordion.Control>How does Solarius make money?</Accordion.Control>
          <Accordion.Panel>
            Framework has an on-platform currency called Tickets. Tickets can be
            used to purchase in-game items, and can be purchased with real
            money. We also have a premium subscription called Framework Premium,
            which grants you access to exclusive features.
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item className={classes.item} value="payment">
          <Accordion.Control>What's your technology stack?</Accordion.Control>
          <Accordion.Panel>
            Framework is built with Next.js, React, and TypeScript on our web
            app. Our backend is a mix between Next.js's API routes and Rust to
            power the website, server logistics, and many other functionalities.
            <br />
            <br />
            We use PostgreSQL as our database, and Redis for caching. We also
            use a variety of other technologies, such as Docker, Kubernetes, and
            MinIO.
            <br />
            <br />
            On our client stack, we use TypeScript, Rust and Lua to power the
            engine, Vortex, and the client.
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Container>
  );
};

export default Faq;
