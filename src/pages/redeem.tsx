import Framework from "@/components/framework";
import ShadedCard from "@/components/shaded-card";
import authorizedRoute from "@/util/auth";
import useMediaQuery from "@/util/media-query";
import { User } from "@/util/prisma-types";
import {
  Accordion,
  Anchor,
  Button,
  createStyles,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useViewportSize } from "@mantine/hooks";
import { GiftCodeGrant } from "@prisma/client";
import { getCookie } from "cookies-next";
import { GetServerSidePropsContext, NextPage } from "next";
import Link from "next/link";
import React from "react";
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
  const mobile = useMediaQuery("768");

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
    <Framework
      user={user}
      activeTab="none"
      modernTitle="Redeem gift code"
      modernSubtitle="Redeem a gift code to get free to retrieve your reward!"
    >
      <Group
        grow={!mobile}
        sx={{
          alignItems: "flex-start",
        }}
      >
        <Group>
          <Stack spacing={12}>
            <div>
              <Text color="dimmed" weight={500} mb={8}>
                Redeem Code
              </Text>
              <Title order={3} mb={24}>
                Redeem a gift code
              </Title>
            </div>

            <Text mb={24}>
              Enter your gift card in the input to redeem its reward. If you
              have a code to redeem, you came to the right place!
            </Text>

            <Accordion defaultValue="info">
              <Accordion.Item value="info">
                <Accordion.Control>About gift codes</Accordion.Control>
                <Accordion.Panel>
                  Gift codes are digital codes that can be redeemed for rewards
                  such as tickets or Framework Premium on Framework. Gift codes
                  can be obtained from giveaways, events, or promotions. If you
                  have a code to redeem, you came to the right place!
                </Accordion.Panel>
              </Accordion.Item>
              <Accordion.Item value="legal">
                <Accordion.Control>Legal</Accordion.Control>
                <Accordion.Panel>
                  Gift codes are not transferable and cannot be resold. Gift
                  codes are not redeemable for cash. Off-platform giveaways (on
                  platforms not associated with Solarius or Framework) are not
                  endorsed by us and are conducted at the sole discretion of the
                  giveaway organizer. We are not responsible for any issues that
                  may arise from the giveaway organizer.
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </Stack>
        </Group>
        <Group className="w-full">
          <ShadedCard
            sx={(theme) => ({
              width: "100%",
              backgroundColor:
                theme.colorScheme === "dark"
                  ? theme.colors.dark[9]
                  : theme.colors.gray[0],
            })}
          >
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
                <TextInput
                  label="Code"
                  placeholder="0000-0000-0000-0000-0000"
                  required
                  mb={16}
                  description="Enter the code you want to redeem"
                  value={enteredCode}
                  onChange={(e) => {
                    setEnteredCode(e.target.value);
                    setError(null);
                  }}
                  {...(error ? { error: error || "Invalid code" } : {})}
                />
                <Button
                  className={classes.control}
                  fullWidth
                  onClick={handleRedeem}
                >
                  Redeem
                </Button>
              </>
            )}
          </ShadedCard>
          <Text size="sm" color="dimmed">
            Terms and conditions apply. Abuse of this system may result in
            moderation of your account. If you have any questions, please
            contact us at our{" "}
            <Link href="/support" passHref>
              <Anchor>support</Anchor>
            </Link>{" "}
            page.
          </Text>
        </Group>
      </Group>
    </Framework>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return await authorizedRoute(context, true, false);
}

export default Redeem;
