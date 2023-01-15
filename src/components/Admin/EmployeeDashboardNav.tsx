import {
  AppShell,
  Badge,
  Box,
  Burger,
  Container,
  createStyles,
  Group,
  Header,
  MediaQuery,
  Navbar,
  Text,
  Title,
} from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  HiArrowLeft,
  HiBookmark,
  HiChartBar,
  HiCheck,
  HiCog,
  HiHome,
  HiLogout,
  HiPresentationChartBar,
} from "react-icons/hi";
import ReactNoSSR from "react-no-ssr";
import useAuthorizedUserStore from "../../stores/useAuthorizedUser";
import logout from "../../util/api/logout";
import { User } from "../../util/prisma-types";
import useMediaQuery from "../../util/useMediaQuery";
import Footer from "../Footer";
import UserMenu from "../Framework/UserMenu";
import FrameworkLogo from "../FrameworkLogo";
import EmployeeHome from "./Employee/Home";
import Tasks from "./Employee/Tasks";
import Directory from "./Pages/Directory";

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
    label: "Home",
    icon: HiHome,
    href: "/admin/employee/home",
    render: () => <EmployeeHome />,
    subtitle: "Manage your employment at Soodam.re",
  },
  {
    label: "Directory",
    icon: HiBookmark,
    href: "/admin/employee/directory",
    render: () => <Directory />,
    subtitle: "View the directory of all employees",
  },
  {
    label: "Tasks",
    icon: HiCheck,
    href: "/admin/employee/tasks",
    render: () => <Tasks />,
    subtitle: "View your tasks and manage them",
  },
  {
    label: "Assessments",
    icon: HiPresentationChartBar,
    href: "/admin/employee/assessments",
    render: () => <p>Assessments</p>,
    subtitle: "Take assessments and view your results",
  },
  {
    label: "Performance",
    icon: HiChartBar,
    href: "/admin/employee/performance",
    render: () => <p>Performance</p>,
    subtitle: "View your performance and manage it",
  },
  {
    label: "Settings",
    icon: HiCog,
    href: "/admin/employee/settings",
    render: () => <p>Settings</p>,
    subtitle: "Manage your employee settings",
  },
];

export type PageName =
  | "home"
  | "directory"
  | "tasks"
  | "assessments"
  | "performance"
  | "settings";

const EmployeeDashboardNav: React.FC<{
  activePage: PageName;
  user: User;
}> = ({ activePage, user }) => {
  const { classes, cx, theme } = useStyles();
  const [active, setActive] = useState(activePage || "home");
  const { setUser } = useAuthorizedUserStore()!;
  const router = useRouter();
  const page =
    data.find((item) => item.label.toLowerCase() === active) || data[0];
  const mobile = useMediaQuery("768");
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    if (user) {
      setUser(user);
    }
  }, [user]);

  const links = data.map((item) => (
    <Link
      key={item.label}
      href={item.href}
      onClick={(event) => {
        setActive(item.label as PageName);
        event.preventDefault();
      }}
    >
      <a
        className={cx(classes.link, {
          [classes.linkActive]: item.label.toLowerCase() === active,
        })}
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
          >
            <Navbar.Section grow>
              <Group className={classes.header} position="apart">
                <FrameworkLogo />
                <Badge>Beta</Badge>
              </Group>
              {links}
            </Navbar.Section>

            <Navbar.Section className={classes.footer}>
              <UserMenu right userMenuOpened={null as any} />
              <Link href={"/admin/dashboard"}>
                <a className={classes.link + " cursor-pointer"}>
                  <HiArrowLeft className={classes.linkIcon} stroke="1.5" />
                  <span>Return to Framework</span>
                </a>
              </Link>
              <a
                className={classes.link + " cursor-pointer"}
                onClick={async () =>
                  await logout().then(() => router.push("/login"))
                }
              >
                <HiLogout className={classes.linkIcon} stroke="1.5" />
                <span>Logout</span>
              </a>
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

                <FrameworkLogo />
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
          {page?.render && <ReactNoSSR>{page.render()}</ReactNoSSR>}
        </Container>
        <Footer />
      </AppShell>
    </>
  );
};

export default EmployeeDashboardNav;
