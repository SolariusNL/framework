import "../styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { MantineProvider } from "@mantine/core";
import NextNProgress from "nextjs-progressbar";
import { NotificationsProvider } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";

const Framework = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Head>
        <title>Framework</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>

      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          colorScheme: "light",
          fontFamily: "Inter var",
          defaultRadius: "md",
        }}
      >
        <NextNProgress />
        <NotificationsProvider position="top-center">
          <ModalsProvider>
            <Component {...pageProps} />
          </ModalsProvider>
        </NotificationsProvider>
      </MantineProvider>
    </>
  );
};

export default Framework;
