import SettingsTab from "@/components/Settings/SettingsTab";
import SideBySide from "@/components/Settings/SideBySide";
import ShadedCard from "@/components/ShadedCard";
import useAuthorizedUserStore from "@/stores/useAuthorizedUser";
import IResponseBase from "@/types/api/IResponseBase";
import fetchJson from "@/util/fetch";
import { User } from "@/util/prisma-types";
import { getSubscriptionTypeString } from "@/util/universe/subscription";
import {
  Badge,
  Button,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { PremiumSubscriptionType } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { HiCheck, HiCreditCard, HiInformationCircle } from "react-icons/hi";

interface SubscriptionTabProps {
  user: User;
}

const SubscriptionTab = ({ user: _user }: SubscriptionTabProps) => {
  const { colors } = useMantineTheme();
  const { user, setUser } = useAuthorizedUserStore()!;
  const [manageSubscriptionLoading, setManageSubscriptionLoading] =
    useState(false);
  const router = useRouter();

  const handleManageSubscription = async () => {
    setManageSubscriptionLoading(true);
    await fetchJson<IResponseBase<{ url: string }>>(
      "/api/checkout/createportal",
      {
        method: "POST",
        auth: true,
      }
    ).then((res) => {
      if (res.success && res.data) {
        router.push(res.data.url);
      }
    });
  };

  return (
    <SettingsTab tabValue="subscriptions" tabTitle="Billing">
      <SideBySide
        title="Framework Premium"
        description="Support the development of Framework and get access to exclusive features."
        noUpperBorder
        shaded
        actions={
          <>
            {user?.premium && user.premiumSubscription ? (
              <>
                {(user.premiumSubscription.type as PremiumSubscriptionType) !==
                  PremiumSubscriptionType.PREMIUM_ONE_YEAR && (
                  <Button
                    leftIcon={<HiCreditCard />}
                    variant="gradient"
                    gradient={{
                      from: colors.pink[8],
                      to: colors.grape[8],
                    }}
                    fullWidth
                    mb="xs"
                    onClick={() => handleManageSubscription()}
                    loading={manageSubscriptionLoading}
                  >
                    Manage subscription
                  </Button>
                )}
                <div className="flex items-start gap-2 mt-4">
                  <HiInformationCircle
                    size={20}
                    className="text-indigo-600 flex-shrink-0"
                  />
                  <div>
                    <Text className="text-indigo-500 font-semibold">
                      Notice
                    </Text>
                    <Text color="dimmed" size="sm">
                      When you cancel your subscription, one more billing cycle
                      will take place to ensure your entire subscription is paid
                      for.
                    </Text>
                  </div>
                </div>
              </>
            ) : (
              <Link href="/premium" passHref>
                <Button
                  variant="gradient"
                  fullWidth
                  gradient={{
                    from: colors.pink[8],
                    to: colors.grape[8],
                  }}
                >
                  Subscribe
                </Button>
              </Link>
            )}
          </>
        }
        right={
          <ShadedCard className="flex flex-col items-center justify-center">
            <Badge
              variant={user?.premium ? "gradient" : "light"}
              gradient={{
                from: colors.pink[8],
                to: colors.grape[8],
              }}
              mb="sm"
            >
              {user?.premium ? "Active" : "Inactive"}
            </Badge>
            <Title order={4} mb="sm">
              {user?.premium ? "Premium Member" : "Framework Free Plan"}
            </Title>
            {user?.premium && user?.premiumSubscription ? (
              <>
                <Stack spacing={3} mb="md">
                  {[
                    "Pre-release access to new features",
                    "Monthly tickets",
                    "Priority support",
                    "Access to exclusive content",
                    "Love from the Framework team",
                    "Free access to Solarius services for life",
                  ].map((feature) => (
                    <div className="flex items-center gap-2" key={feature}>
                      <HiCheck
                        color={colors.green[4]}
                        size={18}
                        className="flex-shrink-0"
                      />
                      <Text size="sm" color="dimmed">
                        {feature}
                      </Text>
                    </div>
                  ))}
                </Stack>
                <Stack spacing={3}>
                  {[
                    [
                      "Plan",
                      getSubscriptionTypeString(user.premiumSubscription.type),
                    ],
                    [
                      "Next gift",
                      new Date(
                        new Date(
                          user.premiumSubscription.lastReward
                        ).getTime() +
                          1000 * 60 * 60 * 24 * 30
                      ).toLocaleDateString(),
                    ],
                  ].map(([label, value]) => (
                    <div className="flex items-center gap-2" key={label}>
                      <Text size="sm" color="dimmed">
                        {label}
                      </Text>
                      <Text size="sm" color="dimmed" weight={500}>
                        {value}
                      </Text>
                    </div>
                  ))}
                </Stack>
              </>
            ) : (
              <Text color="dimmed" align="center">
                You are not subscribed to Framework Premium. Why not give it a
                try?
              </Text>
            )}
          </ShadedCard>
        }
      />
    </SettingsTab>
  );
};

export default SubscriptionTab;
