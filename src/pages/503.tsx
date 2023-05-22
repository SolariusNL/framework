import { Container, Text, Title } from "@mantine/core";
import { NextPage } from "next";
import { errorTitle } from "./404";

const ServiceUnavailable: NextPage = () => {
  const { classes } = errorTitle();

  return (
    <Container className={classes.root}>
      <div className={classes.label}>503</div>
      <Title className={classes.title}>Service Unavailable</Title>
      <Text
        color="dimmed"
        size="lg"
        align="center"
        className={classes.description}
      >
        We apologize for the inconvenience. The feature you are trying to access
        is temporarily disabled for maintenance or upgrades, or is unavailable
        due to an outage. Thank you for your patience.
      </Text>
    </Container>
  );
};

export default ServiceUnavailable;
