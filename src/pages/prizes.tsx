import Framework from "@/components/framework";
import Bit from "@/icons/Bit";
import authorizedRoute from "@/util/auth";
import clsx from "@/util/clsx";
import { User } from "@/util/prisma-types";
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
import React from "react";
import Celebration from "react-confetti";

export const useStyles = createStyles((theme) => ({
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
  const { classes, theme } = useStyles();
  const { width, height } = useViewportSize();
  const [finished, setFinished] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [prizeData, setPrizeData] = React.useState<{
    success: boolean;
    earned: number;
  }>();
  const [isClient, setClient] = React.useState(false);

  React.useEffect(() => {
    setClient(true);
  }, []);

  React.useEffect(() => {
    if (user && !user.emailVerified)
      setError("You must verify your email to claim prizes.");
  }, [user]);

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
    <Framework
      user={user}
      activeTab="none"
      modernTitle="Daily Prize"
      modernSubtitle="Claim your daily prize!"
    >
      <Container size={460} my={30}>
        {finished && prizeData ? (
          <>
            <div className="flex items-center justify-center gap-6 mb-6">
              <Bit
                color={theme.colors.violet[3]}
                className="flex-shrink-0 w-12 h-12"
              />
              <Title align="center">You won {prizeData.earned} Bits!</Title>
            </div>
            <Text color="dimmed" align="center">
              Your Bits should be added to your account shortly.
            </Text>
            {isClient && <Celebration width={width} height={height} />}
          </>
        ) : (
          <>
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
              className={clsx(classes.control, "transition-all")}
              fullWidth
              onClick={handlePrize}
              mt={24}
              disabled={
                new Date(user.lastRandomPrize!).getTime() >
                  Date.now() - 24 * 60 * 60 * 1000 || !user.emailVerified
              }
              loading={loading}
              size="lg"
            >
              Claim prize
            </Button>

            {error && (
              <Alert color="red" title="Error" mt={12}>
                {error}
              </Alert>
            )}
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
