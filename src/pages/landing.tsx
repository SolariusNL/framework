import { Container, createStyles } from "@mantine/core";
import { NextPage } from "next";
import Link from "next/link";
import Footer from "../components/Footer";
import Faq from "../components/Landing/Faq";
import Features from "../components/Landing/Features";
import Power from "../components/Landing/Power";
import Pros from "../components/Landing/Pros";
import LandingHeader from "../components/LandingHeader";
import clsx from "../util/clsx";

const useStyles = createStyles((theme) => ({
  wrapper: {
    position: "relative",
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
      <style jsx global>{`
        html {
          background-color: #121212 !important;
        }
      `}</style>
      <div className="relative antialiased">
        <span className="fixed inset-0 bg-background" />
        <span
          className="fixed inset-0"
          style={{
            backgroundImage:
              "url('https://mintlify.s3-us-west-1.amazonaws.com/frpc/images/lightbackground.png')",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "top right",
            backgroundAttachment: "fixed",
          }}
        />
        <LandingHeader />
        <Container className={classes.wrapper} size={1400}>
          <header className="relative mb-20 sm:mb-24 lg:mb-32">
            <div className="relative max-w-5xl mx-auto pt-20 sm:pt-24 lg:pt-32">
              <div className="text-slate-900 font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-center dark:text-white">
                Roblox{" "}
                <span
                  className={clsx(
                    "bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent"
                  )}
                >
                  redefined
                </span>
              </div>
              <p className="mt-6 text-lg text-slate-600 text-center max-w-3xl mx-auto dark:text-slate-400">
                Framework is a free, open-source and decentralized game
                platform, that allows anyone to create, publish, and monetize
                their own games. Framework honors your privacy, respects your
                time, and gives you full control over your data.
              </p>
              <div className="mt-6 sm:mt-10 flex justify-center text-sm">
                <Link href="/register" passHref>
                  <a className="bg-slate-900 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 text-white font-semibold h-12 px-6 rounded-lg w-full flex items-center justify-center sm:w-auto dark:bg-pink-500 dark:highlight-white/20 dark:hover:bg-pink-400 no-underline">
                    Get started now
                  </a>
                </Link>
              </div>
            </div>
          </header>

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
