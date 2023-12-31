import Board from "@/components/admin/employee/board";
import Tasks from "@/components/admin/employee/tasks";
import Activity from "@/components/admin/pages/activity";
import Articles from "@/components/admin/pages/articles";
import Automod from "@/components/admin/pages/automod";
import BannedIPs from "@/components/admin/pages/banned-ips";
import Cosmic from "@/components/admin/pages/cosmic";
import Dashboard from "@/components/admin/pages/dashboard";
import Directory from "@/components/admin/pages/directory";
import Experiments from "@/components/admin/pages/experiments";
import Flags from "@/components/admin/pages/flags";
import Gifts from "@/components/admin/pages/gifts";
import Instance from "@/components/admin/pages/instance";
import Invites from "@/components/admin/pages/invites";
import Licenses from "@/components/admin/pages/licenses";
import Punish from "@/components/admin/pages/punish";
import Reports from "@/components/admin/pages/reports";
import Tickets from "@/components/admin/pages/tickets";
import Users from "@/components/admin/pages/users";
import Settings from "@/components/admin/settings";
import Footer from "@/components/foot";
import FrameworkLogo from "@/components/framework-logo";
import ShadedCard from "@/components/shaded-card";
import useAmoled from "@/stores/useAmoled";
import useAuthorizedUserStore from "@/stores/useAuthorizedUser";
import authorizedRoute from "@/util/auth";
import clsx from "@/util/clsx";
import getMediaUrl from "@/util/get-media";
import useMediaQuery from "@/util/media-query";
import prisma from "@/util/prisma";
import { User } from "@/util/prisma-types";
import {
  AppShell,
  Avatar,
  Badge,
  Box,
  Burger,
  Container,
  createStyles,
  Divider,
  Group,
  Header,
  Loader,
  MediaQuery,
  Navbar,
  ScrollArea,
  Text,
  Title,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { openModal } from "@mantine/modals";
import { LayoutGroup, motion } from "framer-motion";
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  HiArrowLeft,
  HiBeaker,
  HiBookmarkAlt,
  HiClipboardCheck,
  HiCog,
  HiColorSwatch,
  HiFlag,
  HiGift,
  HiHome,
  HiIdentification,
  HiInboxIn,
  HiKey,
  HiOutlineClipboardCheck,
  HiServer,
  HiShieldCheck,
  HiTable,
  HiUserGroup,
  HiUsers,
  HiWifi,
} from "react-icons/hi";
import ReactNoSSR from "react-no-ssr";

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

const data = [
  {
    label: "Dashboard",
    icon: HiHome,
    href: "/admin/dashboard",
    render: <Dashboard />,
    subtitle: "Basic information about this instance",
  },
  {
    label: "Articles",
    icon: HiBookmarkAlt,
    href: "/admin/articles",
    render: <Articles />,
    subtitle: "View news and announcements from HR",
  },
  {
    label: "Keys",
    group: "Application",
    icon: HiKey,
    href: "/admin/keys",
    render: <Invites />,
    subtitle: "Manage your keys and invites",
  },
  {
    label: "Users",
    group: "Moderation",
    icon: HiUsers,
    href: "/admin/users",
    render: <Users />,
    subtitle: "Manage users, roles, permissions, and more",
  },
  {
    label: "Automod",
    group: "Moderation",
    icon: HiShieldCheck,
    href: "/admin/automod",
    render: <Automod />,
    subtitle: "Review automod triggers and actions",
  },
  {
    label: "Instance",
    group: "Application",
    icon: HiServer,
    href: "/admin/instance",
    render: <Instance />,
    subtitle: "Manage this Framework instance",
  },
  {
    label: "Reports",
    group: "Moderation",
    icon: HiColorSwatch,
    href: "/admin/reports",
    render: <Reports />,
    subtitle: "View reports made by users",
  },
  {
    label: "IPs",
    group: "Moderation",
    icon: HiWifi,
    href: "/admin/ips",
    render: <BannedIPs />,
    subtitle: "Manage banned IPs",
  },
  {
    label: "Tickets",
    group: "Support",
    icon: HiInboxIn,
    href: "/admin/tickets",
    render: <Tickets />,
    subtitle: "Manage user-submitted support tickets",
  },
  {
    label: "Directory",
    group: "Company",
    icon: HiUserGroup,
    href: "/admin/directory",
    render: <Directory />,
    subtitle: "View the directory of all employees",
  },
  {
    label: "Gifts",
    group: "Support",
    icon: HiGift,
    href: "/admin/gifts",
    render: <Gifts />,
    subtitle: "Manage redeemable gift codes",
  },
  {
    label: "Licenses",
    group: "Application",
    icon: HiIdentification,
    href: "/admin/licenses",
    render: <Licenses />,
    subtitle: "Manage Studio license keys",
  },
  {
    label: "Tasks",
    group: "Company",
    icon: HiClipboardCheck,
    href: "/admin/tasks",
    render: <Tasks />,
    subtitle: "View your tasks and manage them",
  },
  {
    label: "Flags",
    group: "Application",
    icon: HiFlag,
    href: "/admin/flags",
    render: <Flags />,
    subtitle: "Manage runtime flags to enable/disable features",
  },
  {
    label: "Activity",
    group: "Company",
    icon: HiTable,
    href: "/admin/activity",
    render: <Activity />,
    subtitle: "Review admin activity logs",
  },
  {
    label: "Cosmic",
    group: "Application",
    icon: HiServer,
    href: "/admin/cosmic",
    render: <Cosmic />,
    subtitle: "Manage Cosmic servers through the Nucleus API",
  },
  {
    label: "Boards",
    group: "Company",
    icon: HiOutlineClipboardCheck,
    href: "/admin/boards",
    render: <Board />,
    subtitle: "See news from HR",
  },
  {
    label: "ID",
    group: "Company",
    icon: HiIdentification,
    href: "https://id.solarius.me",
    external: true,
    render: (
      <ShadedCard className="w-full py-24 flex items-center justify-center">
        <Loader />
      </ShadedCard>
    ),
    subtitle: "Quick links managed by Solarius Employee Identity",
  },
  {
    label: "Experiments",
    icon: HiBeaker,
    href: "/admin/experiments",
    render: <Experiments />,
    subtitle: "UI and functionality experiments",
  },
  {
    label: "Settings",
    icon: HiCog,
    href: "/admin/settings",
    render: <Settings />,
    subtitle: "Manage your personal admin settings",
    show: false,
  },
  {
    label: "Punish",
    icon: HiCog,
    href: "/admin/punish",
    render: <Punish />,
    subtitle: "Punish a user from Framework.",
    show: false,
  },
];

export type PageName =
  | "home"
  | "board"
  | "directory"
  | "tasks"
  | "assessments"
  | "performance"
  | "settings";

const AdminDashboard: React.FC<{
  activePage: PageName;
  user: User;
}> = ({ activePage, user }) => {
  const { classes, cx, theme } = useStyles();
  const [active, setActive] = useState(activePage || "home");
  const { setUser } = useAuthorizedUserStore()!;
  const page =
    data.find((item) => item.label.toLowerCase() === active) || data[0];
  const mobile = useMediaQuery("768");
  const [opened, setOpened] = useState(false);
  const [warningShown, setWarningShown] = useLocalStorage({
    key: "admin-mobile-warning",
    defaultValue: false,
  });
  const { enabled: amoled } = useAmoled();

  useEffect(() => {
    if (user) {
      setUser(user);
    }
  }, [user]);

  useEffect(() => {
    if (mobile && !warningShown) {
      openModal({
        title: "Mobile",
        children: (
          <Text>
            This page is not optimized for mobile devices. Please use a desktop
            device to access this page.
          </Text>
        ),
      });
      setWarningShown(true);
    }
  }, [mobile, warningShown]);

  const SidebarItem: React.FC<{
    onClick?: () => void;
    icon:
      | React.ComponentType<
          React.SVGProps<SVGSVGElement> & { title?: string | undefined }
        >
      | React.ReactNode;
    label: string;
  }> = ({ onClick, icon: Icon, label }) => (
    <a className={classes.link + " cursor-pointer"} onClick={onClick}>
      {typeof Icon === "function" ? (
        <Icon className={classes.linkIcon} stroke="1.5" />
      ) : (
        <Group
          sx={(theme) => ({
            marginRight: theme.spacing.sm,
          })}
        >
          {Icon}
        </Group>
      )}
      <span>{label}</span>
    </a>
  );

  const groupedNavigation = data.reduce(
    (acc: Record<string, typeof data>, item: any) => {
      if (!acc[item.group]) {
        acc[item.group] = [];
      }
      acc[item.group].push(item);
      return acc;
    },
    {}
  );

  const links = Object.entries(groupedNavigation).map(([groupTitle, items]) => (
    <>
      {groupTitle !== "undefined" && (
        <div className={clsx("md:px-6 px-4 py-2 pt-3")}>
          <Divider mb="lg" />
          <Text weight={600} size="sm" color="dimmed">
            {groupTitle}
          </Text>
        </div>
      )}
      {items
        .filter((item) => item.show !== false)
        .map((item) => (
          <Link
            key={item.label}
            href={String(item.href)}
            onClick={(event) => {
              setActive(item.label as PageName);
              event.preventDefault();
            }}
            scroll={false}
          >
            <motion.a
              className={clsx(
                "dark:text-zinc-300s font-normal flex cursor-pointer items-center gap-2 w-full md:px-6 px-4 h-9 rounded-md relative transition ease-in-out duration-200",
                active === item.label.toLowerCase()
                  ? "dark:text-pink-200 text-pink-700 !font-medium"
                  : "dark:hover:text-zinc-200 dark:hover:bg-zinc-900",
                mobile &&
                  active === item.label.toLowerCase() &&
                  "dark:bg-pink-900/30"
              )}
              style={{
                fontSize: theme.fontSizes.sm,
              }}
            >
              {active === item.label.toLowerCase() && (
                <motion.span
                  layoutId="sidebar"
                  className={clsx(
                    "absolute left-0 right-0 top-0 bottom-0 rounded-md bg-pink-900/30",
                    mobile && "hidden"
                  )}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="bg-pink-800 w-[2px] rounded-full absolute top-2.5 left-2.5 h-4" />
                </motion.span>
              )}
              {React.createElement(item.icon)}
              {item.label}
            </motion.a>
          </Link>
        ))}
    </>
  ));

  return (
    <>
      <AppShell
        navbar={
          <Navbar
            width={{ sm: 300 }}
            p="md"
            hiddenBreakpoint="sm"
            hidden={!opened}
            sx={{
              ...(amoled && {
                backgroundColor: "black",
              }),
            }}
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
              <LayoutGroup id="sidebar">
                <div className="flex flex-col gap-y-1">{links}</div>
              </LayoutGroup>
            </Navbar.Section>

            <Navbar.Section className={classes.footer}>
              <SidebarItem
                icon={
                  <Avatar
                    size={20}
                    src={getMediaUrl(user?.avatarUri)}
                    radius={999}
                  />
                }
                label={user?.username || "..."}
              />
              <Link href={"/"}>
                <SidebarItem label="Return to Framework" icon={HiArrowLeft} />
              </Link>
              <Link href={"/admin/settings"}>
                <SidebarItem label="Settings" icon={HiCog} />
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
                    {page?.label}
                  </Text>
                  <Text size="sm" color="dimmed" lineClamp={1}>
                    {page?.subtitle}
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
            <Title mb={8}>{page?.label}</Title>
            <Text color="dimmed">{page?.subtitle}</Text>
          </Container>
        </Box>
        <Container>
          {page?.render && <ReactNoSSR>{page.render}</ReactNoSSR>}
        </Container>
        <Footer />
      </AppShell>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const user = await authorizedRoute(context, true, false, true);
  const { page } = context.query;
  const pageStr = typeof page === "string" ? page : "dashboard";

  if (user.redirect) {
    return user;
  }

  if (!data.find((item) => item.label.toLowerCase() === pageStr)) {
    return {
      redirect: {
        destination: "/404",
        permanent: false,
      },
    };
  }

  await prisma.adminActivityLog.create({
    data: {
      user: {
        connect: {
          id: Number(user.props.user?.id),
        },
      },
      importance: 1,
      activity: `Viewed the ${
        data.find((item) => item.label.toLowerCase() === pageStr)?.label
      } page`,
    },
  });

  return {
    props: {
      user: user.props.user,
      activePage: pageStr,
    },
  };
}

export default AdminDashboard;
