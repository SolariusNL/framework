import Rocket from "@/icons/Rocket";
import clsx from "@/util/clsx";
import { rem } from "@/util/rem";
import {
  Button,
  Col,
  Container,
  Grid,
  SimpleGrid,
  Text,
  ThemeIcon,
  Title,
  createStyles,
} from "@mantine/core";
import Link from "next/link";
import { FC } from "react";
import {
  HiOutlineCode,
  HiOutlineDatabase,
  HiOutlineServer,
  HiOutlineTrendingUp,
} from "react-icons/hi";

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

const features = [
  {
    icon: HiOutlineCode,
    title: "TypeScript & Lua",
    description:
      "Coming from Roblox? We've got you covered. Our Lua API is built to closely resemble Roblox, so you can get started quickly.",
  },
  {
    icon: HiOutlineServer,
    title: "Robust backend",
    description:
      "We've built a robust backend to power your games. It's written in Rust, and is designed to be fast and scalable.",
  },
  {
    icon: HiOutlineTrendingUp,
    title: "Analytics",
    description:
      "We provide you with a suite of analytics tools to help you understand your players and grow your audience.",
  },
  {
    icon: HiOutlineDatabase,
    title: "Zero cost",
    description:
      "We don't charge you a penny for hosting your game. We only make money when you do, so we're incentivised to help you succeed.",
  },
];

const LargeFeatures: FC = () => {
  const { classes, theme } = useStyles();

  const items = features.map((feature) => (
    <div key={feature.title}>
      <ThemeIcon size={44} radius="md" variant="light" color="pink">
        <feature.icon size={26} />
      </ThemeIcon>
      <Title order={4} mt="sm">
        {feature.title}
      </Title>
      <Text color="dimmed" size="sm" mt={4}>
        {feature.description}
      </Text>
    </div>
  ));

  return (
    <div
      className={clsx(classes.wrapper, "py-16 my-16 mx-auto rounded-3xl")}
      style={{
        backgroundColor:
          theme.colorScheme === "dark"
            ? theme.colors.dark[9]
            : theme.colors.gray[0],
      }}
    >
      <Container>
        <Grid gutter={80}>
          <Col span={12} md={5}>
            <Title className={classes.title} order={2}>
              Strength at your fingertips
            </Title>
            <Text color="dimmed">
              Our huge suite of free tools will help you deploy your first game
              in a matter of hours.
            </Text>

            <Link href="/register" passHref>
              <Button
                radius="xl"
                size="md"
                color="pink"
                leftIcon={<Rocket />}
                component="a"
                variant="light"
                className="mt-8"
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
      </Container>
    </div>
  );
};

export default LargeFeatures;
