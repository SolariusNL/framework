import { useFlags } from "@happykit/flags/client";
import { Button, Container, createStyles, Text, Title } from "@mantine/core";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import MinimalFooter from "../components/MinimalFooter";
import useMediaQuery from "../util/media-query";

const useStyles = createStyles((theme) => ({
  title: {
    fontSize: 26,
    fontWeight: 600,
  },

  controls: {
    [theme.fn.smallerThan("xs")]: {
      flexDirection: "column-reverse",
    },
  },

  control: {
    [theme.fn.smallerThan("xs")]: {
      width: "100%",
      textAlign: "center",
    },
  },
}));

const Maintenance: NextPage = () => {
  const { classes } = useStyles();
  const { flags } = useFlags();
  const router = useRouter();
  const mobile = useMediaQuery("768");

  useEffect(() => {
    if (flags?.maintenanceEnabled == false) {
      router.push("/");
    }
  }),
    [];

  return (
    <Container size={460} my={200}>
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
      <Title align="center" className={classes.title}>
        Under maintenance
      </Title>
      <Text color="dimmed" size="sm" align="center" mb={24}>
        We are making things awesome. We will be back soon! Sorry for the
        inconvenience.
      </Text>
      <a
        href="https://status.soodam.rocks"
        target="_blank"
        rel="noreferrer"
        className="w-full flex justify-center no-underline mb-10"
      >
        <Button>View updates at our status page</Button>
      </a>
      <MinimalFooter noLinks />
    </Container>
  );
};

export default Maintenance;
