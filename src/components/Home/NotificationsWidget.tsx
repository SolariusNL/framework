import { Section } from "@/components/Home/FriendsWidget";
import ModernEmptyState from "@/components/ModernEmptyState";
import ShadedCard from "@/components/ShadedCard";
import Notifications from "@/components/Widgets/Notifications";
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
