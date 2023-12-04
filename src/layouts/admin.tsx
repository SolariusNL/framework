import FrameworkLogo from "@/components/framework-logo";
import useAuthorizedUserStore from "@/stores/useAuthorizedUser";
import { User as PrismaUser } from "@/util/prisma-types";
import { rem } from "@/util/rem";
import { Navbar, Title, Tooltip, UnstyledButton, createStyles } from "@mantine/core";
import React, { FC, useEffect } from "react";
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
const useStyles = createStyles((theme) => ({
  wrapper: {
    display: "flex",
  },

  aside: {
    flex: `0 0 ${rem(60)}`,
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    borderRight: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.colors.gray[3]
    }`,
  },

  main: {
    flex: 1,
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[6]
        : theme.colors.gray[0],
  },

  mainLink: {
    width: rem(44),
    height: rem(44),
    borderRadius: theme.radius.md,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[0]
        : theme.colors.gray[7],

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[5]
          : theme.colors.gray[0],
    },
  },

  mainLinkActive: {
    "&, &:hover": {
      backgroundColor: theme.fn.variant({
        variant: "light",
        color: theme.primaryColor,
      }).background,
      color: theme.fn.variant({ variant: "light", color: theme.primaryColor })
        .color,
    },
  },

  title: {
    boxSizing: "border-box",
    marginBottom: theme.spacing.xl,
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
    padding: theme.spacing.md,
    paddingTop: rem(18),
    height: rem(60),
    borderBottom: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.colors.gray[3]
    }`,
  },

  logo: {
    boxSizing: "border-box",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    height: rem(60),
    paddingTop: theme.spacing.md,
    borderBottom: `${rem(1)} solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.colors.gray[3]
    }`,
    marginBottom: theme.spacing.xl,
  },

  link: {
    boxSizing: "border-box",
    display: "block",
    textDecoration: "none",
    borderTopRightRadius: theme.radius.md,
    borderBottomRightRadius: theme.radius.md,
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[0]
        : theme.colors.gray[7],
    padding: `0 ${theme.spacing.md}`,
    fontSize: theme.fontSizes.sm,
    marginRight: theme.spacing.md,
    fontWeight: 500,
    height: rem(44),
    lineHeight: rem(44),

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[5]
          : theme.colors.gray[1],
      color: theme.colorScheme === "dark" ? theme.white : theme.black,
    },
  },

  linkActive: {
    "&, &:hover": {
      borderLeftColor: theme.fn.variant({
        variant: "filled",
        color: theme.primaryColor,
      }).background,
      backgroundColor: theme.fn.variant({
        variant: "filled",
        color: theme.primaryColor,
      }).background,
      color: theme.white,
    },
  },
}));

const AdminLayout: FC<AdminLayoutProps> = ({ user, activeRoute, children }) => {
  const { setUser } = useAuthorizedUserStore();
  const { classes, cx } = useStyles();
  const activeGroup = Object.keys(routes).find((group) =>
    Object.values(routes[group as keyof typeof routes]).includes(activeRoute)
  ) as AdminLayoutGroups;
  const activeTab = tabs[activeGroup].tabs.find(
    (tab) => tab.route === activeRoute
  ) as AdminLayoutTab;

  useEffect(() => {
    if (user) setUser(user);
  }, [user]);

  const mainLinks = Object.values(tabs).map((t) => (
    <Tooltip
      label={t.title}
      position="right"
      withArrow
      key={t.title}
    >
      <UnstyledButton
        className={cx(classes.mainLink, { [classes.mainLinkActive]: t.tabs.filter((tt) => tt.route === activeTab.route) })}
      >
        {t.icon}
      </UnstyledButton>
    </Tooltip>
  ));

  return (
    <Navbar width={{ sm: 300 }}>
      <Navbar.Section grow className={classes.wrapper}>
        <div className={classes.aside}>
          <div className={classes.logo}>
            <FrameworkLogo square style={{
              width: 32,
              height: 32,
            }} />
          </div>
          {mainLinks}
        </div>
        <div className={classes.main}>
          <Title order={4} className={classes.title}>
            {activeTab.title}
          </Title>

          {/* {links} */}
        </div>
      </Navbar.Section>
    </Navbar>
  );
};

export default AdminLayout;
