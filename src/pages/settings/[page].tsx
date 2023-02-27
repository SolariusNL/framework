import { Loader, NativeSelect, NavLink } from "@mantine/core";
import { GetServerSidePropsContext, NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
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
import Framework from "../../components/Framework";
import AboutTab from "../../components/Settings/AboutTab";
import AccountTab from "../../components/Settings/AccountTab";
import AppearanceTab from "../../components/Settings/AppearanceTab";
import BetaTab from "../../components/Settings/BetaTab";
import DeleteAccountTab from "../../components/Settings/DeleteAccountTab";
import NotificationsTab from "../../components/Settings/NotificationsTab";
import PrivacyTab from "../../components/Settings/PrivacyTab";
import ReferralsTab from "../../components/Settings/Referrals";
import SecurityTab from "../../components/Settings/SecurityTab";
import SessionsTab from "../../components/Settings/SessionsTab";
import SubscriptionTab from "../../components/Settings/SubscriptionTab";
import VoiceTab from "../../components/Settings/Voice";
import ShadedCard from "../../components/ShadedCard";
import SidebarTabNavigation from "../../layouts/SidebarTabNavigation";
import authorizedRoute from "../../util/auth";
import useMediaQuery from "../../util/media-query";
import { User } from "../../util/prisma-types";

interface SettingsProps {
  user: User;
  activePage: string;
}

const tabs = [
  {
    value: "account",
    icon: <HiUser />,
    color: "",
    label: "Profile",
    component: AccountTab,
    description: "Manage basic account information",
  },
  {
    value: "security",
    icon: <HiKey />,
    color: "",
    label: "Security",
    component: SecurityTab,
    description: "Manage account security, change your password",
  },
  {
    value: "privacy",
    icon: <HiEye />,
    color: "",
    label: "Privacy",
    component: PrivacyTab,
    description: "Manage privacy preferences and features",
  },
  {
    value: "subscriptions",
    icon: <HiCreditCard />,
    color: "",
    label: "Billing",
    component: SubscriptionTab,
    description: "Manage subscriptions and payment information",
  },
  {
    value: "notifications",
    icon: <HiBell />,
    color: "",
    label: "Notifications",
    component: NotificationsTab,
    description: "Adjust notification preferences and emails",
  },
  {
    value: "sessions",
    icon: <HiDesktopComputer />,
    color: "",
    label: "Sessions",
    component: SessionsTab,
    description: "Manage logins on your account and review suspicious activity",
  },
  {
    value: "appearance",
    icon: <HiPhotograph />,
    color: "",
    label: "Appearance",
    component: AppearanceTab,
    description: "Change how Framweork looks, edit theme",
  },
  {
    value: "voice",
    icon: <HiMicrophone />,
    color: "",
    label: "Voice",
    component: VoiceTab,
    description: "Change your voice settings, change input and output devices",
  },
  {
    value: "preview-program",
    icon: <HiBeaker />,
    color: "",
    label: "Preview",
    component: BetaTab,
    description: "Preview experimental features before they get mainstreamed",
  },
  {
    value: "referrals",
    icon: <HiTicket />,
    color: "",
    label: "Referrals",
    component: ReferralsTab,
    description: "Refer friends to Framework to earn rewards",
  },
  {
    value: "about",
    icon: <HiInformationCircle />,
    color: "",
    label: "About",
    component: AboutTab,
    description: "Information about Framework and your current version",
  },
  {
    value: "delete-account",
    icon: <HiTrash />,
    color: "red",
    label: "Delete Account",
    component: DeleteAccountTab,
    description: "Delete your account from Framework",
  },
];

const Settings: NextPage<SettingsProps> = ({ user, activePage }) => {
  const mobile = useMediaQuery("768");
  const [active, setActive] = React.useState(activePage || "account");
  const page = tabs.find((item) => item.value === active) || tabs[0];
  const router = useRouter();

  return (
    <Framework
      user={user}
      activeTab="settings"
      modernTitle="Settings"
      modernSubtitle="Manage your account, privacy, security, subscriptions, and more."
    >
      <SidebarTabNavigation>
        <SidebarTabNavigation.Sidebar customWidth={200}>
          {mobile ? (
            <NativeSelect
              placeholder="Select a tab"
              data={tabs}
              onChange={(e) => {
                router.push(`/settings/${e.target.value}`);
              }}
              value={active}
              className="w-full col-span-full"
              size="lg"
            />
          ) : (
            tabs.map((tab) => (
              <Link passHref href={`/settings/${tab.value}`} key={tab.value}>
                <NavLink
                  icon={tab.icon}
                  color={tab.color}
                  label={tab.label}
                  className="rounded-lg -mb-1"
                  active={active === tab.value}
                  component="a"
                  {...(active === tab.value && {
                    description: tab.description,
                  })}
                />
              </Link>
            ))
          )}
        </SidebarTabNavigation.Sidebar>
        <SidebarTabNavigation.Content>
          <ReactNoSSR
            onSSR={
              <ShadedCard className="p-12 w-full flex items-center justify-center">
                <Loader />
              </ShadedCard>
            }
          >
            {page.component({
              user: user,
            })}
          </ReactNoSSR>
        </SidebarTabNavigation.Content>
      </SidebarTabNavigation>
    </Framework>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const auth = await authorizedRoute(context, true, false);
  const { page } = context.query;
  const pageStr = typeof page === "string" ? page : "account";

  if (auth.redirect) {
    return auth;
  }

  if (!tabs.find((item) => item.value === pageStr)) {
    return {
      redirect: {
        destination: "/settings/account",
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: auth.props.user,
      activePage: pageStr,
    },
  };
}

export default Settings;
