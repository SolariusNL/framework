import "../styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { MantineProvider } from "@mantine/core";

const Framework = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Head>
        <title>Framework</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
      </Head>

      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          colorScheme: "light",
          fontFamily: "Inter var",
          defaultRadius: "md"
        }}
      >
        <Component {...pageProps} />
      </MantineProvider>
    </>
  );
};

export default Framework;
