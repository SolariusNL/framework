import {
  Col,
  createStyles,
  Grid,
  SimpleGrid,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { HiEyeOff, HiLockOpen, HiServer, HiShieldCheck } from "react-icons/hi";
import clsx from "../../util/clsx";

const useStyles = createStyles((theme) => ({
  wrapper: {
    padding: `${theme.spacing.xl * 2}px ${theme.spacing.xl}px`,
    borderRadius: theme.radius.md,
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
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
    icon: HiLockOpen,
    title: "Free and open source",
    description:
      "Framework is free (as in freedom and as in free beer) and open source, licensed under GNU AGPLv3. You can view the source code on our GitLab instance.",
    gradient: { from: "pink", to: "grape" },
  },
  {
    icon: HiEyeOff,
    title: "Privacy and security",
    description:
      "Framework is built on top of the most secure technologies available today. We use the latest web technologies that are constantly being improved by the community.",
    gradient: { from: "teal", to: "cyan" },
  },
  {
    icon: HiShieldCheck,
    title: "Safe community",
    description:
      "Our staff is committed to providing a safe and friendly community for everyone to enjoy. Being federated, moderation is decentralized and generally more effective.",
    gradient: { from: "red", to: "orange" },
  },
  {
    icon: HiServer,
    title: "Self-hosting",
    description:
      "Framework is designed to be self-hosted. You can host your own instance of Framework and be interoperable with the rest of the Framework fediverse.",
    gradient: { from: "blue", to: "indigo" },
  },
];

const Pros = () => {
  const { classes } = useStyles();

  const items = features.map((feature) => (
    <div key={feature.title}>
      <ThemeIcon
        size={44}
        radius="md"
        className="bg-pink-700 dark:highlight-white/20"
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
    <div className={clsx(classes.wrapper, "bg-black bg-opacity-50")}>
      <Grid gutter={80}>
        <Col span={12} md={5}>
          <p className="text-pink-700 font-bold text-sm">Why Framework?</p>
          <Title
            className={clsx(classes.title, "tracking-tight font-extrabold")}
            order={2}
          >
            Our standards
          </Title>
          <Text color="dimmed">
            Framework unlocks creativity, freedom, and imagination. Our powerful
            tools empower people like you to create stunning experiences,
            without the hassle.
          </Text>
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

export default Pros;
