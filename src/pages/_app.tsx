import GlobalStyles from "@/components/global-styles";
import MdxComponents from "@/components/mdx-components";
import { FrameworkUserProvider } from "@/contexts/FrameworkUser";
import SocketProvider from "@/contexts/SocketContextProvider";
import { UserInformationWrapper } from "@/contexts/UserInformationDialog";
import { store } from "@/reducers/store";
import useAmoled from "@/stores/useAmoled";
import useFastFlags, { fetchFlags } from "@/stores/useFastFlags";
import "@/styles/fonts.css";
import "@/styles/framework.css";
import "@/styles/tw.css";
import components from "@/util/components";
import {
  ColorScheme,
  ColorSchemeProvider,
  MantineProvider,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { ModalsProvider } from "@mantine/modals";
import {
  NotificationsProvider,
  showNotification,
} from "@mantine/notifications";
import { MDXProvider } from "@mdx-js/react";
import { getCookie, setCookie } from "cookies-next";
import "flags.config";
import { GetServerSidePropsContext } from "next";
import { DefaultSeo } from "next-seo";
import type { AppProps } from "next/app";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useRouter } from "next/router";
import NextNProgress from "nextjs-progressbar";
import { FC, useEffect, useState } from "react";
import { HiExclamation } from "react-icons/hi";
import { Provider } from "react-redux";

const WarningModal = dynamic(() => import("@/components/warning-modal"), {
  ssr: false,
});
const SurveyModal = dynamic(() => import("@/components/survey-modal"), {
  ssr: false,
});
const CookieAcknowledgementDialog = dynamic(
  () => import("@/components/cookie-acknowledgement"),
  {
    ssr: false,
  }
);
const ResetEmailModal = dynamic(
  () => import("@/components/reset-email-modal"),
  {
    ssr: false,
  }
);
const ResetPasswordModal = dynamic(
  () => import("@/components/reset-password-modal"),
  {
    ssr: false,
  }
);
const ActiveFlow = dynamic(() => import("@/components/active-flow"), {
  ssr: false,
});

type StyleProps = {
  colorScheme: ColorScheme;
  highContrast: boolean;
  amoled: boolean;
};
type FrameworkProps = AppProps & StyleProps;

const Framework: FC<FrameworkProps> & {
  getInitialProps: ({ ctx }: { ctx: GetServerSidePropsContext }) => StyleProps;
} = (props) => {
  const { Component, pageProps } = props;
  const { setEnabled } = useAmoled();
  const { flags } = useFastFlags();

  const [colorScheme, setColorScheme] = useState<ColorScheme>(
    props.colorScheme
  );
  const [highContrast] = useState<boolean>(props.highContrast);
  const [amoled] = useState<boolean>(props.amoled);
  const [seenUnknownHost, setSeenUnknownHost] = useLocalStorage<boolean>({
    key: "@fw/seen-unknown-host",
    defaultValue: false,
  });
  const [udmuxGuard, setUdmuxGuard] = useLocalStorage<boolean>({
    key: "@fw/udmux-guard-seen",
    defaultValue: false,
  });

  const router = useRouter();

  const toggleColorScheme = (value?: ColorScheme) => {
    const nextColorScheme =
      value || (colorScheme === "dark" ? "light" : "dark");
    setColorScheme(nextColorScheme);
    setCookie("mantine-color-scheme", nextColorScheme, {
      maxAge: 60 * 60 * 24 * 30,
    });
  };
  async function initGateway() {
    await fetch("/api/gateway/initialize", {
      method: "GET",
      headers: {
        Authorization: String(getCookie(".frameworksession")),
      },
    });
  }
  async function checkUdmux() {
    if (!udmuxGuard) {
      if (Math.random() < 0.1) {
        router.push("/udmux-challenge");
      }
    }
  }

  useEffect(() => {
    router.events.on("routeChangeComplete", () => {
      fetchFlags();
      checkUdmux();
    });

    checkUdmux();

    if (
      typeof window !== "undefined" &&
      !seenUnknownHost &&
      window.location.host !== process.env.NEXT_PUBLIC_HOSTNAME
    ) {
      if (process.env.NEXT_PUBLIC_ENABLE_HOSTNAME_CHECK !== "true") return;

      showNotification({
        title: "Warning",
        message:
          `You are currently connected to ${window.location.host}, ` +
          `but you are supposed to be connected to ${process.env.NEXT_PUBLIC_HOSTNAME}. ` +
          "This may result in unexpected behavior.",
        color: "orange",
        icon: <HiExclamation />,
        autoClose: false,
      });
      setSeenUnknownHost(true);
    }

    if (pageProps && pageProps.user && typeof window !== "undefined") {
      initGateway();
    }

    return () => {
      router.events.off("routeChangeComplete", () => {
        fetchFlags();
        checkUdmux();
      });
    };
  }, []);
  useEffect(() => {
    if (flags.maintenance) {
      if (
        router.pathname !== "/maintenance" &&
        !router.pathname.startsWith("/admin")
      ) {
        router.push("/maintenance");
      }
    }
  }, [flags.maintenance]);
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
          url: "https://framework.solarius.me/",
          siteName: "Framework - Solarius",
          images: [
            {
              secureUrl: "/opengraph.png",
              url: "/opengraph.png",
              alt: "Framework SEO Banner",
              width: 800,
              height: 400,
            },
          ],
          title: "Framework",
        }}
        twitter={{
          handle: "@SolariusBV",
          site: "@SolariusBV",
          cardType: "summary_large_image",
        }}
        titleTemplate="%s | Framework"
        description="Framework is a free and open-source game platform similar to Roblox. Join the waitlist today and enter a new world."
        canonical="https://framework.solarius.me/"
        additionalMetaTags={[
          {
            name: "keywords",
            content:
              "framework, solarius, roblox, game, platform, decentralized, roblox alternative, free, open source, fediverse, new roblox",
          },
        ]}
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
              components: components(),
            }}
          >
            <GlobalStyles amoled={amoled} highContrast={highContrast} />
            <Provider store={store}>
              <ModalsProvider>
                <UserInformationWrapper>
                  <SocketProvider>
                    <MDXProvider components={MdxComponents}>
                      <NotificationsProvider
                        position="top-center"
                        zIndex={999999}
                      >
                        <FrameworkUserProvider
                          value={pageProps && pageProps.user && pageProps.user}
                        >
                          <NextNProgress />
                          <WarningModal />
                          <SurveyModal />
                          <CookieAcknowledgementDialog />
                          <ResetEmailModal />
                          <ResetPasswordModal />
                          <Component {...pageProps} key={router.asPath} />
                          {router.query.flow && <ActiveFlow />}
                        </FrameworkUserProvider>
                      </NotificationsProvider>
                    </MDXProvider>
                  </SocketProvider>
                </UserInformationWrapper>
              </ModalsProvider>
            </Provider>
          </MantineProvider>
        </div>
      </ColorSchemeProvider>
    </>
  );
};

Framework.getInitialProps = ({ ctx }) => {
  return {
    colorScheme: getCookie("mantine-color-scheme", ctx) || "dark",
    highContrast: getCookie("mantine-high-contrast", ctx),
    amoled: getCookie("mantine-amoled", ctx),
  } as unknown as StyleProps;
};

export default Framework;
