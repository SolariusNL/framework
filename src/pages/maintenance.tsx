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
  }),
    [];

  return (
    <Container size={460} my={280}>
      <Title align="center" className={classes.title}>
        Under maintenance
      </Title>
      <Text color="dimmed" size="sm" align="center" mb={24}>
        We are making things awesome. We will be back soon! Sorry for the
        inconvenience.
      </Text>
      <Text color="dimmed" size="sm" align="center">
        We typically go down for maintenance every 2 weeks on Tuesday at 3:00 AM
        Central Daylight Time (CDT) and remain offline for 1-3 hours. During
        this time, we will be performing routine maintenance and upgrades to our
        servers, this may include migrating to a new version, upgrading our
        hardware/software, or performing other maintenance tasks that require
        the site to be offline.
      </Text>
    </Container>
  );
};

export default Maintenance;
