import { Box, Divider, Loader, ScrollArea, Stack, Text } from "@mantine/core";
import { GetServerSidePropsContext, NextPage } from "next";
import {
  HiBeaker,
  HiBell,
  HiDesktopComputer,
  HiEye,
  HiGift,
  HiInformationCircle,
  HiKey,
  HiMicrophone,
  HiPhotograph,
  HiTrash,
  HiUser,
} from "react-icons/hi";
import ReactNoSSR from "react-no-ssr";
import Framework from "../components/Framework";
import AboutTab from "../components/Settings/AboutTab";
import AccountTab from "../components/Settings/AccountTab";
import AppearanceTab from "../components/Settings/AppearanceTab";
import BetaTab from "../components/Settings/BetaTab";
import DeleteAccountTab from "../components/Settings/DeleteAccountTab";
import NotificationsTab from "../components/Settings/NotificationsTab";
import PrivacyTab from "../components/Settings/PrivacyTab";
import SecurityTab from "../components/Settings/SecurityTab";
import SessionsTab from "../components/Settings/SessionsTab";
import SubscriptionTab from "../components/Settings/SubscriptionTab";
import VoiceTab from "../components/Settings/Voice";
import TabNav from "../components/TabNav";
import authorizedRoute from "../util/authorizedRoute";
import { User } from "../util/prisma-types";
import useMediaQuery from "../util/useMediaQuery";

interface SettingsProps {
  user: User;
}

interface SettingsGroupProps {
  title: string;
  children: React.ReactNode;
}

const SettingsGroup = ({ title, children }: SettingsGroupProps) => {
  return (
    <>
      <Text
        color="dimmed"
        size="sm"
        weight={700}
        sx={{
          padding: "6px 8px",
          marginLeft: "8px",
        }}
      >
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
      <TabNav
        variant="pills"
        orientation={mobile ? "horizontal" : "vertical"}
        defaultValue="account"
      >
        <ScrollArea offsetScrollbars>
          <TabNav.List>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                flex: 1,
              }}
            >
              <Stack spacing={10}>
                <SettingsGroup title="Account">
                  <TabNav.Tab value="account" icon={<HiUser />}>
                    Profile
                  </TabNav.Tab>

                  <TabNav.Tab value="security" icon={<HiKey />}>
                    Security
                  </TabNav.Tab>

                  <TabNav.Tab value="privacy" icon={<HiEye />}>
                    Privacy
                  </TabNav.Tab>

                  <TabNav.Tab value="subscriptions" icon={<HiGift />}>
                    Subscriptions
                  </TabNav.Tab>

                  <TabNav.Tab value="notifications" icon={<HiBell />}>
                    Notifications
                  </TabNav.Tab>

                  <TabNav.Tab value="sessions" icon={<HiDesktopComputer />}>
                    Sessions
                  </TabNav.Tab>
                </SettingsGroup>

                <Divider />

                <SettingsGroup title="App">
                  <TabNav.Tab value="appearance" icon={<HiPhotograph />}>
                    Appearance
                  </TabNav.Tab>

                  <TabNav.Tab value="voice" icon={<HiMicrophone />}>
                    Voice
                  </TabNav.Tab>

                  <TabNav.Tab value="beta" icon={<HiBeaker />}>
                    Preview Program
                  </TabNav.Tab>
                </SettingsGroup>

                <Divider />

                <SettingsGroup title="Other">
                  <TabNav.Tab value="about" icon={<HiInformationCircle />}>
                    About Framework
                  </TabNav.Tab>
                  <TabNav.Tab
                    value="deleteaccount"
                    icon={<HiTrash />}
                    color="red"
                  >
                    Delete Account
                  </TabNav.Tab>
                </SettingsGroup>
              </Stack>
            </div>
          </TabNav.List>
        </ScrollArea>

        {[
          AccountTab,
          SecurityTab,
          PrivacyTab,
          SubscriptionTab,
          NotificationsTab,
          AboutTab,
          DeleteAccountTab,
          AppearanceTab,
          BetaTab,
          SessionsTab,
          VoiceTab,
        ].map((Component, index) => (
          <ReactNoSSR
            key={index}
            onSSR={
              index == 0 ? (
                <Box
                  sx={{
                    alignItems: "center",
                    display: "flex",
                    justifyContent: "center",
                    width: "100%",
                  }}
                >
                  <Loader />
                </Box>
              ) : undefined
            }
          >
            <Component user={user} />
          </ReactNoSSR>
        ))}
      </TabNav>
    </Framework>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return await authorizedRoute(context, true, false);
}

export default Settings;
