import {
  AppShell,
  Avatar,
  Badge,
  Box,
  Burger,
  Container,
  createStyles,
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
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  HiArrowLeft,
  HiBeaker,
  HiBookmark,
  HiCheck,
  HiCog,
  HiDocument,
  HiFolder,
  HiGift,
  HiHome,
  HiIdentification,
  HiKey,
  HiServer,
  HiTicket,
  HiUsers,
  HiWifi,
} from "react-icons/hi";
import ReactNoSSR from "react-no-ssr";
import Tasks from "../../components/Admin/Employee/Tasks";
import Activity from "../../components/Admin/Pages/Activity";
import Articles from "../../components/Admin/Pages/Articles";
import BannedIPs from "../../components/Admin/Pages/BannedIPs";
import Cosmic from "../../components/Admin/Pages/Cosmic";
import Dashboard from "../../components/Admin/Pages/Dashboard";
import Directory from "../../components/Admin/Pages/Directory";
import Experiments from "../../components/Admin/Pages/Experiments";
import Gifts from "../../components/Admin/Pages/Gifts";
import Instance from "../../components/Admin/Pages/Instance";
import Invites from "../../components/Admin/Pages/Invites";
import Reports from "../../components/Admin/Pages/Reports";
import Tickets from "../../components/Admin/Pages/Tickets";
import Users from "../../components/Admin/Pages/Users";
import Settings from "../../components/Admin/Settings";
import Footer from "../../components/Footer";
import FrameworkLogo from "../../components/FrameworkLogo";
import ShadedCard from "../../components/ShadedCard";
import useAmoled from "../../stores/useAmoled";
import useAuthorizedUserStore from "../../stores/useAuthorizedUser";
import authorizedRoute from "../../util/auth";
import getMediaUrl from "../../util/get-media";
import useMediaQuery from "../../util/media-query";
import prisma from "../../util/prisma";
import { User } from "../../util/prisma-types";

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
    icon: HiFolder,
    href: "/admin/articles",
    render: <Articles />,
    subtitle: "View news and announcements from HR",
  },
  {
    label: "Keys",
    icon: HiKey,
    href: "/admin/keys",
    render: <Invites />,
    subtitle: "Manage your keys and invites",
  },
  {
    label: "Users",
    icon: HiUsers,
    href: "/admin/users",
    render: <Users />,
    subtitle: "Manage users, roles, permissions, and more",
  },
  {
    label: "Instance",
    icon: HiServer,
    href: "/admin/instance",
    render: <Instance />,
    subtitle: "Manage this Framework instance",
  },
  {
    label: "Reports",
    icon: HiBookmark,
    href: "/admin/reports",
    render: <Reports />,
    subtitle: "View reports made by users",
  },
  {
    label: "IPs",
    icon: HiWifi,
    href: "/admin/ips",
    render: <BannedIPs />,
    subtitle: "Manage banned IPs",
  },
  {
    label: "Tickets",
    icon: HiTicket,
    href: "/admin/tickets",
    render: <Tickets />,
    subtitle: "Manage user-submitted support tickets",
  },
  {
    label: "Directory",
    icon: HiBookmark,
    href: "/admin/directory",
    render: <Directory />,
    subtitle: "View the directory of all employees",
  },
  {
    label: "Gifts",
    icon: HiGift,
    href: "/admin/gifts",
    render: <Gifts />,
    subtitle: "Manage redeemable gift codes",
  },
  {
    label: "Tasks",
    icon: HiCheck,
    href: "/admin/tasks",
    render: <Tasks />,
    subtitle: "View your tasks and manage them",
  },
  {
    label: "Activity",
    icon: HiDocument,
    href: "/admin/activity",
    render: <Activity />,
    subtitle: "Review admin activity logs",
  },
  {
    label: "Cosmic",
    icon: HiServer,
    href: "/admin/cosmic",
    render: <Cosmic />,
    subtitle: "Manage Cosmic servers through the Nucleus API",
  },
  {
    label: "ID",
    icon: HiIdentification,
    href: "https://id.soodam.rocks",
    external: true,
    render: (
      <ShadedCard className="w-full py-24 flex items-center justify-center">
        <Loader />
      </ShadedCard>
    ),
    subtitle: "Quick links managed by Soodam.re Employee Identity",
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
  });

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

  const links = data
    .filter((item) => item.show !== false)
    .map((item) => (
      <Link
        key={item.label}
        href={String(item.href)}
        onClick={(event) => {
          setActive(item.label as PageName);
          event.preventDefault();
        }}
      >
        <a
          className={cx(classes.link, {
            [classes.linkActive]: item.label.toLowerCase() === active,
          })}
          target={item.external ? "_blank" : undefined}
          rel={item.external ? "noopener noreferrer" : undefined}
        >
          <item.icon className={classes.linkIcon} stroke="1.5" />
          <span>{item.label}</span>
        </a>
      </Link>
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
                  Corporate
                </Badge>
              </Group>
            </Navbar.Section>

            <Navbar.Section grow component={ScrollArea}>
              {links}
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
