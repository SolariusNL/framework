import { Button, Container, createStyles, Text, Title } from "@mantine/core";
import { NextPage } from "next";
import Link from "next/link";
import Footer from "../components/Footer";
import Faq from "../components/Landing/Faq";
import Features from "../components/Landing/Features";
import Power from "../components/Landing/Power";
import Pros from "../components/Landing/Pros";
import LandingHeader from "../components/LandingHeader";
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
      <div className="isolate">
        {!mobile && (
          <div
            className="absolute inset-x-0 top-[-10rem] -z-10 transform-gpu overflow-hidden sm:top-[-20rem]"
            style={{
              filter: "blur(64px)",
            }}
          >
            <svg
              className="relative left-[calc(50%-11rem)] -z-10 h-[21.1875rem] max-w-none -translate-x-1/2 rotate-[30deg] sm:left-[calc(50%-30rem)] sm:h-[42.375rem]"
              viewBox="0 0 1155 678"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="url(#45de2b6b-92d5-4d68-a6a0-9b9b2abad533)"
                fillOpacity=".3"
                d="M317.219 518.975L203.852 678 0 438.341l317.219 80.634 204.172-286.402c1.307 132.337 45.083 346.658 209.733 145.248C936.936 126.058 882.053-94.234 1031.02 41.331c119.18 108.451 130.68 295.337 121.53 375.223L855 299l21.173 362.054-558.954-142.079z"
              />
              <defs>
                <linearGradient
                  id="45de2b6b-92d5-4d68-a6a0-9b9b2abad533"
                  x1="1155.49"
                  x2="-78.208"
                  y1=".177"
                  y2="474.645"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#9089FC"></stop>
                  <stop offset="1" stopColor="#FF80B5"></stop>
                </linearGradient>
              </defs>
            </svg>
          </div>
        )}
        <LandingHeader />
        <Container className={classes.wrapper} size={1400}>
          <div className={classes.inner}>
            <Title className="text-slate-900 font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-center dark:text-white">
              Roblox{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-500">
                redefined
              </span>
            </Title>

            <p className="mt-6 text-lg text-slate-600 text-center max-w-3xl mx-auto dark:text-slate-400 mb-12">
              Join our free, open-source federated network to explore the
              possibilities of limitless creativity and self-expression in a
              decentralized, censorship-resistant, and permissionless
              environment.
            </p>

            <div className={classes.controls}>
              <Link href="/register" passHref>
                <a className="bg-slate-900 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 text-white font-semibold h-12 px-6 rounded-lg w-full flex items-center justify-center sm:w-auto dark:bg-pink-500 dark:highlight-white/20 dark:hover:bg-pink-400 no-underline">
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
