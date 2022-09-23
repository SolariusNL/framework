import {
  ScrollArea,
  Skeleton,
  Stack,
  Tabs,
  Text,
  useMantineColorScheme,
} from "@mantine/core";
import { GetServerSidePropsContext, NextPage } from "next";
import {
  HiBell,
  HiEye,
  HiGift,
  HiGlobe,
  HiKey,
  HiPhotograph,
  HiSortAscending,
  HiTrash,
  HiUser,
} from "react-icons/hi";
import Framework from "../components/Framework";
import AccountTab from "../components/Settings/AccountTab";
import AppearanceTab from "../components/Settings/AppearanceTab";
import BetaTab from "../components/Settings/BetaTab";
import DeleteAccountTab from "../components/Settings/DeleteAccountTab";
import NotificationsTab from "../components/Settings/NotificationsTab";
import PrivacyTab from "../components/Settings/PrivacyTab";
import SecurityTab from "../components/Settings/SecurityTab";
import authorizedRoute from "../util/authorizedRoute";
import { User } from "../util/prisma-types";
import useMediaQuery from "../util/useMediaQuery";
import ReactNoSSR from "react-no-ssr";

interface SettingsProps {
  user: User;
}

interface SettingsGroupProps {
  title: string;
  children: React.ReactNode;
  icon: React.ReactNode;
}

const SettingsGroup = ({ title, children, icon }: SettingsGroupProps) => {
  const { colorScheme } = useMantineColorScheme();
  return (
    <>
      <Text
        color="dimmed"
        className={`settings-header_${colorScheme}`}
        size="sm"
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            marginRight: 10,
          }}
        >
          {icon}
        </div>
        {title}
      </Text>

      <Stack spacing={3}>{children}</Stack>
    </>
  );
};

const Settings: NextPage<SettingsProps> = ({ user }) => {
  const mobile = useMediaQuery("768");

  return (
    <Framework
      user={user}
      activeTab="settings"
      modernTitle="Settings"
      modernSubtitle="Manage your account, privacy, security, subscriptions, and more."
    >
      <Tabs
        variant="pills"
        orientation={mobile ? "horizontal" : "vertical"}
        defaultValue="account"
      >
        <ScrollArea offsetScrollbars>
          <Tabs.List>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
              }}
            >
              <Stack spacing={10}>
                <SettingsGroup title="Account" icon={<HiUser />}>
                  <Tabs.Tab value="account" icon={<HiUser />}>
                    Profile
                  </Tabs.Tab>

                  <Tabs.Tab value="security" icon={<HiKey />}>
                    Security
                  </Tabs.Tab>

                  <Tabs.Tab value="privacy" icon={<HiEye />}>
                    Privacy
                  </Tabs.Tab>

                  <Tabs.Tab value="notifications" icon={<HiBell />}>
                    Notifications
                  </Tabs.Tab>
                </SettingsGroup>

                <SettingsGroup title="App" icon={<HiGlobe />}>
                  <Tabs.Tab value="appearance" icon={<HiPhotograph />}>
                    Appearance
                  </Tabs.Tab>

                  <Tabs.Tab value="beta" icon={<HiGift />}>
                    Preview Program
                  </Tabs.Tab>
                </SettingsGroup>

                <SettingsGroup title="Other" icon={<HiSortAscending />}>
                  <Tabs.Tab
                    value="deleteaccount"
                    icon={<HiTrash />}
                    color="red"
                  >
                    Delete Account
                  </Tabs.Tab>
                </SettingsGroup>
              </Stack>
            </div>
          </Tabs.List>
        </ScrollArea>

        {[
          AccountTab,
          SecurityTab,
          PrivacyTab,
          NotificationsTab,
          DeleteAccountTab,
          AppearanceTab,
          BetaTab,
        ].map((Component, index) => (
          <ReactNoSSR key={index}>
            <Component user={user} />
          </ReactNoSSR>
        ))}
      </Tabs>
    </Framework>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return await authorizedRoute(context, true, false);
}

export default Settings;
