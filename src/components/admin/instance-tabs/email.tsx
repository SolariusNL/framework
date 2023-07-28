import PrefTable from "@/components/admin/instance/pref-table";
import { PrefCategory, fetchPrefs } from "@/components/admin/pages/instance";
import { Tabs } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { getCookie } from "cookies-next";
import { useEffect, useState } from "react";
import { HiOutlineCheckCircle } from "react-icons/hi";

export async function updateEnv(k: string, v: string) {
  const res = await fetch(`/api/admin/prefs/${k}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: String(getCookie(".frameworksession")),
    },
    body: JSON.stringify({
      value: v,
    }),
  });

  if (!res.ok) {
    throw new Error("Failed to update env");
  } else {
    showNotification({
      title: "Updated successfully",
      message: `Updated ${k} to ${v} successfully.`,
      icon: <HiOutlineCheckCircle />,
    });
  }
}

const EmailTab: React.FC = () => {
  const [emailPrefs, setEmailPrefs] = useState(new Map<string, string>());

  useEffect(() => {
    fetchPrefs(PrefCategory.Email, setEmailPrefs);
  }, []);

  return (
    <Tabs.Panel value="email">
      <PrefTable
        data={emailPrefs}
        editable={true}
        onEditSubmit={async (k, v) => await updateEnv(k, v)}
      />
    </Tabs.Panel>
  );
};

export default EmailTab;
