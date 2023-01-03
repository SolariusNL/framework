import { Button, MultiSelect, Stack, Switch, Textarea } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { ReceiveNotification } from "@prisma/client";
import { getCookie } from "cookies-next";
import { useState } from "react";
import { HiBadgeCheck, HiDocumentText, HiFlag } from "react-icons/hi";
import { useFrameworkUser } from "../../contexts/FrameworkUser";
import Descriptive from "../Descriptive";
import Grouped from "../Settings/Grouped";
import SideBySide from "../Settings/SideBySide";

const Settings: React.FC = () => {
  const user = useFrameworkUser()!;
  const [reportNotifications, setReportNotifications] = useState(
    user.notificationPreferences.includes(ReceiveNotification.ADMIN_REPORTS)
  );
  const [updatedValues, setUpdatedValues] = useState({
    bio: user.employee?.bio,
    skills: user.employee?.skills,
  });

  const updateEmployee = async () => {
    await fetch("/api/admin/employee/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
      body: JSON.stringify({
        ...updatedValues,
      }),
    }).then(() => {
      showNotification({
        title: "Updated",
        message: "Successfully updated your employee credentials.",
      });
    });
  };

  return (
    <Stack spacing={16}>
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
      {user.employee && (
        <>
          <Grouped title="Employee">
            <SideBySide
              title="Bio"
              description="Your bio is displayed on your card in the directory."
              icon={<HiDocumentText />}
              right={
                <Textarea
                  label="Bio"
                  description="Your bio"
                  defaultValue={user.employee.bio}
                  onChange={(e) => {
                    setUpdatedValues({
                      ...updatedValues,
                      bio: e.currentTarget.value,
                    });
                  }}
                />
              }
              shaded
              noUpperBorder
            />
            <SideBySide
              title="Skills"
              description="Your skills are displayed on your card in the directory."
              icon={<HiBadgeCheck />}
              right={
                <MultiSelect
                  label="Skills"
                  description="Your skills"
                  placeholder="Select skills"
                  value={updatedValues.skills}
                  data={[]}
                  searchable
                  creatable
                  getCreateLabel={(query) => `+ Create ${query}`}
                  onCreate={(query) => {
                    const item = { value: query, label: query };
                    setUpdatedValues({
                      ...updatedValues,
                      skills: [...user.employee?.skills!, item.value],
                    });
                    return item;
                  }}
                  onChange={(value) => {
                    setUpdatedValues({
                      ...updatedValues,
                      skills: value,
                    });
                  }}
                />
              }
              shaded
              noUpperBorder
            />
            <div className="flex justify-end">
              <Button onClick={updateEmployee}>Update</Button>
            </div>
          </Grouped>
        </>
      )}
    </Stack>
  );
};

export default Settings;
