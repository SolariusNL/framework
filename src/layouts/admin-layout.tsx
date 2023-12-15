import Footer from "@/components/foot";
import FrameworkLogo from "@/components/framework-logo";
import Rocket from "@/icons/Rocket";
import useAuthorizedUserStore from "@/stores/useAuthorizedUser";
import cast from "@/util/cast";
import getMediaUrl from "@/util/get-media";
import useMediaQuery from "@/util/media-query";
import { User as PrismaUser } from "@/util/prisma-types";
import {
  AppShell,
  Avatar,
  Badge,
  Box,
  Burger,
  Container,
  Group,
  Header,
  MediaQuery,
  NavLink,
  Navbar,
  ScrollArea,
  Text,
  Title,
  createStyles,
} from "@mantine/core";
import Link from "next/link";
import React, { FC, useEffect, useState } from "react";
import {
  HiArrowLeft,
  HiOutlineCog,
  HiOutlineColorSwatch,
  HiOutlineEye,
  HiOutlineFlag,
  HiOutlineGift,
  HiOutlineHome,
  HiOutlineIdentification,
  HiOutlineInbox,
  HiOutlineKey,
  HiOutlineOfficeBuilding,
  HiOutlinePrinter,
  HiOutlineServer,
  HiOutlineShieldCheck,
  HiOutlineStar,
  HiOutlineTable,
  HiOutlineTicket,
  HiOutlineUserCircle,
  HiOutlineUserGroup,
  HiOutlineViewBoards,
  HiOutlineWifi,
} from "react-icons/hi";

export type AdminLayoutProps = {
  user: PrismaUser;
  activeRoute: string;
  children: React.ReactNode;
};
export type AdminLayoutPageProps = {
  user: PrismaUser;
};

export enum AdminLayoutGroups {
  Home = "home",
  Application = "application",
  Moderation = "moderation",
  Support = "support",
  Company = "company",
}

/**
 * @TODO Fix page blur causes groups to return to default state
 * @TODO Add descriptions
 */

export interface AdminLayoutTab {
  title: string;
  route: string;
  icon: React.ReactNode;
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
    settings: "/admin/settings",
  },
  application: {
    keys: "/admin/application/invite-keys",
    instance: "/admin/application/instance",
    licenses: "/admin/application/licenses",
    flags: "/admin/application/flags",
    cosmic: "/admin/application/cosmic",
  },
  moderation: {
    users: "/admin/moderation/users",
    automod: "/admin/moderation/automod",
    reports: "/admin/moderation/reports",
    ips: "/admin/moderation/ip-addresses",
  },
  support: {
    tickets: "/admin/support/support-tickets",
    gifts: "/admin/support/gifts",
  },
  company: {
    directory: "/admin/company/directory",
    activity: "/admin/company/activity",
    boards: "/admin/company/boards",
  },
};

const tabs: AdminLayoutTabs = {
  [AdminLayoutGroups.Home]: {
    title: "Home",
    icon: <HiOutlineHome />,
    tabs: [
      {
        title: "Dashboard",
        route: routes.home.dashboard,
        icon: <HiOutlineViewBoards />,
      },
      {
        title: "Settings",
        route: routes.home.settings,
        icon: <HiOutlineCog />,
      },
    ],
  },
  [AdminLayoutGroups.Application]: {
    title: "Application",
    icon: <Rocket />,
    tabs: [
      {
        title: "Invite keys",
        route: routes.application.keys,
        icon: <HiOutlineKey />,
      },
      {
        title: "Instance",
        route: routes.application.instance,
        icon: <HiOutlineServer />,
      },
      {
        title: "Licenses",
        route: routes.application.licenses,
        icon: <HiOutlineIdentification />,
      },
      {
        title: "Flags",
        route: routes.application.flags,
        icon: <HiOutlineFlag />,
      },
      {
        title: "Cosmic",
        route: routes.application.cosmic,
        icon: <HiOutlineStar />,
      },
    ],
  },
  [AdminLayoutGroups.Moderation]: {
    title: "Moderation",
    icon: <HiOutlineEye />,
    tabs: [
      {
        title: "Users",
        icon: <HiOutlineUserGroup />,
        route: routes.moderation.users,
      },
      {
        title: "Automod",
        icon: <HiOutlineShieldCheck />,
        route: routes.moderation.automod,
      },
      {
        title: "Reports",
        icon: <HiOutlineColorSwatch />,
        route: routes.moderation.reports,
      },
      {
        title: "IP addresses",
        icon: <HiOutlineWifi />,
        route: routes.moderation.ips,
      },
    ],
  },
  [AdminLayoutGroups.Support]: {
    title: "Support",
    icon: <HiOutlineInbox />,
    tabs: [
      {
        title: "Support tickets",
        icon: <HiOutlineTicket />,
        route: routes.support.tickets,
      },
      {
        title: "Gifts",
        icon: <HiOutlineGift />,
        route: routes.support.gifts,
      },
    ],
  },
  [AdminLayoutGroups.Company]: {
    title: "Company",
    icon: <HiOutlineOfficeBuilding />,
    tabs: [
      {
        title: "Directory",
        icon: <HiOutlineUserCircle />,
        route: routes.company.directory,
      },
      {
        title: "Activity",
        icon: <HiOutlineTable />,
        route: routes.company.activity,
      },
      {
        title: "Boards",
        icon: <HiOutlinePrinter />,
        route: routes.company.boards,
      },
    ],
  },
};
const useStyles = createStyles((theme, _params, getRef) => {
  const icon = getRef("icon");
  return {
    header: {
      paddingBottom: theme.spacing.md,
      marginBottom: theme.spacing.md * 1.5,
      borderBottom: `1px solid ${
        theme.colorScheme === "dark"
          ? theme.colors.dark[4]
          : theme.colors.gray[2]
      }`,
    },

    footer: {
      paddingTop: theme.spacing.md,
      marginTop: theme.spacing.md,
      borderTop: `1px solid ${
        theme.colorScheme === "dark"
          ? theme.colors.dark[4]
          : theme.colors.gray[2]
      }`,
    },

    link: {
      ...theme.fn.focusStyles(),
      display: "flex",
      alignItems: "center",
      textDecoration: "none",
      fontSize: theme.fontSizes.sm,
      color:
        theme.colorScheme === "dark"
          ? theme.colors.dark[1]
          : theme.colors.gray[7],
      padding: `${theme.spacing.xs}px ${theme.spacing.md}px`,
      borderRadius: theme.radius.md,
      fontWeight: 500,

      "&:hover": {
        backgroundColor:
          theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.white,
        color: theme.colorScheme === "dark" ? theme.white : theme.black,

        [`& .${icon}`]: {
          color: theme.colorScheme === "dark" ? theme.white : theme.black,
        },
      },
    },

    linkIcon: {
      ref: icon,
      color:
        theme.colorScheme === "dark"
          ? theme.colors.dark[2]
          : theme.colors.gray[6],
      marginRight: theme.spacing.md + 2,
    },

    linkActive: {
      "&, &:hover": {
        backgroundColor: theme.fn.variant({
          variant: "light",
          color: theme.primaryColor,
        }).background,
        color: theme.fn.variant({ variant: "light", color: theme.primaryColor })
          .color,
        [`& .${icon}`]: {
          color: theme.fn.variant({
            variant: "light",
            color: theme.primaryColor,
          }).color,
        },
      },
    },
  };
});

const AdminLayout: FC<AdminLayoutProps> = ({ user, activeRoute, children }) => {
  const { setUser } = useAuthorizedUserStore();
  const { classes, theme, cx } = useStyles();
  const activeGroup = Object.keys(routes).find((group) =>
    Object.values(routes[group as keyof typeof routes]).includes(activeRoute)
  ) as AdminLayoutGroups;
  const [opened, setOpened] = useState(false);
  const mobile = useMediaQuery("768");
  const activeTab = tabs[activeGroup].tabs.find(
    (tab) => tab.route === activeRoute
  ) as AdminLayoutTab;

  useEffect(() => {
    if (user) setUser(user);
  }, [user]);

  const mainLinks = Object.values(tabs).map((t) => (
    <NavLink
      label={t.title}
      icon={t.icon}
      active={cast<boolean>(t.tabs.find((ts) => ts.route === activeRoute))}
      className="rounded-md flex"
      defaultOpened={true}
      key={t.title}
    >
      <div className="mt-1/2">
        {t.tabs.map((tt, i) => (
          <NavLink
            label={tt.title}
            icon={tt.icon}
            active={activeRoute === tt.route}
            className="rounded-md"
            key={i}
          />
        ))}
      </div>
    </NavLink>
  ));

  return (
    <AppShell
      className={theme.colorScheme}
      navbar={
        <Navbar
          width={{ sm: 300 }}
          p="md"
          hiddenBreakpoint="sm"
          hidden={!opened}
        >
          <Navbar.Section>
            <Group className={classes.header} position="apart">
              <FrameworkLogo />
              <Badge
                variant="gradient"
                gradient={{
                  from: "pink",
                  to: "grape",
                }}
              >
                Admin
              </Badge>
            </Group>
          </Navbar.Section>

          <Navbar.Section
            grow
            component={React.forwardRef<HTMLDivElement>((props, ref) => (
              <ScrollArea {...props} />
            ))}
          >
            <div className="flex flex-col gap-1">{mainLinks}</div>
          </Navbar.Section>

          <Navbar.Section className={classes.footer}>
            <NavLink
              icon={
                <Avatar
                  size={20}
                  src={getMediaUrl(user?.avatarUri)}
                  radius={999}
                />
              }
              label={user?.username || "..."}
              className="rounded-md"
            />
            <Link href="/">
              <NavLink
                label="Return to Framework"
                icon={<HiArrowLeft className="text-dimmed" />}
                className="rounded-md"
              />
            </Link>
          </Navbar.Section>
        </Navbar>
      }
      padding={0}
      {...(mobile && {
        header: (
          <Header height={50} p="md">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                height: "100%",
              }}
            >
              <MediaQuery largerThan="sm" styles={{ display: "none" }}>
                <Burger
                  opened={opened}
                  onClick={() => setOpened((o) => !o)}
                  size="sm"
                  color={theme.colors.gray[6]}
                  mr="xl"
                />
              </MediaQuery>

              <div className="flex items-center gap-4">
                <Text size="lg" weight={500}>
                  {activeTab.title}
                </Text>
                <Text size="sm" color="dimmed" lineClamp={1}>
                  {activeTab.route}
                </Text>
              </div>
            </div>
          </Header>
        ),
      })}
    >
      <Box
        sx={(theme) => ({
          backgroundColor: theme.colorScheme === "dark" ? "#000" : "#fff",
        })}
        p={32}
        mb={32}
      >
        <Container>
          <Title mb={8}>{activeTab?.title}</Title>
          <Text color="dimmed">{activeTab?.route}</Text>
        </Container>
      </Box>
      <Container>{children}</Container>
      <Footer />
    </AppShell>
  );
};

export default AdminLayout;
