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
  const { classes } = useStyles();
  return (
    <div className="mt-16">
      <Container>
        <div className={classes.inner}>
          <div className={classes.content}>
            <Title className={classes.title}>
              A <span className={classes.highlight}>new</span> way <br />{" "}
              <Typewriter
                options={{
                  strings: ["to be creative", "to build a community"],
                  autoStart: true,
                  loop: true,
                  delay: 50,
                  deleteSpeed: 50,
                }}
              />
            </Title>
            <Text color="dimmed" mt="md">
              Build your dream game faster than ever. Dive into immersive games
              with your friends. Powering creativity.
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
                <b>100% free & open source</b> - as in free beer & freedom. The
                community is in control.
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
              <Button radius="xl" size="md" className={classes.control}>
                Get started
              </Button>
              <Button
                variant="default"
                radius="xl"
                size="md"
                className={classes.control}
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
