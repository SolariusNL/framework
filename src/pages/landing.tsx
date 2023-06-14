import { Container, createStyles, Text } from "@mantine/core";
import { NextPage } from "next";
import Link from "next/link";
import Typewriter from "typewriter-effect";
import Background from "../components/Background";
import Footer from "../components/Footer";
import Faq from "../components/Landing/Faq";
import Features from "../components/Landing/Features";
import Power from "../components/Landing/Power";
import Pros from "../components/Landing/Pros";
import LandingHeader from "../components/LandingHeader";
import clsx from "../util/clsx";
import useMediaQuery from "../util/media-query";

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

  spacer: {
    marginBottom: theme.spacing.xl * 4,
  },
}));

const Landing: NextPage = () => {
  const { classes } = useStyles();
  const mobile = useMediaQuery("768");

  return (
    <>
      <div className="isolate bg-black">
        <Background />
        <LandingHeader />
        <Container className={classes.wrapper} size={1400}>
          <div className={classes.inner}>
            <h1
              className={clsx(
                "font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-center",
                "bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-blue-600",
                "leading-tight sm:leading-tight lg:leading-tight font-title"
              )}
            >
              <Typewriter
                options={{
                  strings: [
                    "Imagination starts here.",
                    "Roblox redefined.",
                    "Create the game of your dreams.",
                    "Imagine. Create. Share.",
                    "The future of gaming.",
                    "Open source. Decentralized. Federated.",
                    "Complex beyond comprehension.",
                    "Streamlined power - at your fingertips.",
                    "Powerful simplicity in a single package.",
                  ],
                  autoStart: true,
                  loop: true,
                  delay: 50,
                  deleteSpeed: 50,
                }}
              />
            </h1>

            <p className="mt-6 text-lg text-slate-600 text-center max-w-3xl mx-auto dark:text-slate-400 mb-12">
              Join our free, open-source federated network to explore the
              possibilities of limitless creativity and self-expression in a
              decentralized, censorship-resistant, and permissionless
              environment.
            </p>

            <div className={classes.controls}>
              <Link href="/register" passHref>
                <a className="bg-slate-900 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 text-pink-200/95 transition-all font-semibold h-12 px-6 rounded-lg w-full flex items-center justify-center sm:w-auto dark:bg-pink-800 dark:highlight-white/20 dark:hover:bg-pink-700 no-underline">
                  Join Now
                </a>
              </Link>
            </div>

            <Container p={0} size={600} className="mt-12">
              <Text
                size="sm"
                color="dimmed"
                className="text-left md:text-center"
              >
                Soodam.re B.V. is not affiliated with Roblox Corporation. All
                trademarks are property of their respective owners.
              </Text>
            </Container>
          </div>

          {[Pros, Power, Features, Faq].map((Component, index) => (
            <div key={index} className={classes.spacer}>
              <Component />
            </div>
          ))}
        </Container>

        <Footer />
      </div>
    </>
  );
};

export default Landing;
