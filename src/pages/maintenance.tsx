import { useFlags } from "@happykit/flags/client";
import { Container, createStyles, Text, Title } from "@mantine/core";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";

const useStyles = createStyles((theme) => ({
  title: {
    fontSize: 26,
    fontWeight: 900,
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

  useEffect(() => {
    if (flags?.maintenanceEnabled == false) {
      router.push("/");
    }
  }), [];

  return (
    <Container size={460} my={280}>
      <Title align="center" className={classes.title}>Under maintenance</Title>
      <Text color="dimmed" size="sm" align="center">
        We are making things awesome. We will be back soon! Sorry for the
        inconvenience.
      </Text>
    </Container>
  );
};

export default Maintenance;