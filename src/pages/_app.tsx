import { useFlags } from "@happykit/flags/client";
import {
  AlertStylesParams,
  Anchor,
  AnchorProps,
  BadgeStylesParams,
  Button,
  ButtonStylesParams,
  ColorScheme,
  ColorSchemeProvider,
  Dialog,
  Divider,
  Global,
  Group,
  MantineProvider,
  MantineTheme,
  Modal,
  NavLinkStylesParams,
  PaginationStylesParams,
  PasswordInput,
  Text,
  Textarea,
  TextInput,
  TooltipStylesParams,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { ModalsProvider } from "@mantine/modals";
import {
  NotificationsProvider,
  showNotification,
} from "@mantine/notifications";
import { MDXProvider } from "@mdx-js/react";
import { getCookie, setCookie } from "cookies-next";
import isElectron from "is-electron";
import { GetServerSidePropsContext } from "next";
import { DefaultSeo } from "next-seo";
import type { AppProps } from "next/app";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import NextNProgress from "nextjs-progressbar";
import { useEffect, useState } from "react";
import { HiArrowRight, HiCheckCircle } from "react-icons/hi";
import ReactNoSSR from "react-no-ssr";
import "../../flags.config";
import Descriptive from "../components/Descriptive";
import ElectronTitlebar from "../components/ElectronTitlebar";
import Rating from "../components/Rating";
import Stateful from "../components/Stateful";
import { FrameworkUserProvider } from "../contexts/FrameworkUser";
import SocketProvider from "../contexts/SocketContextProvider";
import { UserInformationWrapper } from "../contexts/UserInformationDialog";
import useAmoled from "../stores/useAmoled";
import useFeedback from "../stores/useFeedback";
import "../styles/fonts.css";
import "../styles/framework.css";
import "../styles/tw.css";
import { AMOLED_COLORS } from "../util/constants";

const Framework = (
  props: AppProps & {
    colorScheme: ColorScheme;
    highContrast: boolean;
    amoled: boolean;
  }
) => {
  const { Component, pageProps } = props;
  const [colorScheme, setColorScheme] = useState<ColorScheme>(
    props.colorScheme
  );
  const [highContrast, setHighContrast] = useState<boolean>(props.highContrast);
  const [amoled, setAmoled] = useState<boolean>(props.amoled);
  const [loading, setLoading] = useState(false);
  const { opened: ratingModal, setOpened: setRatingModal } = useFeedback();
  const [seen, setSeen] = useState(false);
  const { setEnabled } = useAmoled();

  const submitRating = async (stars: number, feedback: string = "") => {
    setLoading(true);
    await fetch("/api/users/@me/survey/" + stars, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
      body: JSON.stringify({ feedback }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          if (stars !== 0) {
            showNotification({
              title: "Thank you",
              message:
                "Thank you for your feedback, we sincerely value your opinion and will use it to improve our platform.",
              icon: <HiCheckCircle />,
            });
          }
          setSeen(true);
        } else {
          setSeen(false);
        }

        setRatingModal(false);
        setLoading(false);
      });
  };

  const toggleColorScheme = (value?: ColorScheme) => {
    const nextColorScheme =
      value || (colorScheme === "dark" ? "light" : "dark");
    setColorScheme(nextColorScheme);
    setCookie("mantine-color-scheme", nextColorScheme, {
      maxAge: 60 * 60 * 24 * 30,
    });
  };

  const [cookieConsent, setCookieConsent] = useLocalStorage<{
    accepted: boolean;
    rejected: boolean;
  }>({
    key: "soodam-cookie-consent",
    defaultValue: { accepted: false, rejected: false },
  });

  const router = useRouter();
  const { flags } = useFlags();

  useEffect(() => {
    if (router.query.status == "success") {
      showNotification({
        title: "Success",
        message: "Your request was successful.",
        icon: <HiCheckCircle size={18} />,
        color: "green",
      });
    }
  }, []);

  useEffect(() => {
    if (flags?.maintenanceEnabled == true) {
      if (
        router.pathname !== "/maintenance" &&
        !router.pathname.startsWith("/admin")
      ) {
        router.push("/maintenance");
      }
    }
  }, [flags?.maintenanceEnabled]);

  async function initGateway() {
    await fetch("/api/gateway/initialize", {
      method: "GET",
      headers: {
        Authorization: String(getCookie(".frameworksession")),
      },
    });
  }

  useEffect(() => {
    if (pageProps && pageProps.user && typeof window !== "undefined") {
      initGateway();
    }
  }, []);

  useEffect(() => {
    if (amoled) {
      setEnabled(true);
    } else {
      setEnabled(false);
    }
  }, [amoled]);

  return (
    <>
      <Head>
        <title>Framework</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
      </Head>

      <DefaultSeo
        openGraph={{
          type: "website",
          locale: "en_US",
          url: "https://framework.soodam.rocks/",
          siteName: "Framework - Soodam.re",
          images: [
            {
              secureUrl: "/opengraph.svg",
              url: "/opengraph.svg",
              alt: "Framework SEO Banner",
              width: 800,
              height: 400,
            },
          ],
          title: "Framework",
        }}
        titleTemplate="%s | Framework"
        description="Framework is a free and open-source game platform similar to Roblox. Join the waitlist today and enter a new world."
        canonical="https://framework.soodam.rocks/"
      />

      <ColorSchemeProvider
        colorScheme={colorScheme}
        toggleColorScheme={toggleColorScheme}
      >
        <div className={colorScheme === "dark" ? "dark" : ""}>
          <MantineProvider
            withGlobalStyles
            withNormalizeCSS
            theme={{
              colorScheme,
              fontFamily: "Inter var",
              defaultRadius: "md",
              fontFamilyMonospace: "Fira Code VF",
              components: {
                Button: {
                  styles: (theme, params: ButtonStylesParams) => ({
                    root: {
                      ...(params.variant === "filled" && {
                        border: "1px solid",
                        borderColor:
                          theme.colors[params.color || theme.primaryColor][
                            theme.colorScheme == "dark" ? 2 : 9
                          ] + "85",
                        "&:hover": {
                          borderColor:
                            theme.colors[params.color || theme.primaryColor][
                              theme.colorScheme == "dark" ? 2 : 9
                            ] + "85",
                        },
                        boxShadow:
                          colorScheme === "light"
                            ? "inset 0 1.2px 0 0 hsla(0,0%,100%,.2);"
                            : "",
                      }),
                      ...(amoled &&
                        params.variant === "default" && {
                          backgroundColor: "#000 !important",
                        }),
                    },
                  }),
                },
                NavLink: {
                  styles: (theme, params: NavLinkStylesParams) => ({
                    root: {
                      border: "1px solid",
                      borderColor: "transparent",
                      "&[data-active]": {
                        borderColor:
                          theme.colors[params.color || theme.primaryColor][
                            theme.colorScheme == "dark" ? 2 : 9
                          ] + "85",
                        "&:hover": {
                          borderColor:
                            theme.colors[params.color || theme.primaryColor][
                              theme.colorScheme == "dark" ? 2 : 9
                            ] + "85",
                        },
                      },
                      "&:hover": {
                        ...(amoled && {
                          backgroundColor: AMOLED_COLORS.paper,
                        }),
                      },
                    },
                  }),
                },
                Tabs: {
                  styles: () => ({
                    tab: {
                      "&[data-active]": {
                        fontWeight: 700,
                      },
                    },
                  }),
                },
                Menu: {
                  styles: (theme: MantineTheme) => ({
                    dropdown: {
                      ...(amoled && {
                        backgroundColor: "#000",
                      }),
                    },
                  }),
                },
                Modal: {
                  styles: () => ({
                    root: {
                      zIndex: 1000,
                    },
                    modal: {
                      ...(amoled && {
                        backgroundColor: AMOLED_COLORS.paper,
                      }),
                    },
                  }),
                },
                Notification: {
                  styles: (theme: MantineTheme) => ({
                    root: {
                      backgroundColor:
                        theme.colorScheme === "dark"
                          ? theme.colors.dark[8]
                          : theme.colors.gray[0],
                    },
                  }),
                },
                Alert: {
                  styles: (theme: MantineTheme, params: AlertStylesParams) => ({
                    root: {
                      border: "1px solid",
                      borderColor:
                        theme.colorScheme === "dark"
                          ? theme.colors[
                              params.color || theme.primaryColor
                            ][2] + "65"
                          : theme.colors[
                              params.color || theme.primaryColor
                            ][9] + "90",
                      backgroundColor:
                        theme.colorScheme === "dark"
                          ? theme.colors[
                              params.color || theme.primaryColor
                            ][8] + "20"
                          : theme.colors[
                              params.color || theme.primaryColor
                            ][0] + "90",
                    },
                    message: {
                      color:
                        theme.colorScheme === "dark"
                          ? theme.colors[params.color || theme.primaryColor][1]
                          : theme.colors[params.color || theme.primaryColor][9],
                    },
                  }),
                },
                Input: {
                  styles: {
                    input: {
                      ...(amoled && {
                        backgroundColor: "#000",
                      }),
                    },
                  },
                },
                Pagination: {
                  styles: (
                    theme: MantineTheme,
                    params: PaginationStylesParams
                  ) => ({
                    item: {
                      fontFamily: "Inter var",
                      "&[data-active]": {
                        backgroundColor:
                          theme.colors[params.color || theme.primaryColor][
                            theme.colorScheme === "dark" ? 8 : 0
                          ] + "80",
                        border:
                          "1px solid " +
                          theme.colors[params.color || theme.primaryColor][6],
                        color:
                          theme.colors[params.color || theme.primaryColor][
                            theme.colorScheme === "dark" ? 2 : 9
                          ],
                      },
                      ...(amoled && {
                        backgroundColor: "#000",
                      }),
                    },
                  }),
                },
                Badge: {
                  styles: (theme: MantineTheme, params: BadgeStylesParams) => ({
                    root: {
                      border: "1px solid",
                      borderColor:
                        theme.colors[params.color || theme.primaryColor][
                          theme.colorScheme === "dark" ? 2 : 9
                        ] + "90",
                    },
                  }),
                },
                Select: {
                  styles: (theme: MantineTheme) => ({
                    item: {
                      borderRadius: theme.radius.md,
                      "&[data-hovered]": {
                        ...(amoled && {
                          backgroundColor: AMOLED_COLORS.paper,
                        }),
                      },
                      "&[data-selected]": {
                        "&, &:hover": {
                          ...(amoled && {
                            backgroundColor: AMOLED_COLORS.paper,
                            fontWeight: "bold",
                          }),
                        },
                      },
                    },
                    dropdown: {
                      borderRadius: theme.radius.md + " !important",
                      ...(amoled && {
                        backgroundColor: "#000",
                      }),
                    },
                  }),
                },
                Tooltip: {
                  styles: (
                    theme: MantineTheme,
                    params: TooltipStylesParams
                  ) => ({
                    tooltip: {
                      backgroundColor:
                        theme.colorScheme === "dark"
                          ? theme.colors.gray[3]
                          : theme.colors.dark[8],
                      color:
                        theme.colorScheme === "dark"
                          ? theme.colors.dark[8]
                          : theme.colors.gray[3],
                    },
                  }),
                },
                Checkbox: {
                  styles: () => ({
                    input: {
                      ...(amoled && {
                        backgroundColor: "#000",
                      }),
                    },
                  }),
                },
                Table: {
                  styles: () => ({
                    root: {
                      ...(amoled && {
                        "&[data-striped] tbody tr:nth-of-type(odd)": {
                          backgroundColor: AMOLED_COLORS.paper,
                        },
                      }),
                    },
                  }),
                },
                Accordion: {
                  styles: () => ({
                    control: {
                      ...(amoled && {
                        "&:hover": {
                          backgroundColor: AMOLED_COLORS.paper + " !important",
                        },
                      }),
                    },
                  }),
                },
              },
            }}
          >
            <Global
              styles={(theme) => ({
                ...(highContrast && {
                  "*": {
                    filter: "invert(1) !important",
                  },
                }),
                ...(amoled && {
                  "body, html": {
                    backgroundColor: "#000",
                  },
                }),
              })}
            />
            <ModalsProvider>
              <UserInformationWrapper>
                <SocketProvider>
                  <MDXProvider
                    components={{
                      a: (props) => (
                        <Link href={String(props.href)}>
                          <Anchor {...(props as AnchorProps)} />
                        </Link>
                      ),
                      hr: () => <Divider />,
                    }}
                  >
                    <NotificationsProvider
                      position="top-center"
                      zIndex={999999}
                    >
                      <FrameworkUserProvider
                        value={pageProps && pageProps.user && pageProps.user}
                      >
                        <NextNProgress />
                        <ReactNoSSR>
                          {isElectron() && <ElectronTitlebar />}
                        </ReactNoSSR>
                        <Component {...pageProps} key={router.asPath} />
                        <Modal
                          withCloseButton={false}
                          opened={
                            pageProps != undefined &&
                            pageProps.user &&
                            pageProps.user.warning &&
                            !pageProps.user.warningViewed
                          }
                          onClose={() => null}
                        >
                          <Text mb={16}>
                            You have received a warning from the staff team:{" "}
                            <strong>
                              {(pageProps != undefined &&
                                pageProps.user &&
                                pageProps.user.warning) ||
                                "No warning reason provided"}
                            </strong>
                          </Text>

                          <Text mb={24}>
                            If you continue to violate our Community Guidelines,
                            you may be permanently banned from Framework.
                            Please, go through our policies again and make sure
                            you understand them. We would hate to see you go!
                          </Text>

                          <Button
                            fullWidth
                            onClick={() => {
                              fetch("/api/users/@me/warning/acknowledge", {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                  Authorization: String(
                                    getCookie(".frameworksession")
                                  ),
                                },
                              }).then(() => router.reload());
                            }}
                          >
                            Acknowledge
                          </Button>
                        </Modal>
                        <Modal
                          title="Experience survey"
                          opened={ratingModal}
                          onClose={() => setRatingModal(false)}
                        >
                          <Text size="sm" color="dimmed" mb="md">
                            We would love to hear your feedback about Framework.
                            Please, take a minute to fill out this survey, and
                            be brutally honest with your answers. Your feedback
                            will help us improve Framework.
                          </Text>
                          <Stateful
                            initialState={{
                              rating: 0,
                              feedback: "",
                            }}
                          >
                            {(data, setState) => (
                              <>
                                <Descriptive
                                  required
                                  title="Star rating"
                                  description="How would you rate your experience with Framework?"
                                >
                                  <Rating
                                    value={data.rating}
                                    setValue={(rating) =>
                                      setState({
                                        ...data,
                                        rating,
                                      })
                                    }
                                  />
                                </Descriptive>
                                <Textarea
                                  label="Feedback"
                                  placeholder="What do you like about Framework? What could we improve?"
                                  description="Your feedback is completely anonymous and will help us improve Framework."
                                  mt="md"
                                  minRows={4}
                                  value={data.feedback}
                                  onChange={(event) =>
                                    setState({
                                      ...data,
                                      feedback: event.currentTarget.value,
                                    })
                                  }
                                />
                                <div className="flex justify-end mt-6">
                                  <Button
                                    leftIcon={<HiArrowRight />}
                                    onClick={() => {
                                      submitRating(data.rating, data.feedback);
                                      setRatingModal(false);
                                    }}
                                    loading={loading}
                                    disabled={!data.rating}
                                  >
                                    Submit
                                  </Button>
                                </div>
                              </>
                            )}
                          </Stateful>
                        </Modal>

                        <Dialog
                          opened={
                            !cookieConsent.accepted && !cookieConsent.rejected
                          }
                        >
                          <Text size="sm" mb={12}>
                            Framework and other Soodam.re services use cookies
                            to help us provide you the best experience. By
                            continuing to use our services, you agree to our use
                            of cookies. Read our{" "}
                            <Link href="/privacy" passHref>
                              <Anchor>Privacy Policy</Anchor>
                            </Link>{" "}
                            for more information regarding your privacy and how
                            we use cookies.
                          </Text>

                          <Group grow>
                            <Button
                              onClick={() =>
                                setCookieConsent({
                                  accepted: true,
                                  rejected: false,
                                })
                              }
                            >
                              I agree
                            </Button>

                            <Button
                              onClick={() =>
                                setCookieConsent({
                                  accepted: false,
                                  rejected: true,
                                })
                              }
                            >
                              I do not agree
                            </Button>
                          </Group>
                        </Dialog>

                        <Modal
                          title="Reset email"
                          opened={
                            pageProps != undefined &&
                            pageProps.user &&
                            pageProps.user.emailResetRequired
                          }
                          onClose={() => null}
                          withCloseButton={false}
                        >
                          <Text mb={16}>
                            You are required to reset your email address. Please
                            enter a new email address below.
                          </Text>
                          <Stateful>
                            {(email, setEmail) => (
                              <>
                                <TextInput
                                  type="email"
                                  label="Email"
                                  description="Your new email address"
                                  value={email}
                                  onChange={(e) =>
                                    setEmail(e.currentTarget.value)
                                  }
                                />
                                <Button
                                  mt={14}
                                  leftIcon={<HiCheckCircle />}
                                  disabled={
                                    !email ||
                                    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
                                    email === pageProps.user.email
                                  }
                                  onClick={async () => {
                                    await fetch("/api/users/@me/changeemail", {
                                      method: "POST",
                                      headers: {
                                        "Content-Type": "application/json",
                                        Authorization: String(
                                          getCookie(".frameworksession")
                                        ),
                                      },
                                      body: JSON.stringify({
                                        newEmail: email,
                                      }),
                                    }).finally(() => router.reload());
                                  }}
                                >
                                  Reset email
                                </Button>
                              </>
                            )}
                          </Stateful>
                        </Modal>

                        <Modal
                          title="Reset password"
                          opened={
                            pageProps != undefined &&
                            pageProps.user &&
                            pageProps.user.passwordResetRequired
                          }
                          onClose={() => null}
                          withCloseButton={false}
                        >
                          <Text mb={16}>
                            You are required to reset your password. Please
                            enter a new password below.
                          </Text>
                          <Stateful>
                            {(password, setPassword) => (
                              <>
                                <PasswordInput
                                  label="Password"
                                  description="Your new password"
                                  value={password}
                                  onChange={(e) =>
                                    setPassword(e.currentTarget.value)
                                  }
                                />
                                <Button
                                  mt={14}
                                  leftIcon={<HiCheckCircle />}
                                  disabled={!password || password.length < 8}
                                  onClick={async () => {
                                    await fetch(
                                      "/api/users/@me/changepassword",
                                      {
                                        method: "POST",
                                        headers: {
                                          "Content-Type": "application/json",
                                          Authorization: String(
                                            getCookie(".frameworksession")
                                          ),
                                        },
                                        body: JSON.stringify({
                                          newPassword: password,
                                        }),
                                      }
                                    ).finally(() => router.reload());
                                  }}
                                >
                                  Reset password
                                </Button>
                              </>
                            )}
                          </Stateful>
                        </Modal>
                      </FrameworkUserProvider>
                    </NotificationsProvider>
                  </MDXProvider>
                </SocketProvider>
              </UserInformationWrapper>
            </ModalsProvider>
          </MantineProvider>
        </div>
      </ColorSchemeProvider>
    </>
  );
};

Framework.getInitialProps = ({ ctx }: { ctx: GetServerSidePropsContext }) => ({
  colorScheme: getCookie("mantine-color-scheme", ctx) || "dark",
  highContrast: getCookie("mantine-high-contrast", ctx),
  amoled: getCookie("mantine-amoled", ctx),
});

export default Framework;
