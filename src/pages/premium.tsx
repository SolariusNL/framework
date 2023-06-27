import {
  Anchor,
  Group,
  Stack,
  Text,
  Title,
  UnstyledButton,
} from "@mantine/core";
import { PremiumSubscriptionType } from "@prisma/client";
import { GetServerSidePropsContext, NextPage } from "next";
import { HiArrowRight, HiCheckCircle } from "react-icons/hi";
import Framework from "@/components/Framework";
import authorizedRoute from "@/util/auth";
import useMediaQuery from "@/util/media-query";
import { User } from "@/util/prisma-types";

interface PremiumProps {
  user: User;
}

const Premium: NextPage<PremiumProps> = ({ user }) => {
  const premiumFeatures = [
    [
      "Get early access to new features",
      "You'll be the first to try out new features before they're released to the public, and you'll be able to give feedback on them to help us improve them.",
    ],
    [
      "Access to higher dedicated server tiers",
      "You'll be able to access higher tiers of dedicated servers, which will give you more resources and better performance in your games.",
    ],
    [
      "Be the first to hear about new updates",
      "You'll be the first to hear about new updates to the Framework platform, and you'll be able to give feedback on them to help us improve them, similar to early access features.",
    ],
    [
      "Free access to all Solarius services for life",
      "You'll be able to access all Solarius services for free for life, including Framework, Asura, and more.",
    ],
    [
      "Yearly merchandise",
      "Every year, you'll receive a piece of merchandise from us, such as a t-shirt, mug, or other item.",
    ],
    [
      "Love from the Solarius team",
      "You'll be helping us keep the lights on, and we can't thank you enough for that.",
    ],
    [
      "Monthly Tickets",
      "Depending on your tier, you'll receive a certain amount of tickets every month (up to 128,000 on the Lifetime tier), which you can spend in the catalog, and more.",
    ],
  ];

  const plans = [
    {
      name: "Premium Bronze",
      price: [["€4", "EUR"]],
      popular: false,
      disabled:
        user.premiumSubscription &&
        user.premiumSubscription.type ===
          PremiumSubscriptionType.PREMIUM_ONE_MONTH,
    },
    {
      name: "Premium Silver",
      price: [["€26", "EUR"]],
      popular: true,
      disabled:
        user.premiumSubscription &&
        user.premiumSubscription.type ===
          PremiumSubscriptionType.PREMIUM_SIX_MONTHS,
    },
    {
      name: "Premium Gold",
      price: [["€40", "EUR"]],
      popular: false,
      disabled:
        user.premiumSubscription &&
        user.premiumSubscription.type ===
          PremiumSubscriptionType.PREMIUM_ONE_YEAR,
    },
    {
      name: "Premium Lifetime",
      price: [["€399", "EUR"]],
    },
  ];

  const mobile = useMediaQuery("768");

  return (
    <Framework
      activeTab="none"
      user={user}
      modernTitle="Framework Premium"
      modernSubtitle="Framework Premium is a premium subscription that is considered a donation to the Framework project, to help us keep the project alive and running. It also gives you access to some cool perks! This is for you if you love Framework and want to support us in the long run, and support our cause of creating a free, and open source web."
    >
      <Group
        grow={!mobile}
        sx={{
          alignItems: "flex-start",
        }}
      >
        <Group>
          <Stack spacing={3}>
            <Title order={3}>Premium Features</Title>
            <Text color="dimmed" weight={500} size="sm" mb={20}>
              What you get when you subscribe to Framework Premium
            </Text>

            <Stack spacing={6}>
              {premiumFeatures.map((feature) => (
                <div
                  style={{
                    display: "flex",
                    gap: "16px",
                  }}
                  key={feature[0]}
                >
                  <div>
                    <HiCheckCircle size={24} color="#20C997" />
                  </div>
                  <Group>
                    <Stack spacing={3}>
                      <Text weight={700}>{feature[0]}</Text>
                      <Text color="dimmed" size="sm">
                        {feature[1]}
                      </Text>
                    </Stack>
                  </Group>
                </div>
              ))}
            </Stack>
          </Stack>
        </Group>

        <Group>
          <Stack spacing={3}>
            <Title order={3}>Pricing and Plans</Title>
            <Text color="dimmed" weight={500} size="sm" mb={20}>
              How much does Framework Premium cost?
            </Text>

            <Stack
              spacing={6}
              sx={{
                width: "100%",
              }}
            >
              {plans.map((plan) => (
                <UnstyledButton
                  sx={(theme) => ({
                    padding: theme.spacing.xs,
                    borderRadius: theme.radius.md,
                    color:
                      theme.colorScheme === "dark"
                        ? theme.colors.dark[0]
                        : theme.black,
                    "&:hover": {
                      backgroundColor:
                        theme.colorScheme === "dark"
                          ? theme.colors.dark[6]
                          : theme.colors.gray[0],
                    },
                    width: "100%",
                    ...(plan.disabled && {
                      opacity: 50,
                    }),
                  })}
                  key={plan.name}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "16px",
                      width: "100%",
                    }}
                  >
                    <div>
                      <HiArrowRight size={24} color="#9775FA" />
                    </div>
                    <Group>
                      <Stack spacing={3}>
                        <Title order={4}>{plan.name}</Title>
                        <Text color="dimmed" size="sm" mb={8}>
                          <div style={{ display: "flex", gap: "4px" }}>
                            {plan.price.map((price, i) => (
                              <>
                                <span key={price[0]}>
                                  {price[0]} {price[1]}
                                </span>

                                {plans[plans.length - 1].name !== plan.name && (
                                  <>
                                    <span key={price[1]}>&#8226;</span>

                                    <span>per month</span>
                                  </>
                                )}
                              </>
                            ))}
                          </div>
                        </Text>

                        {plan.name !== "No Subscription" && (
                          <Anchor>
                            <HiArrowRight
                              style={{
                                marginRight: 6,
                              }}
                            />
                            Purchase
                          </Anchor>
                        )}
                      </Stack>
                    </Group>
                  </div>
                </UnstyledButton>
              ))}

              <Text color="dimmed" size="xs" mb={4}>
                * All prices are in USD, CAD, and EUR. Prices may vary depending
                on your location. Local taxes may apply depending on your
                location. All prices are subject to change. Solarius, Framework,
                and other Solarius services are trademarks of Solarius.
              </Text>

              <Text color="dimmed" size="xs">
                * Refunds *may* not be available for Framework Premium. If you
                have any questions, please contact us at our support email. We
                will respond to you as soon as possible, and we will do our best
                to help you.
              </Text>
            </Stack>
          </Stack>
        </Group>
      </Group>
    </Framework>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return await authorizedRoute(context, true, false);
}

export default Premium;
