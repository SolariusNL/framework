import { Anchor, Container, createStyles, Text, Title } from "@mantine/core";
import { GetServerSidePropsContext, NextPage } from "next";
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

const Link: NextPage = () => {
  const { classes } = useStyles();
  const router = useRouter();
  const url = router.query.url as string;

  useEffect(() => {
    setTimeout(() => {
      router.push(url).catch(() => {});
    }, 5000);
  }),
    [];

  return (
    <Container size={460} my={280}>
      <Title align="center" className={classes.title}>
        You are being redirected
      </Title>
      <Text color="dimmed" size="sm" align="center">
        You will be redirected to <Anchor href={url}>{url}</Anchor> in a few
        seconds.
      </Text>
    </Container>
  );
};

export default Link;
