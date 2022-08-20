import {
  createStyles,
  Title,
  SimpleGrid,
  Text,
  Button,
  ThemeIcon,
  Grid,
  Col,
} from "@mantine/core";
import Link from "next/link";
import { HiEyeOff, HiLockOpen, HiServer, HiXCircle } from "react-icons/hi";

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

const features = [
  {
    icon: HiLockOpen,
    title: "Free and open source",
    description:
      "Framework is free and open source, licensed under the MIT license. Framework is developed by ordinary people around the world!",
  },
  {
    icon: HiEyeOff,
    title: "Privacy and security",
    description:
      "Framework is built on top of the most secure and secure technologies available today. We use the latest web technologies to protect your data.",
  },
  {
    icon: HiXCircle,
    title: "Safe community",
    description:
      "Our staff is committed to providing a safe and friendly community for everyone to enjoy.",
  },
  {
    icon: HiServer,
    title: "Self-hosting",
    description:
      "Games and other services are self-hosted on your own server, giving you freedom and control over your content.",
  },
];

const Features = () => {
  const { classes } = useStyles();

  const items = features.map((feature) => (
    <div key={feature.title}>
      <ThemeIcon
        size={44}
        radius="md"
        variant="gradient"
        gradient={{ deg: 133, from: "blue", to: "cyan" }}
      >
        <feature.icon size={26} stroke={"1.5"} />
      </ThemeIcon>
      <Text size="lg" mt="sm" weight={500}>
        {feature.title}
      </Text>
      <Text color="dimmed" size="sm">
        {feature.description}
      </Text>
    </div>
  ));

  return (
    <div className={classes.wrapper}>
      <Grid gutter={80}>
        <Col span={12} md={5}>
          <Title className={classes.title} order={2}>
            Pros of using Framework
          </Title>
          <Text color="dimmed">
            Framework unlocks creativity, freedom, and imagination. Our powerful
            tools empower people like you to create stunning experiences.
          </Text>

          <Link href="/register" passHref>
            <Button
              variant="gradient"
              gradient={{ deg: 133, from: "blue", to: "cyan" }}
              size="lg"
              radius="md"
              mt="xl"
              component="a"
            >
              Get started
            </Button>
          </Link>
        </Col>
        <Col span={12} md={7}>
          <SimpleGrid
            cols={2}
            spacing={30}
            breakpoints={[{ maxWidth: "md", cols: 1 }]}
          >
            {items}
          </SimpleGrid>
        </Col>
      </Grid>
    </div>
  );
};

export default Features;
