import { Container, Text, Title } from "@mantine/core";
import { NextPage } from "next";
import { errorTitle } from "./404";

const Forbidden: NextPage = () => {
  const { classes } = errorTitle();

  return (
    <Container className={classes.root}>
      <div className={classes.label}>403</div>
      <Title className={classes.title}>An error has occurred.</Title>
      <Text color="dimmed" size="lg" align="center" className={classes.description}>
        We are sorry, but we are having trouble processing your request. Please try again later.
      </Text>
    </Container>
  );
};

export default Forbidden;