import { Section } from "@/components/home/friends";
import ModernEmptyState from "@/components/modern-empty-state";
import ShadedCard from "@/components/shaded-card";
import Notifications from "@/components/widgets/notifications";
import useAuthorizedUserStore from "@/stores/useAuthorizedUser";

const NotificationsWidget: React.FC = () => {
  const { user } = useAuthorizedUserStore()!;

  return (
    <>
      <Section
        title="Notifications"
        description="Quick management of your notifications."
      />
      {user?.notifications.length! > 0 ? (
        <ShadedCard>
          <Notifications />
        </ShadedCard>
      ) : (
        <ShadedCard className="flex w-full justify-center items-center">
          <ModernEmptyState
            title="No notifications"
            body="You're all caught up!"
          />
        </ShadedCard>
      )}
    </>
  );
};

export default NotificationsWidget;
