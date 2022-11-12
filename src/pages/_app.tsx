import { useFlags } from "@happykit/flags/client";
import {
  Anchor,
  Button,
  ButtonStylesParams,
  ColorScheme,
  ColorSchemeProvider,
  Dialog,
  Group,
  MantineProvider,
  Modal,
  Text,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { ModalsProvider } from "@mantine/modals";
import {
  NotificationsProvider,
  showNotification,
} from "@mantine/notifications";
import { getCookie, setCookie } from "cookies-next";
import { GetServerSidePropsContext } from "next";
import type { AppProps } from "next/app";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import NextNProgress from "nextjs-progressbar";
import { useEffect, useState } from "react";
import { HiCheckCircle } from "react-icons/hi";
import "../../flags.config";
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
    if (flags?.maintenanceEnabled == true) {
      if (router.pathname !== "/maintenance") {
        router.push("/maintenance");
      }
    }

    if (router.query.status == "success") {
      showNotification({
        title: "Success",
        message: "Your request was successful.",
        icon: <HiCheckCircle size={18} />,
        color: "green",
      });
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
                        colorScheme === "dark"
                          ? `inset 0 1.2px 0 0 ${
                              theme.colors[
                                params.color || theme.primaryColor
                              ][9]
                            }`
                          : "inset 0 1.2px 0 0 hsla(0,0%,100%,.2);",
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
            },
          }}
        >
          <ModalsProvider>
            <UserInformationWrapper>
              <NotificationsProvider position="top-center" zIndex={1000}>
                <FrameworkUserProvider
                  value={pageProps && pageProps.user && pageProps.user}
                >
                  <NextNProgress />
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
                      If you continue to violate our Community Guidelines, you
                      may be permanently banned from Framework. Please, go
                      through our policies again and make sure you understand
                      them. We would hate to see you go!
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
                    <Text mb={16}>
                      You have been permanently banned from Framework for
                      violations of our Terms of Service and/or our Community
                      Guidelines. You are not allowed to use Framework or create
                      any additional accounts. This action is irreversible.
                    </Text>

                    <Text mb={24}>
                      Ban reason:{" "}
                      <strong>
                        {pageProps != undefined &&
                          pageProps.user &&
                          pageProps.user.banReason}
                      </strong>
                    </Text>

                    <Button
                      fullWidth
                      onClick={async () =>
                        await logout().then(() => router.reload())
                      }
                    >
                      Logout
                    </Button>
                  </Modal>

                  <Dialog
                    opened={!cookieConsent.accepted && !cookieConsent.rejected}
                  >
                    <Text size="sm" mb={12}>
                      Framework and other Soodam.re services use cookies to help
                      us provide you the best experience. By continuing to use
                      our services, you agree to our use of cookies. Read our{" "}
                      <Anchor>
                        <Link href="/privacy">Privacy Policy</Link>
                      </Anchor>{" "}
                      for more information regarding your privacy and how we use
                      cookies.
                    </Text>

                    <Group grow>
                      <Button
                        onClick={() =>
                          setCookieConsent({ accepted: true, rejected: false })
                        }
                      >
                        I agree
                      </Button>

                      <Button
                        onClick={() =>
                          setCookieConsent({ accepted: false, rejected: true })
                        }
                      >
                        I do not agree
                      </Button>
                    </Group>
                  </Dialog>
                </FrameworkUserProvider>
              </NotificationsProvider>
            </UserInformationWrapper>
          </ModalsProvider>
        </MantineProvider>
      </ColorSchemeProvider>
    </>
  );
};

Framework.getInitialProps = ({ ctx }: { ctx: GetServerSidePropsContext }) => ({
  colorScheme: getCookie("mantine-color-scheme", ctx) || "light",
});

export default Framework;
