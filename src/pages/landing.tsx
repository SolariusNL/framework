import { NextPage } from "next";
import { createStyles, Title, Text, Button, Container } from "@mantine/core";
import Features from "../components/Landing/Pros";
import Power from "../components/Landing/Power";
import Link from "next/link";

const useStyles = createStyles((theme) => ({
  wrapper: {
    position: "relative",
    paddingTop: 120,
    paddingBottom: 80,

    "@media (max-width: 755px)": {
      paddingTop: 80,
      paddingBottom: 60,
    },
  },

  inner: {
    position: "relative",
    zIndex: 1,
    marginBottom: theme.spacing.xl * 4,
  },

  title: {
    textAlign: "center",
    fontWeight: 800,
    fontSize: 40,
    letterSpacing: -1,
    color: theme.colorScheme === "dark" ? theme.white[5] : theme.black[5],
    marginBottom: theme.spacing.xs,
    fontFamily: `Inter, ${theme.fontFamily}`,

    "@media (max-width: 520px)": {
      fontSize: 28,
      textAlign: "left",
    },
  },

  description: {
    textAlign: "center",

    "@media (max-width: 520px)": {
      textAlign: "left",
      fontSize: theme.fontSizes.md,
    },
  },

  controls: {
    marginTop: theme.spacing.lg,
    display: "flex",
    justifyContent: "center",

    "@media (max-width: 520px)": {
      flexDirection: "column",
    },
  },

  control: {
    "&:not(:first-of-type)": {
      marginLeft: theme.spacing.md,
    },

    "@media (max-width: 520px)": {
      height: 42,
      fontSize: theme.fontSizes.md,

      "&:not(:first-of-type)": {
        marginTop: theme.spacing.md,
        marginLeft: 0,
      },
    },
  },

  spacer: {
    marginBottom: theme.spacing.xl * 4,
  },
}));

const Landing: NextPage = () => {
  const { classes } = useStyles();

  return (
    <>
      <Container className={classes.wrapper} size={1400}>
        <div className={classes.inner}>
          <Title className={classes.title}>
            <Text
              component="span"
              variant="gradient"
              gradient={{ from: "pink", to: "grape" }}
              inherit
            >
              Roblox
            </Text>{" "}
            redefined.
          </Title>

          <Container p={0} size={600}>
            <Text size="lg" color="dimmed" className={classes.description}>
              Join <strong>0</strong> other players across <strong>0</strong>{" "}
              servers, on Framework, the new, and better Roblox.
            </Text>
          </Container>

          <div className={classes.controls}>
            <Link href="/register" passHref>
              <Button className={classes.control} size="lg" component="a">
                Join Now
              </Button>
            </Link>
          </div>
        </div>

        <div className={classes.spacer}>
          <Features />
        </div>

        <div>
          <Power />
        </div>
      </Container>
    </>
  );
};

export default Landing;
