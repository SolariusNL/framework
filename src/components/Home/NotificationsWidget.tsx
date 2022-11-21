import { useState } from "react";
import { useFrameworkUser } from "../../contexts/FrameworkUser";
import ModernEmptyState from "../ModernEmptyState";
import ShadedCard from "../ShadedCard";
import Notifications from "../Widgets/Notifications";

const NotificationsWidget: React.FC = () => {
  const user = useFrameworkUser()!;
  const [notifications, setNotifications] = useState(user.notifications);

  return (
    <ShadedCard withBorder>
      {notifications.length > 0 ? (
        <Notifications
          notifications={notifications}
          setNotifications={setNotifications}
        />
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
