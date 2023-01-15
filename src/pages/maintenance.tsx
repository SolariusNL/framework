import { useFlags } from "@happykit/flags/client";
import {
  Anchor,
  Button,
  Container,
  createStyles,
  Text,
  Title,
} from "@mantine/core";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import MinimalFooter from "../components/MinimalFooter";

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

  useEffect(() => {
    if (flags?.maintenanceEnabled == false) {
      router.push("/");
    }
  }),
    [];

  return (
    <Container size={460} my={200}>
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
