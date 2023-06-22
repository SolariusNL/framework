import { Container, createStyles, Text, Title } from "@mantine/core";
import { openModal } from "@mantine/modals";
import { motion } from "framer-motion";
import { NextPage } from "next";
import Link from "next/link";
import {
  HiBadgeCheck,
  HiChartBar,
  HiChatAlt,
  HiClipboardCheck,
  HiCode,
  HiCurrencyDollar,
  HiDocumentText,
  HiGlobe,
  HiGlobeAlt,
  HiLightBulb,
  HiOutlineCode,
  HiOutlineSparkles,
  HiSearch,
  HiServer,
  HiShieldCheck,
  HiShieldExclamation,
  HiSparkles,
  HiSupport,
  HiTicket,
  HiUserGroup,
  HiUsers,
  HiWifi,
} from "react-icons/hi";
import Typewriter from "typewriter-effect";
import Background from "../components/Background";
import Footer from "../components/Footer";
import Faq from "../components/Landing/Faq";
import Features from "../components/Landing/Features";
import Power from "../components/Landing/Power";
import Pros from "../components/Landing/Pros";
import LandingHeader from "../components/LandingHeader";
import Bit from "../icons/Bit";
import Rocket from "../icons/Rocket";
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
                Solarius B.V. is not affiliated with Roblox Corporation. All
                trademarks are property of their respective owners.
              </Text>
            </Container>
          </div>

          {[
            Pros,
            Power,
            Features,
            () => {
              const features = [
                {
                  title: "Self-hosted",
                  description:
                    "Framework games can be hosted on your own server, or on our cloud infrastructure, enabling you to scale your game to large audiences and total creative freedom.",
                  icon: <HiServer />,
                },
                {
                  title: "Sites",
                  description:
                    "Framework Sites are a new way to create and share your games with the world. They are a simple, yet powerful way to create a website for your game, and can be used to create search-indexable, and SEO-friendly landing pages for your games.",
                  icon: <HiGlobe />,
                },
                {
                  title: "Teams",
                  description:
                    "Teams are a new way to collaborate with other developers on your games. They allow you to share ownership of your games with other developers, allow issue reporting & management, customer support, and more.",
                  icon: <HiUserGroup />,
                },
                {
                  title: "Social",
                  description:
                    "Framework Social is a new way to connect with other players on the platform. Coming soon.",
                  icon: <HiSparkles />,
                },
                {
                  title: "Funds",
                  description:
                    "Framework Funds is a new way to raise funds for development of your games. Crowdfund your game, and share ownership with your investors.",
                  icon: <HiTicket />,
                },
                {
                  title: "Bits",
                  description:
                    "Alongside Tickets, Framework has a new currency called Bits, comparable to Tix previously on Roblox. Bits are earned by playing games, logging in daily, and more.",
                  icon: <Bit />,
                },
                {
                  title: "CI/CD",
                  description:
                    "Framework Studio has built-in CI/CD support, allowing you to automatically deploy your game to your server, or our cloud infrastructure, on every commit, and run tests against your code.",
                  icon: <Rocket />,
                },
                {
                  title: "Remote",
                  description:
                    "Our comprehensive server management interface allows for robust remote management of your servers, including live console, file management, and more.",
                  icon: <HiWifi />,
                },
                {
                  title: "Chat",
                  description:
                    "Framework Chat is a websocket-based chat system, allowing you to create chat rooms with friends, or other players on the platform.",
                  icon: <HiChatAlt />,
                },
                {
                  title: "API",
                  description:
                    "Framework has a comprehensive API, allowing you to create your own custom integrations with the platform.",
                  icon: <HiCode />,
                },
                {
                  title: "Open",
                  description:
                    "All of Framework is open-source, allowing you to contribute to the platform, and unlock limitless possibilities.",
                  icon: <HiLightBulb />,
                },
                {
                  title: "Federated",
                  description:
                    "Framework is a federated network, allowing you to create your own servers, and connect them to the network, allowing you to create your own custom experiences, and share them with the world.",
                  icon: <HiGlobeAlt />,
                },
                {
                  title: "Checklists",
                  description:
                    "Task management right at your fingertips. Create checklists for your games, and share them with your team for maximum productivity.",
                  icon: <HiClipboardCheck />,
                },
                {
                  title: "Snippets",
                  description:
                    "Create and share code snippets with your team, or the world.",
                  icon: <HiOutlineCode />,
                },
                {
                  title: "Secure",
                  description:
                    "Framework is built with security in mind. All of our infrastructure is secured with the latest security standards, and our code is audited regularly. Accounts are secured with 2FA, and all passwords are salted and hashed.",
                  icon: <HiShieldCheck />,
                },
                {
                  title: "Safe",
                  description:
                    "Framework is a safe place for everyone. We have a zero-tolerance policy for harassment, and hate speech. We have a comprehensive moderation system, and a dedicated team of moderators to ensure that everyone has a safe experience on the platform.",
                  icon: <HiBadgeCheck />,
                },
                {
                  title: "Analytics",
                  description:
                    "Framework Analytics allows you to track your game's performance, and gain valuable insights into your playerbase.",
                  icon: <HiChartBar />,
                },
                {
                  title: "Monetization",
                  description:
                    "Framework enables you to monetize your games in a variety of ways, including subscriptions, one-time purchases, and more.",
                  icon: <HiCurrencyDollar />,
                },
                {
                  title: "Discovery",
                  description:
                    "Framework has a comprehensive search system, allowing you to discover new games, and new players with a variety of filters.",
                  icon: <HiSearch />,
                },
                {
                  title: "Freedom",
                  description:
                    "Framework is a free, democratic platform, allowing you to create and share your games, ideas, and more, without fear of reprisal.",
                  icon: <HiShieldExclamation />,
                },
                {
                  title: "Community",
                  description:
                    "Solarius puts community first. We are a community-driven platform, and we listen to our community. We are always open to feedback, and we are always looking for ways to improve the platform.",
                  icon: <HiUsers />,
                },
                {
                  title: "Documentation",
                  description:
                    "Framework has comprehensive documentation, allowing you to get started with the platform in minutes.",
                  icon: <HiDocumentText />,
                },
                {
                  title: "Support",
                  description:
                    "As a member of the Framework community, you're entitled to first-class support. We have a dedicated team of support staff, and moderators to ensure that you have a great experience on the platform.",
                  icon: <HiSupport />,
                },
                {
                  title: "Beautiful",
                  description:
                    "Frameworks engine is built on Godot, a beautiful, open-source game engine, allowing you to create beautiful games.",
                  icon: <HiOutlineSparkles />,
                },
              ];

              return (
                <div className="flex justify-center flex-col items-center">
                  <Title order={1}>Features</Title>
                  <div className="bg-pink-700 w-8 h-2 rounded-full mx-4 my-2" />
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mt-8 max-w-5xl">
                    {features.map((feature, index) => (
                      <motion.div
                        key={index}
                        className={clsx(
                          "flex flex-col items-center justify-center",
                          "group cursor-pointer"
                        )}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 30,
                        }}
                        onClick={() =>
                          openModal({
                            title: feature.title,
                            children: (
                              <div className="text-center">
                                <Text size="sm" color="dimmed">
                                  {feature.description}
                                </Text>
                              </div>
                            ),
                          })
                        }
                      >
                        <div
                          className={clsx(
                            "flex items-center text-pink-200 text-2xl justify-center w-16 h-16 rounded-full bg-pink-700/50",
                            "group-hover:bg-pink-700/75 transition-all"
                          )}
                        >
                          {feature.icon}
                        </div>
                        <Title order={4} className="mt-4">
                          {feature.title}
                        </Title>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            },
            Faq,
          ].map((Component, index) => (
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
