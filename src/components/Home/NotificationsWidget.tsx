import useAuthorizedUserStore from "../../stores/useAuthorizedUser";
import ModernEmptyState from "../ModernEmptyState";
import ShadedCard from "../ShadedCard";
import Notifications from "../Widgets/Notifications";

const NotificationsWidget: React.FC = () => {
  const { user } = useAuthorizedUserStore()!;

  return (
    <ShadedCard withBorder solid>
      {user?.notifications.length! > 0 ? (
        <Notifications />
      ) : (
        <div className="flex w-full justify-center items-center">
          <ModernEmptyState
            title="No notifications"
            body="Nothing to see here."
          />
        </div>
      )}
    </ShadedCard>
  );
};

export default NotificationsWidget;
