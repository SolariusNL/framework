import LandingMeshBg from "@/assets/bg.png";
import Rocket from "@/icons/Rocket";
import { rem } from "@/util/rem";
import {
  Button,
  Container,
  Group,
  List,
  Text,
  ThemeIcon,
  Title,
  createStyles,
} from "@mantine/core";
import Link from "next/link";
import { FC } from "react";
import { HiBadgeCheck } from "react-icons/hi";
import Typewriter from "typewriter-effect";

const useStyles = createStyles((theme) => ({
  inner: {
    display: "flex",
    justifyContent: "space-between",
    paddingTop: `calc(${theme.spacing.xl} * 4)`,
    paddingBottom: `calc(${theme.spacing.xl} * 4)`,
  },

  content: {
    maxWidth: rem(480),
    marginRight: `calc(${theme.spacing.xl} * 3)`,

    [theme.fn.smallerThan("md")]: {
      maxWidth: "100%",
      marginRight: 0,
    },
  },

  title: {
    color: theme.colorScheme === "dark" ? theme.colors.gray[2] : theme.black,
    fontSize: rem(44),
    lineHeight: 1.2,
    fontWeight: 900,

    [theme.fn.smallerThan("xs")]: {
      fontSize: rem(28),
    },
  },

  control: {
    [theme.fn.smallerThan("xs")]: {
      flex: 1,
    },
  },

  image: {
    flex: 1,

    [theme.fn.smallerThan("md")]: {
      display: "none",
    },
  },

  highlight: {
    position: "relative",
    backgroundColor: theme.fn.variant({
      variant: "light",
      color: "pink",
    }).background,
    borderRadius: theme.radius.sm,
    padding: `${rem(4)} ${rem(12)}`,
  },
}));

const Hero: FC = () => {
  const { classes, theme } = useStyles();
  return (
    <div
      className="py-16 my-16 relative mx-auto rounded-3xl overflow-hidden"
      style={{
        backgroundColor:
          theme.colorScheme === "dark"
            ? theme.colors.dark[9]
            : theme.colors.gray[0],
        backgroundImage: `url(${LandingMeshBg.src})`,
        backgroundSize: "cover",
      }}
    >
      <Container className="z-10 mx-auto relative">
        <div className={classes.inner}>
          <div className={classes.content}>
            <Title className={classes.title}>
              A <span className={classes.highlight}>new</span> way <br />{" "}
              <Typewriter
                options={{
                  strings: [
                    "to be creative",
                    "to build a community",
                    "to make friends",
                    "to learn and grow",
                    "to have fun",
                    "to be yourself",
                    "to be a gamer",
                    "to be a developer",
                    "to be a designer",
                  ],
                  autoStart: true,
                  loop: true,
                  delay: 50,
                  deleteSpeed: 50,
                }}
              />
            </Title>
            <Text color="dimmed" mt="md">
              Framework is a new way to make your dreams come true. Free, open
              and safe game platform - built by the community, for the
              community.
            </Text>

            <List
              mt={30}
              spacing="sm"
              size="sm"
              icon={
                <ThemeIcon size={26} color="pink" radius="xl">
                  <HiBadgeCheck size={rem(16)} stroke="1.5" />
                </ThemeIcon>
              }
            >
              <List.Item>
                <b>100% free & open source</b> - Free as in free beer & free
                speech. The community is in control.
              </List.Item>
              <List.Item>
                <b>Packed with features</b> - Framework empowers anyone to build
                their dream game with hundreds of unique features.
              </List.Item>
              <List.Item>
                <b>Safe, private and friendly</b> - Solarius prides itself on
                its stance on safety, privacy and a civil community.
              </List.Item>
            </List>

            <Group mt={30}>
              <Link href="/register" passHref>
                <Button
                  radius="xl"
                  size="md"
                  className={classes.control}
                  color="pink"
                  leftIcon={<Rocket />}
                  component="a"
                >
                  Get started
                </Button>
              </Link>
              <Button
                variant="light"
                radius="xl"
                size="md"
                color="gray"
                className={classes.control}
                component="a"
                href="https://github.com/SolariusNL/framework"
              >
                Source code
              </Button>
            </Group>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Hero;
