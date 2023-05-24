import {
  ActionIcon,
  Affix,
  Anchor,
  Badge,
  Box,
  Burger,
  Button,
  Container,
  createStyles,
  Drawer,
  Group,
  Menu,
  NavLink,
  Popover,
  Stack,
  Text,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { openConfirmModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { SpotlightProvider } from "@mantine/spotlight";
import { deleteCookie, getCookie, setCookie } from "cookies-next";
import isElectron from "is-electron";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import {
  HiArrowLeft,
  HiCheckCircle,
  HiCode,
  HiCog,
  HiDocumentText,
  HiExternalLink,
  HiGift,
  HiGlobe,
  HiHome,
  HiLightBulb,
  HiLogin,
  HiMail,
  HiOfficeBuilding,
  HiPhotograph,
  HiSearch,
  HiShieldCheck,
  HiShoppingBag,
  HiSun,
  HiTicket,
  HiTrash,
  HiUser,
  HiViewGrid,
  HiXCircle,
} from "react-icons/hi";
import SocketContext from "../contexts/Socket";
import useAmoled from "../stores/useAmoled";
import useAuthorizedUserStore from "../stores/useAuthorizedUser";
import useFeedback from "../stores/useFeedback";
import usePreferences from "../stores/usePreferences";
import useSidebar from "../stores/useSidebar";
import logout from "../util/api/logout";
import { getIpcRenderer } from "../util/electron";
import { Fw } from "../util/fw";
import useMediaQuery from "../util/media-query";
import { User } from "../util/prisma-types";
import Chat from "./Chat";
import ContextMenu from "./ContextMenu";
import EmailReminder from "./EmailReminder";
import Footer from "./Footer";
import Banner from "./Framework/Banner";
import CurrencyMenu from "./Framework/CurrencyMenu";
import MobileSearchMenu from "./Framework/MobileSearchMenu";
import NotificationFlyout from "./Framework/NotificationFlyout";
import Search from "./Framework/Search";
import UpdateDrawer from "./Framework/UpdateDrawer";
import UserMenu from "./Framework/UserMenu";
import FrameworkLogo from "./FrameworkLogo";
import TabNav from "./TabNav";

interface FrameworkProps {
  user: User;
  children: React.ReactNode;
  activeTab:
    | "home"
    | "games"
    | "catalog"
    | "invent"
    | "chat"
    | "avatar"
    | "settings"
    | "messages"
    | "none";
  // @deprecated - use noContentPadding instead
  noPadding?: boolean;
  modernTitle?: string;
  modernSubtitle?: string;
  noContentPadding?: boolean;
  immersive?: boolean;
  beta?: boolean;
  returnTo?: {
    label: string;
    href: string;
  };
  actions?: [string | React.ReactNode, () => void][];
  integratedTabs?: React.ReactNode;
  relative?: boolean;
}

export const frameworkStyles = createStyles((theme) => ({
  header: {
    paddingTop: theme.spacing.sm,
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[6]
        : theme.colors.gray[0],
    borderBottom: `1px solid ${
      theme.colorScheme === "dark" ? "transparent" : theme.colors.gray[2]
    }`,
  },

  mainSection: {
    paddingBottom: theme.spacing.sm,
  },

  user: {
    color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,
    padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
    borderRadius: theme.radius.md,
    transition: "background-color 100ms ease",

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.white,
    },
  },

  userActive: {
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.white,
  },

  currency: {
    color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,
    padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
    borderRadius: theme.radius.md,
    transition: "background-color 100ms ease",

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.white,
    },
  },

  currencyActive: {
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.white,
  },

  tabsList: {
    borderBottom: "0 !important",
  },
}));

const Framework = ({
  user,
  children,
  activeTab,
  noPadding,
  modernTitle,
  modernSubtitle,
  noContentPadding,
  immersive,
  beta,
  returnTo,
  actions,
  integratedTabs,
  relative,
}: FrameworkProps) => {
  const { classes } = frameworkStyles();
  const { opened: sidebarOpened, setOpened: setSidebarOpened } = useSidebar();
  const [userMenuOpened, _setUserMenuOpened] = useState(false);
  const [currencyMenuOpened, _setCurrencyMenuOpened] = useState(false);
  const router = useRouter();
  const mobile = useMediaQuery("950");
  const oldCookie = getCookie(".frameworksession.old");
  const [impersonating, setImpersonating] = useState(false);
  const [mobileSearchOpened, _setMobileSearchOpened] = useState(false);
  const { setOpened } = useFeedback();
  const { enabled: amoled } = useAmoled();

  useEffect(() => {
    if (sidebarOpened) {
      setSidebarOpened(false);
    }
  }, [router.asPath]);

  const tabs = [
    {
      label: "Home",
      href: "/",
      icon: <HiHome />,
      color: "pink",
      description: "Your experience at a glance",
    },
    {
      label: "Games",
      href: "/games",
      icon: <HiViewGrid />,
      color: "violet",
      description: "Browse Frameworks catalog of immersive games",
    },
    {
      label: "Catalog",
      href: "/catalog",
      icon: <HiShoppingBag />,
      color: "blue",
      description: "Find some new items for your avatar",
    },
    {
      label: "Invent",
      href: "/invent",
      icon: <HiLightBulb />,
      color: "teal",
      description: "Where imagination comes to life",
    },
    {
      label: "Social",
      href: "/social",
      icon: <HiPhotograph />,
      color: "green",
      description: "See what your friends are up to",
    },
    {
      label: "Avatar",
      href: "/avatar",
      icon: <HiUser />,
      color: "orange",
      description: "Manage your avatar",
    },
    {
      label: "Settings",
      href: "/settings/account",
      icon: <HiCog />,
      color: "grape",
      description: "Manage your account and other settings",
    },
  ];
  const { toggleColorScheme } = useMantineColorScheme();
  let [spotlight, setSpotlight] = useState([
    {
      title: "Home",
      icon: <HiHome />,
      description: "Your experience starts here.",
      onTrigger: () => router.push("/"),
    },
    {
      title: "Games",
      icon: <HiViewGrid />,
      description: "Find games to play on Framework.",
      onTrigger: () => router.push("/games"),
    },
    {
      title: "Catalog",
      icon: <HiShoppingBag />,
      description:
        "Find new items for your avatar, or purchase other digital goods.",
      onTrigger: () => router.push("/catalog"),
    },
    {
      title: "Invent",
      icon: <HiLightBulb />,
      description: "Where dreams are made, create your first game here.",
      onTrigger: () => router.push("/invent"),
    },
    {
      title: "Chat",
      icon: <HiMail />,
      description: "Chat with your friends in real time.",
      onTrigger: () => router.push("/chat"),
    },
    {
      title: "Avatar",
      icon: <HiUser />,
      description: "Customize your avatar.",
      onTrigger: () => router.push("/avatar"),
    },
    {
      title: "Settings",
      icon: <HiCog />,
      description: "Change your account settings.",
      onTrigger: () => router.push("/settings/account"),
    },
    {
      title: "Profile",
      icon: <HiUser />,
      description: "View your profile.",
      onTrigger: () => router.push(`/users/${user.username}`),
    },
    {
      title: "Daily prize",
      icon: <HiGift />,
      description: "Claim your daily prize.",
      onTrigger: () => router.push("/prizes"),
    },
    {
      title: "Redeem gift code",
      icon: <HiGift />,
      description: "Redeem a gift code.",
      onTrigger: () => router.push("/redeem"),
    },
    {
      title: "Tickets",
      icon: <HiTicket />,
      description: "View your ticket dashboard.",
      onTrigger: () => router.push("/tickets"),
    },
    {
      title: "Ticket history",
      icon: <HiTicket />,
      description: "View your ticket transaction history.",
      onTrigger: () => router.push("/tickets/transactions"),
    },
    {
      title: "Purchase tickets",
      icon: <HiTicket />,
      description: "Purchase tickets.",
      onTrigger: () => router.push("/tickets/buy"),
    },
    {
      title: "Change theme",
      icon: <HiSun />,
      description: "Change the UI color scheme.",
      onTrigger: () => toggleColorScheme(),
      disabled: amoled,
    },
    {
      title: "Browse snippets",
      icon: <HiCode />,
      description: "Browse code snippets from the community.",
      onTrigger: () => router.push("/snippets"),
    },
  ]);

  const [warningSeen, setEmailWarningSeen] = useLocalStorage({
    key: "email-warning-seen",
    defaultValue: false,
  });

  const [isSSR, setIsSSR] = useState(true);
  const socket = useContext(SocketContext);

  const items = tabs.map((tab) => (
    <TabNav.Tab
      value={tab.label.toLowerCase()}
      key={tab.label}
      onClick={() => {
        router.push(tab.href);
      }}
      icon={tab.icon}
    >
      {tab.label}
    </TabNav.Tab>
  ));

  const [searchPopoverOpen, setSearchPopoverOpen] = useState(false);
  const { user: userStore, setUser: setUserStore } = useAuthorizedUserStore()!;

  React.useEffect(() => {
    setIsSSR(false);
  }, []);
  React.useEffect(() => {
    if (user && user.role && user.role === "ADMIN") {
      setSpotlight([
        ...spotlight,
        {
          title: "Admin Dashboard",
          icon: <HiShieldCheck />,
          description: "Manage your Framework instance.",
          onTrigger: () => router.push("/admin/dashboard"),
        },
      ]);
    }

    if (user) {
      setUserStore(user);
    }
  }, [user]);
  React.useEffect(() => {
    if (socket && userStore) {
      socket?.on("@user/notification", (data) => {
        setUserStore({
          ...userStore,
          notifications: [...userStore.notifications, data],
        });
      });
    }

    return () => {
      socket?.off("@user/notification");
    };
  }, [user, socket]);
  React.useEffect(() => {
    if (oldCookie) {
      setImpersonating(true);
    }
  }, []);

  return (
    <SpotlightProvider
      actions={spotlight.filter((s) => !s.disabled)}
      searchIcon={<HiSearch size={18} />}
      searchPlaceholder="Search..."
      shortcut="mod + space"
      nothingFoundMessage="Nothing found..."
      disabled={user === null}
      radius="md"
      limit={7}
      transition="slide-up"
      className={relative ? "relative" : ""}
    >
      {usePreferences().preferences["@chat/enabled"] && (
        <Affix
          position={{
            bottom: 0,
            right: mobile ? 12 : 40,
          }}
          zIndex={1000}
        >
          <Chat />
        </Affix>
      )}
      {impersonating && (
        <Box
          sx={(theme) => ({
            backgroundColor: theme.colorScheme === "dark" ? "black" : "white",
            borderBottom: `1px solid ${
              theme.colorScheme === "dark"
                ? "transparent"
                : theme.colors.gray[2]
            }`,
          })}
          py="md"
        >
          <Container className="flex justify-between items-center">
            <Text>
              You are impersonating{" "}
              <span className="font-bold">{user?.username}</span>.{" "}
            </Text>
            <Button
              variant="white"
              onClick={async () => {
                const newCookie = getCookie(".frameworksession.old");

                await logout().then(() => {
                  setCookie(".frameworksession", newCookie);
                  deleteCookie(".frameworksession.old");

                  router.push("/admin/users");
                  showNotification({
                    title: "Impersonation stopped",
                    message: "You are no longer impersonating this user.",
                    icon: <HiCheckCircle />,
                  });
                });
              }}
            >
              Stop impersonating
            </Button>
          </Container>
        </Box>
      )}
      <div
        className={classes.header}
        style={{
          position: immersive ? "sticky" : "relative",
          top: 0,
          ...(amoled && {
            backgroundColor: "#000",
          }),
        }}
        onDoubleClick={() => {
          if (isElectron()) {
            if (process.platform === "darwin") {
              getIpcRenderer().send("@app/maximize");
            }
          }
        }}
      >
        <Container
          className={classes.mainSection}
          sx={{
            paddingTop: 0,
            paddingBottom: mobile ? 16 : 0,
          }}
        >
          <Group position="apart">
            <Group spacing={12}>
              <ContextMenu
                width={200}
                className="items-center flex"
                dropdown={
                  <>
                    <Menu.Label>
                      Developer utilities - you found a secret place!
                    </Menu.Label>
                    <Menu.Item
                      color="pink"
                      icon={<HiGlobe />}
                      onClick={() => setOpened(true)}
                    >
                      Send feedback
                    </Menu.Item>
                    <Menu.Item
                      color="grape"
                      icon={<HiCode />}
                      onClick={() => {
                        try {
                          getIpcRenderer().send("@app/preview");
                        } catch {
                          showNotification({
                            title: "Error",
                            message:
                              "Could not initiate preview mode. Are you running Framework in a browser? This feature is only functional in the desktop app.",
                            icon: <HiXCircle />,
                            color: "red",
                          });
                        }
                      }}
                    >
                      Enable preview mode
                    </Menu.Item>
                    <Menu.Item
                      color="violet"
                      icon={<HiOfficeBuilding />}
                      onClick={() => {
                        try {
                          getIpcRenderer().send("@app/devtools");
                        } catch {
                          showNotification({
                            title: "Error",
                            message:
                              "Could not open devtools. Are you running Framework in a browser? This feature is only functional in the desktop app.",
                            icon: <HiXCircle />,
                            color: "red",
                          });
                        }
                      }}
                    >
                      Open DevTools
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item
                      color="red"
                      icon={<HiTrash />}
                      onClick={() => {
                        localStorage.clear();
                        openConfirmModal({
                          title: "LocalStorage cleared",
                          children: (
                            <Text size="sm" color="dimmed">
                              LocalStorage has been reset. Please reload the
                              application.
                            </Text>
                          ),
                          labels: { confirm: "Refresh", cancel: "Not now" },
                          onConfirm: () => router.reload(),
                        });
                      }}
                    >
                      Clear LocalStorage
                    </Menu.Item>
                    <Menu.Item
                      color="red"
                      icon={<HiTrash />}
                      onClick={() => {
                        const cookies = document.cookie.split(";");
                        for (var i = 0; i < cookies.length; i++)
                          deleteCookie(cookies[i].split("=")[0]);
                      }}
                    >
                      Clear Cookies
                    </Menu.Item>
                    <Menu.Divider />
                    <Link
                      href="https://invent.soodam.rocks/Soodam.re/framework"
                      passHref
                    >
                      <Menu.Item icon={<HiExternalLink />}>
                        View on GitLab
                      </Menu.Item>
                    </Link>
                    <Link
                      href="https://invent.soodam.rocks/Soodam.re/framework/-/issues/new"
                      passHref
                    >
                      <Menu.Item icon={<HiExternalLink />}>
                        Report an issue
                      </Menu.Item>
                    </Link>
                  </>
                }
              >
                <Link href="/" passHref>
                  <FrameworkLogo square={mobile} />
                </Link>
              </ContextMenu>
              {process.env.NODE_ENV === "development" && (
                <Badge className="md:block hidden">Dev</Badge>
              )}
            </Group>

            {mobile && (
              <div className="flex items-center gap-1">
                {user ? (
                  <>
                    <MobileSearchMenu opened={mobileSearchOpened} />
                    <NotificationFlyout />
                    <CurrencyMenu
                      currencyMenuOpened={currencyMenuOpened}
                      minimal
                      bits
                    />
                    <CurrencyMenu
                      currencyMenuOpened={currencyMenuOpened}
                      minimal
                    />
                    <UserMenu userMenuOpened={userMenuOpened} minimal />
                    <Burger
                      opened={sidebarOpened}
                      onClick={() => setSidebarOpened(true)}
                      size="sm"
                      ml="sm"
                    />
                  </>
                ) : (
                  <>
                    <Link href="/register" passHref>
                      <Button size="sm" component="a" mr={4} variant="default">
                        Register
                      </Button>
                    </Link>
                    <Link href="/login" passHref>
                      <Button size="sm" component="a" variant="default">
                        Login
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            )}
            {!mobile && user && (
              <Group>
                <NotificationFlyout />
                {Fw.Feature.enabled(Fw.FeatureIdentifier.Bits) && (
                  <CurrencyMenu currencyMenuOpened={currencyMenuOpened} bits />
                )}
                <CurrencyMenu currencyMenuOpened={currencyMenuOpened} />

                <UserMenu userMenuOpened={userMenuOpened} />
              </Group>
            )}
            {!mobile && !user && (
              <Group>
                <Link href="/login" passHref>
                  <Button variant="default" leftIcon={<HiLogin />}>
                    Log in
                  </Button>
                </Link>
                <Link href="/register" passHref>
                  <Button leftIcon={<HiDocumentText />}>Sign up</Button>
                </Link>
              </Group>
            )}
          </Group>
        </Container>
        {!mobile && (
          <Container mt={10}>
            <Group position="apart">
              <TabNav
                defaultValue={activeTab}
                classNames={{
                  tabsList: classes.tabsList,
                }}
              >
                <TabNav.List>{items}</TabNav.List>
              </TabNav>

              <Popover
                transition="pop-top-right"
                position="bottom-end"
                shadow={"md"}
                opened={searchPopoverOpen}
                onChange={setSearchPopoverOpen}
              >
                <Popover.Target>
                  <ActionIcon
                    variant="subtle"
                    onClick={() => setSearchPopoverOpen(!searchPopoverOpen)}
                    mb={10}
                  >
                    <HiSearch />
                  </ActionIcon>
                </Popover.Target>

                <Popover.Dropdown>
                  <Search
                    opened={searchPopoverOpen}
                    setOpened={setSearchPopoverOpen}
                  />
                </Popover.Dropdown>
              </Popover>
            </Group>
          </Container>
        )}
        <UpdateDrawer />
        <Drawer
          opened={sidebarOpened}
          onClose={() => setSidebarOpened(false)}
          position="right"
          sx={{
            zIndex: 1000,
          }}
        >
          <Container>
            <Stack spacing={"xs"} mb="md">
              {tabs.map((tab) => (
                <Link href={tab.href} passHref key={tab.href}>
                  <NavLink
                    className="rounded-md"
                    icon={tab.icon}
                    description={tab.description}
                    label={tab.label}
                    active={router.pathname === tab.href}
                  />
                </Link>
              ))}
            </Stack>

            {!user && (
              <Group grow>
                <Link href="/login" passHref>
                  <Button variant="default" leftIcon={<HiLogin />}>
                    Log in
                  </Button>
                </Link>
                <Link href="/register" passHref>
                  <Button leftIcon={<HiDocumentText />}>Sign up</Button>
                </Link>
              </Group>
            )}
          </Container>
        </Drawer>
      </div>
      <Banner />
      {!noPadding ? (
        <>
          {modernTitle && modernSubtitle && (
            <Box
              sx={(theme) => ({
                backgroundColor: theme.colorScheme === "dark" ? "#000" : "#fff",
                position: immersive ? "sticky" : "relative",
                top: immersive ? "108.7px" : "0",
              })}
              mb={noContentPadding ? 0 : 32}
              p={32}
            >
              <Container>
                <Group position="apart">
                  <div>
                    <Title mb={8}>
                      {modernTitle}
                      {beta && (
                        <Badge
                          sx={{
                            verticalAlign: "middle",
                          }}
                          ml={12}
                        >
                          Beta
                        </Badge>
                      )}
                    </Title>
                    <Text color="dimmed">{modernSubtitle}</Text>
                    {returnTo && (
                      <Link href={returnTo.href} passHref>
                        <Anchor
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                          mt={16}
                        >
                          <HiArrowLeft />
                          {returnTo.label}
                        </Anchor>
                      </Link>
                    )}
                  </div>
                  <div className={mobile ? "flex gap-2" : ""}>
                    {actions && (
                      <div>
                        {actions.map(([label, onClick], index) => (
                          <Anchor
                            key={index}
                            onClick={onClick}
                            sx={(theme) => ({
                              color:
                                theme.colorScheme === "dark" ? "#fff" : "#000",
                              "&:after": {
                                content: "''",
                                display: "block",
                                width: "100%",
                                height: "2px",
                                backgroundColor:
                                  theme.colorScheme === "dark"
                                    ? "#fff"
                                    : "#000" + "80",
                                transform: "scaleX(0)",
                                transition: "transform 0.3s ease-in-out",
                              },
                              fontWeight: 500,
                            })}
                          >
                            {label}
                          </Anchor>
                        ))}
                      </div>
                    )}
                  </div>
                </Group>
                {integratedTabs && <div className="mt-8">{integratedTabs}</div>}
              </Container>
            </Box>
          )}
          <Container
            mt={noContentPadding ? 0 : 26}
            sx={{
              ...(noContentPadding && {
                padding: "0px",
                maxWidth: "100%",
              }),
            }}
          >
            {user && !user.emailVerified && !warningSeen && !isSSR && (
              <EmailReminder setWarningSeen={setEmailWarningSeen} />
            )}
            {children}
          </Container>
        </>
      ) : (
        <div>{children}</div>
      )}
      {!immersive && <Footer />}
    </SpotlightProvider>
  );
};

export default Framework;
