import {
  Badge,
  Button,
  Card,
  Center,
  Group,
  Text,
  ThemeIcon,
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
          <Card shadow="sm" p="lg" withBorder>
            <div
              style={{
                display: "flex",
                gap: 26,
              }}
            >
              <div>
                <ThemeIcon size={64} variant="light" color="pink" radius="lg">
                  {premium ? (
                    <HiGift size={48} />
                  ) : (
                    <HiGift size={48} style={{ opacity: 0.5 }} />
                  )}
                </ThemeIcon>
              </div>
              <div>
                <Badge size="lg" color="pink" mb={16}>
                  {premium ? "Premium" : "Free"}
                </Badge>
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

            {premium && (
              <Center mt={16}>
                <Button.Group>
                  <Button size="xs" variant="light" color="pink">
                    Manage
                  </Button>
                  <Button size="xs" variant="light" color="pink">
                    Cancel
                  </Button>
                </Button.Group>
              </Center>
            )}
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
