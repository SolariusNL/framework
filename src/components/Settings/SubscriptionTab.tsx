import {
  Button,
  Card,
  Group,
  Text,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { PremiumSubscriptionType } from "@prisma/client";
import { HiClock, HiGift, HiStop } from "react-icons/hi";
import { User } from "../../util/prisma-types";
import { getSubscriptionTypeString } from "../../util/universe/subscription";
import SettingsTab from "./SettingsTab";
import SideBySide from "./SideBySide";

interface SubscriptionTabProps {
  user: User;
}

const SubscriptionTab = ({ user }: SubscriptionTabProps) => {
  const premium = user.premium;
  const { colorScheme } = useMantineColorScheme();

  return (
    <SettingsTab tabValue="subscriptions" tabTitle="Subscriptions">
      <Text mb={16}>Manage your Framework subscriptions.</Text>

      <SideBySide
        title="Current Subscription"
        description="Details about your current subscription, including payment method, billing cycle, and more."
        right={
          <Card withBorder shadow="sm" p="md">
            <div
              style={{
                display: "flex",
                gap: 26,
              }}
            >
              <div>
                {premium ? (
                  <HiGift size={64} />
                ) : (
                  <HiGift size={64} style={{ opacity: 0.5 }} />
                )}
              </div>
              <div>
                <Title order={5} mb={16}>
                  {premium ? "Premium" : "Free"}
                </Title>
                <Text>
                  {premium
                    ? "You are currently subscribed to the Premium plan."
                    : "You're currently on the Free plan."}
                </Text>
                {premium && (
                  <div
                    style={{
                      marginTop: 16,
                    }}
                  >
                    {[
                      {
                        property: new Date(
                          user.premiumSubscription?.expiresAt as Date
                        ).toLocaleDateString(),
                        icon: HiClock,
                        label: "Next Renewal",
                      },
                      {
                        property: new Date(
                          user.premiumSubscription?.createdAt as Date
                        ).toLocaleDateString(),
                        icon: HiClock,
                        label: "Started",
                      },
                      {
                        property: getSubscriptionTypeString(
                          user.premiumSubscription
                            ?.type as PremiumSubscriptionType
                        ),
                        icon: HiGift,
                        label: "Tier",
                      },
                    ].map((stat) => (
                      <div
                        style={{
                          display: "flex",
                          gap: 6,
                          alignItems: "center",
                        }}
                        key={Math.floor(Math.random() * 100000)}
                      >
                        <stat.icon
                          size={14}
                          color={colorScheme === "dark" ? "#909296" : "#868e96"}
                        />
                        <Group spacing={6}>
                          <Text size="sm" color="dimmed" weight={650}>
                            {stat.label}
                          </Text>
                          <Text size="sm" color="dimmed">
                            {stat.property}
                          </Text>
                        </Group>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        }
        actions={
          premium && <Button leftIcon={<HiStop />}>Cancel Subscription</Button>
        }
      />
    </SettingsTab>
  );
};

export default SubscriptionTab;
