import {
  Alert,
  Button,
  Container,
  createStyles,
  Text,
  Title,
} from "@mantine/core";
import { useViewportSize } from "@mantine/hooks";
import { getCookie } from "cookies-next";
import { GetServerSidePropsContext, NextPage } from "next";
import Link from "next/link";
import React from "react";
import Celebration from "react-confetti";
import Framework from "../components/Framework";
import authorizedRoute from "../util/authorizedRoute";
import { User } from "../util/prisma-types";

export const useStyles = createStyles((theme) => ({
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

interface PrizesProps {
  user: User;
}

const Prizes: NextPage<PrizesProps> = ({ user }) => {
  const { classes } = useStyles();

  const [finished, setFinished] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [prizeData, setPrizeData] = React.useState<{
    success: boolean;
    message: string;
    code: string;
  }>();

  const { width, height } = useViewportSize();
  const [isClient, setClient] = React.useState(false);

  React.useEffect(() => {
    setClient(true);
  }, []);

  const handlePrize = async () => {
    setLoading(true);

    await fetch("/api/gift/randomPrize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setPrizeData(res);
          setFinished(true);
        } else {
          setError(String(res.message) || "An unknown error occurred.");
        }
      })
      .catch((err) => {
        setError(String(err.message) || "An unknown error occurred.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Framework user={user} activeTab="none">
      <Container size={460} my={30}>
        {finished && prizeData ? (
          <>
            <Title className={classes.title} align="center" mb={36}>
              Congratulations! {String(prizeData.message)}
            </Title>

            <Link href={`/redeem?autofill=${prizeData.code}`} passHref>
              <Button component="a" fullWidth>
                Redeem your prize!
              </Button>
            </Link>
            {isClient && <Celebration width={width} height={height} />}
          </>
        ) : (
          <>
            <Title className={classes.title} align="center">
              Your daily prize
            </Title>
            <Text color="dimmed" size="sm" align="center">
              You can get a random prize every day. Click the button below to
              claim your prize! Note that if we determine that you are using an
              automated tool to claim prizes, your account will be deleted with
              no prior notice.
            </Text>

            {new Date(user.lastRandomPrize!).getTime() >
              Date.now() - 24 * 60 * 60 * 1000 && (
              <Alert color="red" title="Come back tomorrow" mt={12}>
                You have already redeemed your prize today. Come back tomorrow
                to receive another prize.
              </Alert>
            )}

            <Button
              className={classes.control}
              fullWidth
              onClick={handlePrize}
              mt={24}
              disabled={
                new Date(user.lastRandomPrize!).getTime() >
                Date.now() - 24 * 60 * 60 * 1000
              }
              loading={loading}
            >
              Get your daily prize
            </Button>
          </>
        )}
      </Container>
    </Framework>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return await authorizedRoute(context, true, false);
}

export default Prizes;
