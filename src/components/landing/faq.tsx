import clsx from "@/util/clsx";
import { Accordion, Col, createStyles, Grid, Text, Title } from "@mantine/core";

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

const Faq: React.FC = () => {
  const { classes } = useStyles();

  return (
    <div
      className={clsx(classes.wrapper, "bg-black bg-opacity-50")}
      style={{
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      <Grid gutter={80}>
        <Col span={12} md={7}>
          <Accordion>
            <Accordion.Item value="different">
              <Accordion.Control>
                What is this site and how is it different from Roblox?
              </Accordion.Control>
              <Accordion.Panel>
                Framework is free and open source, licensed under the MIT
                license. We don&apos;t track you, we don&apos;t implement any
                analytics or ads, we don&apos;t sell your data, and we
                don&apos;t rely on third-party services that we haven&apos;t
                audited. We also prioritize privacy, liberty, and freedom above
                all else. Additionally, Framework offers many features that
                Roblox doesn&apos;t, such as the ability to self-host your games
                and services, and the ability to use any client you want to
                connect to our servers.
              </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value="open-source">
              <Accordion.Control>
                Is the site truly open-source and free to use?
              </Accordion.Control>
              <Accordion.Panel>
                Yes, the site and all of its components are open-source and free
                to use. You can find the source code on our GitHub page.
              </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value="decentralized">
              <Accordion.Control>
                How does the decentralized nature of the site affect my
                experience?
              </Accordion.Control>
              <Accordion.Panel>
                The decentralized nature of the site means that Framework is not
                controlled by a single entity. This gives you more freedom and
                control over your experience, and allows you to choose which
                instance you wish to be apart of.
              </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value="censorship">
              <Accordion.Control>
                How is censorship being handled on the platform?
              </Accordion.Control>
              <Accordion.Panel>
                We do not allow any form of censorship on the platform. We
                believe that censorship is a violation of human rights, and that
                it is the responsibility of the community to police itself. But,
                it is important to note that freedom of speech is not absolute,
                and that there are limits to what is acceptable, as outlined in
                our Community Guidelines.
              </Accordion.Panel>
            </Accordion.Item>
            <Accordion.Item value="monetization">
              <Accordion.Control>
                Is there a way to monetize my creations on the site?
              </Accordion.Control>
              <Accordion.Panel>
                Yes, you can monetize your creations on the site by using our
                built-in monetization system. You can also use any third-party
                monetization system you want, such as AdSense, because you have
                full control over your creations.
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </Col>
        <Col span={12} md={5}>
          <Title className={classes.title} order={2}>
            Frequently Asked Questions
          </Title>
          <Text color="dimmed">
            Here are some common questions about Framework. If you have any
            other questions, feel free to ask them in our Revolt server, or
            contact our team directly.
          </Text>
        </Col>
      </Grid>
    </div>
  );
};

export default Faq;
