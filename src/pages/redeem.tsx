import {
  Button,
  Container,
  createStyles,
  Group,
  Paper,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useViewportSize } from "@mantine/hooks";
import { GiftCodeGrant } from "@prisma/client";
import { getCookie } from "cookies-next";
import { GetServerSidePropsContext, NextPage } from "next";
import React from "react";
import Framework from "../components/Framework";
import authorizedRoute from "../util/authorizedRoute";
import { User } from "../util/prisma-types";
import Celebration from "react-confetti";

export const useStylesredeemCard = createStyles((theme) => ({
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

interface RedeemProps {
  user: User;
}

export const grantInformation: {
  [key in GiftCodeGrant]: {
    message: string;
  };
} = {
  FIVETHOUSAND_TICKETS: {
    message: "You have redeemed 5,000 tickets!",
  },
  PREMIUM_ONE_MONTH: {
    message: "You have redeemed Framework Premium for 1 month!",
  },
  PREMIUM_ONE_YEAR: {
    message: "You have redeemed Framework Premium for 1 year!",
  },
  PREMIUM_SIX_MONTHS: {
    message: "You have redeemed Framework Premium for 6 months!",
  },
  SIXTEENTHOUSAND_TICKETS: {
    message: "You have redeemed 16,000 tickets!",
  },
  THOUSAND_TICKETS: {
    message: "You have redeemed 1,000 tickets!",
  },
  TWOTHOUSAND_TICKETS: {
    message: "You have redeemed 2,000 tickets!",
  },
};

const Redeem: NextPage<RedeemProps> = ({ user }) => {
  const { classes } = useStylesredeemCard();

  const [redeemed, setRedeemed] = React.useState(false);
  const [reward, setReward] = React.useState<GiftCodeGrant | null>(null);
  const [enteredCode, setEnteredCode] = React.useState("");

  const [error, setError] = React.useState<string | null>(null);
  const { width, height } = useViewportSize();
  const [isClient, setClient] = React.useState(false);

  React.useEffect(() => {
    setClient(true);

    if (typeof window !== "undefined" && window.location.search) {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("autofill");
      if (code) {
        setEnteredCode(code);
      }
    }
  }, []);

  const handleRedeem = async () => {
    await fetch(`/api/gift/redeem/${enteredCode}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setRedeemed(true);
          setReward(res.reward);
        } else {
          setError(res.message);
        }
      })
      .catch((err) => {
        setError(err.message);
      });
  };

  return (
    <Framework user={user} activeTab="none">
      <Container size={460} my={30}>
        {redeemed ? (
          <>
            <Title className={classes.title} align="center">
              {grantInformation[reward!].message}
            </Title>
            <Text color="dimmed" size="sm" align="center">
              Your reward should be present in your account in less than 5
              minutes.
            </Text>
            {isClient && <Celebration width={width} height={height} />}
          </>
        ) : (
          <>
            <Title className={classes.title} align="center">
              Redeem gift codes
            </Title>
            <Text color="dimmed" size="sm" align="center">
              Enter your gift code below to redeem your gift! Each code may only
              be redeemed once, and will be invalidated after use.
            </Text>

            <Paper withBorder shadow="md" p={30} radius="md" mt="xl">
              <TextInput
                label="Code"
                placeholder="0000-0000-0000-0000-0000"
                required
                value={enteredCode}
                onChange={(e) => {
                  setEnteredCode(e.target.value);
                  setError(null);
                }}
                {...(error ? { error: error || "Invalid code" } : {})}
              />
              <Group position="apart" mt="lg" className={classes.controls}>
                <Button
                  className={classes.control}
                  fullWidth
                  onClick={handleRedeem}
                >
                  Redeem
                </Button>
              </Group>
            </Paper>
          </>
        )}
      </Container>
    </Framework>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return await authorizedRoute(context, true, false);
}

export default Redeem;
