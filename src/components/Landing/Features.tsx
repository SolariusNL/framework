import { Col, createStyles, Grid, Text, Title } from "@mantine/core";
import { HiCheckCircle } from "react-icons/hi";
import clsx from "../../util/clsx";

const useStyles = createStyles((theme) => ({
  wrapper: {
    padding: `${theme.spacing.xl * 2}px ${theme.spacing.xl}px`,
    backgroundColor:
      theme.colorScheme === "dark" ? "#000" : theme.colors.gray[1],
    borderRadius: theme.radius.md,
  },

  title: {
    fontFamily: `Inter, ${theme.fontFamily}`,
    fontSize: 36,
    lineHeight: 1.1,
    marginBottom: theme.spacing.md,
    color: theme.colorScheme === "dark" ? theme.white[5] : theme.black[5],
  },
}));

const features = [
  {
    title: "Plugin ecosystem",
    description:
      "Developing on Framework is made easy with our diverse plugin ecosystem. Plugins can be used to automate some tedious tasks, create boilerplate code, and more.",
  },
  {
    title: "Free and open source",
    description:
      "Framework is free and open source, licensed under the MIT license. Framework is developed by ordinary people around the world, and you can contribute too!",
  },
  {
    title: "Privacy first",
    description:
      "Framework puts your privacy and liberty first. We don't track you, we don't implement any analytics or ads, we don't sell your data, and we don't rely on third-party services that we haven't audited.",
  },
  {
    title: "Self-hosting",
    description:
      "Games and other services are self-hosted on your own server, giving you freedom and control over your content. You can also, optionally, use our dedicated hosting service.",
  },
  {
    title: "Safe community",
    description:
      "Our staff is committed to providing a safe and friendly community for everyone to enjoy. We have a zero-tolerance policy for harassment, and we will ban anyone who violates our rules.",
  },
  {
    title: "Fediverse",
    description:
      "Framework is built on top of the ActivityPub protocol, which means that you don't have to rely on our servers in order to stay online and connected with your friends. Framework is a federated service, which means that content is regulated by the community, and not solely by us.",
  },
  {
    title: "Open standards",
    description:
      "Framework is built on top of open standards, which means that you can use any client you want to connect to our servers that implements the ActivityPub protocol tailored to Framework.",
  },
  {
    title: "Extensible",
    description:
      "Framework is built on top of a modular architecture, which means that you can extend it with your own plugins and services. You can also use our plugin ecosystem to extend Framework with plugins made by other people.",
  },
];

const Features = () => {
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
        <Col span={12} md={5}>
          <Title className={classes.title} order={2}>
            Features
          </Title>
          <Text color="dimmed">
            What makes Framework different from other platforms, like Roblox?
          </Text>
        </Col>
        <Col span={12} md={7}>
          <div className="grid md:grid-cols-2 gap-6 grid-cols-1">
            {features.map((feature) => (
              <div className="flex items-start" key={feature.title}>
                <div className="hidden md:block">
                  <HiCheckCircle className="text-pink-400 mr-6 w-8 h-8" />
                </div>
                <div className="flex flex-col gap-2">
                  <Title order={5}>{feature.title}</Title>
                  <Text size="sm" color="dimmed">
                    {feature.description}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        </Col>
      </Grid>
    </div>
  );
};

export default Features;
