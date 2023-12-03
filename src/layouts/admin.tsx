import Framework from "@/components/framework";
import { User as PrismaUser } from "@/util/prisma-types";
import React, { FC } from "react";
import { HiLocationMarker, HiOutlineUserGroup, HiServer } from "react-icons/hi";

export interface AdminLayoutProps {
  user: PrismaUser;
  activeRoute: string;
  children: React.ReactNode;
}
export interface AdminLayoutPageProps {
  user: PrismaUser;
}

export enum AdminLayoutGroups {
  Home = "home",
  UserManagement = "user-management",
  Instance = "instance",
}

export interface AdminLayoutTab {
  title: string;
  route: string;
}
export interface AdminLayoutGroup {
  title: string;
  icon: React.ReactNode;
  tabs: AdminLayoutTab[];
}
export type AdminLayoutTabs = Record<AdminLayoutGroups, AdminLayoutGroup>;
export const routes = {
  home: {
    dashboard: "/admin/dashboard",
    analytics: "/admin/analytics",
  },
  userManagement: {
    users: "/admin/users",
    roles: "/admin/roles",
  },
  instance: {
    settings: "/admin/settings",
    logs: "/admin/logs",
  },
};

const tabs: AdminLayoutTabs = {
  [AdminLayoutGroups.Home]: {
    title: "Home",
    icon: <HiLocationMarker />,
    tabs: [
      {
        title: "Dashboard",
        route: routes.home.dashboard,
      },
      {
        title: "Analytics",
        route: routes.home.analytics,
      },
    ],
  },
  [AdminLayoutGroups.UserManagement]: {
    title: "User Management",
    icon: <HiOutlineUserGroup />,
    tabs: [
      {
        title: "Users",
        route: routes.userManagement.users,
      },
      {
        title: "Roles",
        route: routes.userManagement.roles,
      },
    ],
  },
  [AdminLayoutGroups.Instance]: {
    title: "Instance",
    icon: <HiServer />,
    tabs: [
      {
        title: "Settings",
        route: routes.instance.settings,
      },
      {
        title: "Logs",
        route: routes.instance.logs,
      },
    ],
  },
};

const AdminLayout: FC<AdminLayoutProps> = ({ user, activeRoute, children }) => {
  const activeGroup = Object.keys(routes).find((group) =>
    Object.values(routes[group as keyof typeof routes]).includes(activeRoute)
  ) as AdminLayoutGroups;
  const activeTab = tabs[activeGroup].tabs.find(
    (tab) => tab.route === activeRoute
  ) as AdminLayoutTab;

  return (
    <Framework user={user} activeTab="invent" noPadding>
      <p>New Admin</p>
      {children}
    </Framework>
  );
};

export default AdminLayout;
