import {
  Box,
  Loader,
  ScrollArea,
  Stack,
  Text,
  useMantineColorScheme,
} from "@mantine/core";
import { GetServerSidePropsContext, NextPage } from "next";
import Link from "next/link";
import {
  HiBeaker,
  HiBell,
  HiEye,
  HiGift,
  HiGlobe,
  HiInformationCircle,
  HiKey,
  HiPhone,
  HiPhotograph,
  HiSortAscending,
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
import SubscriptionTab from "../components/Settings/SubscriptionTab";
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
  icon: React.ReactNode;
}

const SettingsGroup = ({ title, children, icon }: SettingsGroupProps) => {
  const { colorScheme } = useMantineColorScheme();
  return (
    <>
      <Text color="dimmed" size="sm" weight={500}>
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
                <SettingsGroup title="Account" icon={<HiUser />}>
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

                  <Link href="/sessions">
                    <TabNav.Tab value="sessions" icon={<HiPhone />}>
                      Sessions
                    </TabNav.Tab>
                  </Link>
                </SettingsGroup>

                <SettingsGroup title="App" icon={<HiGlobe />}>
                  <TabNav.Tab value="appearance" icon={<HiPhotograph />}>
                    Appearance
                  </TabNav.Tab>

                  <TabNav.Tab value="beta" icon={<HiBeaker />}>
                    Preview Program
                  </TabNav.Tab>
                </SettingsGroup>

                <SettingsGroup title="Other" icon={<HiSortAscending />}>
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
