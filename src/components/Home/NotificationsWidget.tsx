import useAuthorizedUserStore from "../../stores/useAuthorizedUser";
import ModernEmptyState from "../ModernEmptyState";
import ShadedCard from "../ShadedCard";
import Notifications from "../Widgets/Notifications";
import { Section } from "./FriendsWidget";

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
