import "../styles/framework.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import {
  Anchor,
  Button,
  ColorScheme,
  ColorSchemeProvider,
  Dialog,
  Group,
  MantineProvider,
  Modal,
  Text,
} from "@mantine/core";
import NextNProgress from "nextjs-progressbar";
import { NotificationsProvider } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";
import { useLocalStorage } from "@mantine/hooks";
import Link from "next/link";
import { setCookie } from "../util/cookies";
import { useRouter } from "next/router";
import "../../flags.config";
import { useFlags } from "@happykit/flags/client";
import { useEffect } from "react";

const Framework = ({ Component, pageProps }: AppProps) => {
  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: "mantine-color-scheme",
    defaultValue: "light",
    getInitialValueInEffect: true,
  });

  const [cookieConsent, setCookieConsent] = useLocalStorage<{
    accepted: boolean;
    rejected: boolean;
  }>({
    key: "soodam-cookie-consent",
    defaultValue: { accepted: false, rejected: false },
  });

  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  const router = useRouter();
  const { flags } = useFlags();

  useEffect(() => {
    if (flags?.maintenanceEnabled == true) {
      if (router.pathname !== "/maintenance") {
        router.push("/maintenance");
      }
    }
  }), [];

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
          }}
        >
          <ModalsProvider>
            <NotificationsProvider position="top-center">
              <NextNProgress />
              <Component {...pageProps} />
              <Modal
                withCloseButton={false}
                opened={pageProps.user && pageProps.user.banned}
                onClose={() => null}
              >
                <Text mb={16}>
                  You have been permanently banned from Framework for violations
                  of our Terms of Service and/or our Community Guidelines. You
                  are not allowed to use Framework or create any additional
                  accounts. This action is irreversible.
                </Text>

                <Text mb={24}>
                  Ban reason:{" "}
                  <strong>{pageProps.user && pageProps.user.banReason}</strong>
                </Text>

                <Button fullWidth onClick={() => {
                  setCookie(".frameworksession", "", -365);
                  router.push("/login");
                }}>
                  Logout
                </Button>
              </Modal>

              <Dialog
                opened={!cookieConsent.accepted && !cookieConsent.rejected}
              >
                <Text size="sm" mb={12}>
                  Framework and other Soodam.re services use cookies to help us
                  provide you the best experience. By continuing to use our
                  services, you agree to our use of cookies. Read our{" "}
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
            </NotificationsProvider>
          </ModalsProvider>
        </MantineProvider>
      </ColorSchemeProvider>
    </>
  );
};

export default Framework;
