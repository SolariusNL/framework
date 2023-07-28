import EmailTab from "@/components/admin/instance-tabs/email";
import FlagsTab from "@/components/admin/instance-tabs/flags";
import GeneralTab from "@/components/admin/instance-tabs/general";
import TabNav from "@/components/tab-nav";
import { getCookie } from "cookies-next";

export enum PrefCategory {
  Email = "email",
  Integrations = "integrations",
  Flags = "flags",
}

export const fetchPrefs = async (
  category: PrefCategory,
  callback: (prefs: Map<string, string>) => void
) => {
  const res = await fetch(`/api/admin/prefs/${category}`, {
    headers: {
      Authorization: String(getCookie(".frameworksession")),
    },
  });
  const data = await res.json();
  callback(new Map(Object.entries(data)));
};

const Instance = () => {
  return (
    <>
      <TabNav orientation="vertical" defaultValue="general">
        <TabNav.List mr="xl">
          <TabNav.Tab value="general">General</TabNav.Tab>
          <TabNav.Tab value="email">Email</TabNav.Tab>
          <TabNav.Tab value="integrations">Integrations</TabNav.Tab>
          <TabNav.Tab value="flags">Flags</TabNav.Tab>
        </TabNav.List>

        {[GeneralTab, EmailTab, FlagsTab].map((Tab, i) => (
          <Tab key={i} />
        ))}
      </TabNav>
    </>
  );
};

export default Instance;
