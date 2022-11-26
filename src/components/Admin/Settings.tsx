import { Switch } from "@mantine/core";
import { ReceiveNotification } from "@prisma/client";
import { getCookie } from "cookies-next";
import { useState } from "react";
import { HiFlag } from "react-icons/hi";
import { useFrameworkUser } from "../../contexts/FrameworkUser";
import Descriptive from "../Descriptive";
import Grouped from "../Settings/Grouped";
import SideBySide from "../Settings/SideBySide";

const Settings: React.FC = () => {
  const user = useFrameworkUser()!;
  const [reportNotifications, setReportNotifications] = useState(
    user.notificationPreferences.includes(ReceiveNotification.ADMIN_REPORTS)
  );

  return (
    <Grouped title="Notifications">
      <SideBySide
        title="Report Notifications"
        description="Receive notifications when a report is made. Note that you will still receive notifications for reports you make."
        icon={<HiFlag />}
        right={
          <Descriptive
            title="Receive report notifications"
            description="Toggle report notifications"
          >
            <Switch
              onChange={() => {
                setReportNotifications(!reportNotifications);
                fetch("/api/users/@me/update", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: String(getCookie(".frameworksession")),
                  },
                  body: JSON.stringify({
                    notificationPreferences: [
                      ...user.notificationPreferences.filter(
                        (n) => n !== ReceiveNotification.ADMIN_REPORTS
                      ),
                      ...(reportNotifications
                        ? []
                        : [ReceiveNotification.ADMIN_REPORTS]),
                    ],
                  }),
                })
                  .then((r) => r.json())
                  .then((r) => {
                    if (r.error) {
                      alert(r.error);
                    }
                  });
              }}
              checked={reportNotifications}
            />
          </Descriptive>
        }
        shaded
        noUpperBorder
      />
    </Grouped>
  );
};

export default Settings;
