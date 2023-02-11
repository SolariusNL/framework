import { Box, Loader, NativeSelect, Stack } from "@mantine/core";
import { GetServerSidePropsContext, NextPage } from "next";
import React from "react";
import {
  HiBeaker,
  HiBell,
  HiCreditCard,
  HiDesktopComputer,
  HiEye,
  HiInformationCircle,
  HiKey,
  HiMicrophone,
  HiPhotograph,
  HiTicket,
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
import ReferralsTab from "../components/Settings/Referrals";
import SecurityTab from "../components/Settings/SecurityTab";
import SessionsTab from "../components/Settings/SessionsTab";
import SubscriptionTab from "../components/Settings/SubscriptionTab";
import VoiceTab from "../components/Settings/Voice";
import TabNav from "../components/TabNav";
import SidebarTabNavigation from "../layouts/SidebarTabNavigation";
import authorizedRoute from "../util/authorizedRoute";
import { User } from "../util/prisma-types";
import useMediaQuery from "../util/useMediaQuery";

interface SettingsProps {
  user: User;
}

const Settings: NextPage<SettingsProps> = ({ user }) => {
  const mobile = useMediaQuery("768");
  const [value, setValue] = React.useState("account");
  const tabs = [
    { value: "account", icon: <HiUser />, color: "", label: "Profile" },
    { value: "security", icon: <HiKey />, color: "", label: "Security" },
    { value: "privacy", icon: <HiEye />, color: "", label: "Privacy" },
    {
      value: "subscriptions",
      icon: <HiCreditCard />,
      color: "",
      label: "Billing",
    },
    {
      value: "notifications",
      icon: <HiBell />,
      color: "",
      label: "Notifications",
    },
    {
      value: "sessions",
      icon: <HiDesktopComputer />,
      color: "",
      label: "Sessions",
    },
    {
      value: "appearance",
      icon: <HiPhotograph />,
      color: "",
      label: "Appearance",
    },
    { value: "voice", icon: <HiMicrophone />, color: "", label: "Voice" },
    { value: "beta", icon: <HiBeaker />, color: "", label: "Preview" },
    { value: "referrals", icon: <HiTicket />, color: "", label: "Referrals" },
    {
      value: "about",
      icon: <HiInformationCircle />,
      color: "",
      label: "About",
    },
    {
      value: "deleteaccount",
      icon: <HiTrash />,
      color: "red",
      label: "Delete Account",
    },
  ];

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
        value={value}
      >
        <SidebarTabNavigation customGap={1}>
          <SidebarTabNavigation.Sidebar customWidth={180}>
            {mobile ? (
              <NativeSelect
                placeholder="Select a tab"
                data={tabs}
                onChange={(e) => setValue(e.target.value)}
                value={value}
                className="w-full col-span-full"
                size="lg"
              />
            ) : (
              <TabNav.List>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                  }}
                >
                  <Stack spacing={4}>
                    {tabs.map((tab) => (
                      <TabNav.Tab
                        key={tab.value}
                        value={tab.value}
                        icon={tab.icon}
                        color={tab.color}
                        onClick={() => setValue(tab.value)}
                      >
                        {tab.label}
                      </TabNav.Tab>
                    ))}
                  </Stack>
                </div>
              </TabNav.List>
            )}
          </SidebarTabNavigation.Sidebar>
          <SidebarTabNavigation.Content>
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
              ReferralsTab,
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
          </SidebarTabNavigation.Content>
        </SidebarTabNavigation>
      </TabNav>
    </Framework>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return await authorizedRoute(context, true, false);
}

export default Settings;
