import { Text, Title } from "@mantine/core";
import { useEffect, useState } from "react";
import { useFrameworkUser } from "../../contexts/FrameworkUser";
import ModernEmptyState from "../ModernEmptyState";
import ShadedCard from "../ShadedCard";

const SubscriptionWidget: React.FC = () => {
  const user = useFrameworkUser()!;

  const msPerMinute = 60 * 1000;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;
  const msPerMonth = msPerDay * 30;
  const msPerYear = msPerDay * 365;

  const [elapsed, setElapsed] = useState<number>(-0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setElapsed(
        new Date(user.premiumSubscription?.expiresAt as Date).getTime() -
          new Date().getTime()
      );
    }
  }, []);

  return (
    <ShadedCard withBorder>
      {user.premium ? (
        <div className="flex flex-col justify-center items-center">
          <Text weight={500} mb={12} color="dimmed">
            Your subscription renews in
          </Text>
          <Title order={3}>
            {elapsed < msPerMinute
              ? "less than a minute"
              : elapsed < msPerHour
              ? Math.round(elapsed / msPerMinute) + " minutes"
              : elapsed < msPerDay
              ? Math.round(elapsed / msPerHour) + " hours"
              : elapsed < msPerMonth
              ? Math.round(elapsed / msPerDay) + " days"
              : elapsed < msPerYear
              ? Math.round(elapsed / msPerMonth) + " months"
              : Math.round(elapsed / msPerYear) + " years"}
          </Title>
        </div>
      ) : (
        <ModernEmptyState
          title="No subscription"
          body="You are not subscribed to Framework Premium."
        />
      )}
    </ShadedCard>
  );
};

export default SubscriptionWidget;
