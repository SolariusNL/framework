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
  Group,
  MantineProvider,
  MantineTheme,
  Modal,
  PaginationStylesParams,
  PasswordInput,
  Stack,
  Text,
  TextInput,
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
import { HiCheckCircle } from "react-icons/hi";
import ReactNoSSR from "react-no-ssr";
import "../../flags.config";
import SocketProvider from "../components/ContextProvider";
import ElectronTitlebar from "../components/ElectronTitlebar";
import Stateful from "../components/Stateful";
import { FrameworkUserProvider } from "../contexts/FrameworkUser";
import { UserInformationWrapper } from "../contexts/UserInformationDialog";
import "../styles/framework.css";
import "../styles/tw.css";
import logout from "../util/api/logout";

const Framework = (props: AppProps & { colorScheme: ColorScheme }) => {
  const { Component, pageProps } = props;
  const [colorScheme, setColorScheme] = useState<ColorScheme>(
    props.colorScheme
  );

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
      if (router.pathname !== "/maintenance") {
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

  return (
    <>
      <Head>
        <title>Framework</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>

      <DefaultSeo
        openGraph={{
          type: "website",
          locale: "en_US",
          url: "https://framework.soodam.rocks/",
          siteName: "Framework",
          images: [
            {
              secureUrl: "/logo-dark.png",
              url: "/logo-dark.png",
              alt: "The Framework logo.",
              width: 1920,
              height: 1080,
            },
          ],
        }}
        titleTemplate="%s | Framework"
        description="Framework is a free and open-source alternative to Roblox."
        canonical="https://framework.soodam.rocks/"
      />

      <ColorSchemeProvider
        colorScheme={colorScheme}
        toggleColorScheme={toggleColorScheme}
      >
        <MantineProvider
          withGlobalStyles
          withNormalizeCSS
          theme={{
            colorScheme,
            fontFamily: "Inter var",
            defaultRadius: "md",
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
              Modal: {
                styles: () => ({
                  root: {
                    zIndex: 1000,
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
                        ? theme.colors[params.color || theme.primaryColor][2] +
                          "65"
                        : theme.colors[params.color || theme.primaryColor][9] +
                          "90",
                    backgroundColor:
                      theme.colorScheme === "dark"
                        ? theme.colors[params.color || theme.primaryColor][8] +
                          "20"
                        : theme.colors[params.color || theme.primaryColor][0] +
                          "90",
                  },
                  message: {
                    color:
                      theme.colorScheme === "dark"
                        ? theme.colors[params.color || theme.primaryColor][1]
                        : theme.colors[params.color || theme.primaryColor][9],
                  },
                }),
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
                    borderRadius: theme.defaultRadius + " !important",
                  },
                }),
              },
            },
          }}
        >
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
                  <NotificationsProvider position="top-center" zIndex={1000}>
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
                          you may be permanently banned from Framework. Please,
                          go through our policies again and make sure you
                          understand them. We would hate to see you go!
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
                        withCloseButton={false}
                        opened={
                          pageProps != undefined &&
                          pageProps.user &&
                          pageProps.user.banned
                        }
                        onClose={() => null}
                      >
                        {pageProps != undefined && pageProps.user && (
                          <>
                            <Text mb={8}>
                              Your account has been suspended for violations of
                              our Terms of Service and/or our Community
                              Guidelines.
                            </Text>
                            <Text mb={16}>
                              You are not allowed to use Framework or create any
                              additional accounts during the period of your ban.
                            </Text>

                            <Stack spacing={8} mb={24}>
                              {[
                                [
                                  "Note",
                                  pageProps != undefined &&
                                    pageProps.user &&
                                    pageProps.user.banReason,
                                ],
                                [
                                  "Expires",
                                  pageProps != undefined &&
                                    pageProps.user &&
                                    new Date(
                                      pageProps.user.banExpires
                                    ).toLocaleDateString(),
                                ],
                              ].map(([title, value]) => (
                                <div
                                  className="flex justify-between items-start"
                                  key={title}
                                >
                                  <Text
                                    color="dimmed"
                                    className="whitespace-nowrap"
                                  >
                                    {title}
                                  </Text>
                                  <Text weight={500} className="text-right">
                                    {value}
                                  </Text>
                                </div>
                              ))}
                            </Stack>

                            <Button
                              fullWidth
                              onClick={async () => {
                                if (
                                  new Date(
                                    pageProps.user.banExpires
                                  ).getTime() <= new Date().getTime()
                                ) {
                                  await fetch("/api/users/@me/unlock", {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                      Authorization: String(
                                        getCookie(".frameworksession")
                                      ),
                                    },
                                  }).then(() => router.reload());
                                } else {
                                  await logout().then(() => router.reload());
                                }
                              }}
                            >
                              {new Date(pageProps.user.banExpires).getTime() <=
                              new Date().getTime()
                                ? "Unlock my account"
                                : "Logout"}
                            </Button>
                          </>
                        )}
                      </Modal>

                      <Dialog
                        opened={
                          !cookieConsent.accepted && !cookieConsent.rejected
                        }
                      >
                        <Text size="sm" mb={12}>
                          Framework and other Soodam.re services use cookies to
                          help us provide you the best experience. By continuing
                          to use our services, you agree to our use of cookies.
                          Read our{" "}
                          <Link href="/privacy">
                            <Anchor>Privacy Policy</Anchor>
                          </Link>{" "}
                          for more information regarding your privacy and how we
                          use cookies.
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
                          You are required to reset your password. Please enter
                          a new password below.
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
                                  await fetch("/api/users/@me/changepassword", {
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
                                  }).finally(() => router.reload());
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
      </ColorSchemeProvider>
    </>
  );
};

Framework.getInitialProps = ({ ctx }: { ctx: GetServerSidePropsContext }) => ({
  colorScheme: getCookie("mantine-color-scheme", ctx) || "dark",
});

export default Framework;
