import Chat from "@/components/chat";
import Conditional from "@/components/conditional";
import ContextMenu from "@/components/context-menu";
import EmailReminder from "@/components/email-reminder";
import Footer from "@/components/foot";
import FrameworkLogo from "@/components/framework-logo";
import { useFrameworkComponentStyles } from "@/components/framework.styles";
import Banner from "@/components/framework/banner";
import CurrencyMenu from "@/components/framework/currency-menu";
import ImpersonationBanner from "@/components/framework/impersonation-banner";
import MobileSearchMenu from "@/components/framework/mobile-search";
import NotificationFlyout from "@/components/framework/notification-flyout";
import Search from "@/components/framework/search";
import UpdateDrawer from "@/components/framework/update-drawer";
import UserMenu from "@/components/framework/user-menu";
import TabNav from "@/components/tab-nav";
import appConfig from "@/config/app";
import { spotlight } from "@/config/spotlight";
import SocketContext from "@/contexts/Socket";
import { setSearch, toggleSearch } from "@/reducers/search";
import { RootState } from "@/reducers/store";
import useAmoled from "@/stores/useAmoled";
import useAuthorizedUserStore from "@/stores/useAuthorizedUser";
import useFeedback from "@/stores/useFeedback";
import { Flow } from "@/stores/useFlow";
import usePreferences from "@/stores/usePreferences";
import useSidebar from "@/stores/useSidebar";
import clsx from "@/util/clsx";
import { getIpcRenderer } from "@/util/electron";
import { Fw } from "@/util/fw";
import useMediaQuery from "@/util/media-query";
import { User } from "@/util/prisma-types";
import {
  ActionIcon,
  Affix,
  Anchor,
  Badge,
  Box,
  Burger,
  Button,
  Container,
  Drawer,
  Group,
  Menu,
  NavLink,
  Popover,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import { openConfirmModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { SpotlightProvider } from "@mantine/spotlight";
import { deleteCookie, getCookie } from "cookies-next";
import isElectron from "is-electron";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useContext, useEffect, useState } from "react";
import {
  HiArrowLeft,
  HiCode,
  HiDocumentText,
  HiExternalLink,
  HiGlobe,
  HiLogin,
  HiOfficeBuilding,
  HiOutlineLightningBolt,
  HiOutlineSearch,
  HiTrash,
  HiXCircle,
} from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";

const Products = dynamic(() => import("@/components/products"), {
  ssr: false,
});

type Tab =
  | "home"
  | "games"
  | "catalog"
  | "invent"
  | "social"
  | "avatar"
  | "settings"
  | "messages"
  | "none";
type FrameworkProps = {
  user: User;
  children: React.ReactNode;
  footer?: boolean;
  activeTab?: Tab;
  noPadding?: boolean;
  modernTitle?: string;
  noOverflow?: boolean;
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
};

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
  footer = true,
  noOverflow,
}: FrameworkProps) => {
  const { classes } = useFrameworkComponentStyles();
  const { opened: sidebarOpened, setOpened: setSidebarOpened } = useSidebar();
  const [userMenuOpened, _setUserMenuOpened] = useState(false);
  const [currencyMenuOpened] = useState(false);
  const router = useRouter();
  const mobile = useMediaQuery("950");
  const oldCookie = getCookie(".frameworksession.old");
  const [impersonating, setImpersonating] = useState(false);
  const [mobileSearchOpened, _setMobileSearchOpened] = useState(false);
  const { setOpened } = useFeedback();
  const { enabled: amoled } = useAmoled();
  const searchOpened = useSelector((state: RootState) => state.search.opened);
  const dispatch = useDispatch();

  useEffect(() => {
    if (sidebarOpened) {
      setSidebarOpened(false);
    }
  }, [router.asPath]);

  const [warningSeen, setEmailWarningSeen] = useLocalStorage({
    key: "email-warning-seen",
    defaultValue: false,
  });

  const [isSSR, setIsSSR] = useState(true);
  const socket = useContext(SocketContext);

  const items = appConfig.nav.map((tab) => (
    <TabNav.Tab
      value={tab.label.toLowerCase()}
      key={tab.label}
      onClick={() => {
        router.push(tab.href);
      }}
      icon={
        <span
          className={clsx("flex items-center justify-center", "text-dimmed")}
        >
          {tab.icon}
        </span>
      }
    >
      {tab.label}
    </TabNav.Tab>
  ));

  const { user: userStore, setUser: setUserStore } = useAuthorizedUserStore()!;

  React.useEffect(() => {
    setIsSSR(false);
  }, []);
  React.useEffect(() => {
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

    if (typeof window !== "undefined") {
      const handle = (e: KeyboardEvent) => {
        if (
          e.keyCode === 191 &&
          document.activeElement?.tagName !== "INPUT" &&
          document.activeElement?.tagName !== "TEXTAREA"
        ) {
          e.preventDefault();
          dispatch(toggleSearch());
        }
      };

      window.addEventListener("keydown", handle);

      return () => {
        window.removeEventListener("keydown", handle);
      };
    }
  }, []);

  return (
    <SpotlightProvider
      actions={spotlight.map((item) => ({
        title: item.title,
        description: item.description,
        icon: item.icon,
        onTrigger() {
          router.push(item.path);
        },
      }))}
      searchIcon={<HiOutlineSearch size={18} />}
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
        >
          <Chat />
        </Affix>
      )}
      <Conditional if={impersonating}>
        <ImpersonationBanner />
      </Conditional>
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
            <Group spacing="sm" className="relative">
              <Products />
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
                      onClick={() => {
                        Fw.Flows.toggleFlow(Flow.Logins, router);
                      }}
                      icon={<HiOutlineLightningBolt />}
                    >
                      Invoke test flow
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
                      href="https://github.com/SolariusNL/framework"
                      passHref
                    >
                      <Menu.Item icon={<HiExternalLink />}>
                        View on GitHub
                      </Menu.Item>
                    </Link>
                    <Link
                      href="https://github.com/SolariusNL/framework/issues/new"
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
            <Conditional if={mobile}>
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
            </Conditional>
            <Conditional if={!mobile && user}>
              <Group>
                <NotificationFlyout />
                {Fw.Feature.enabled(Fw.FeatureIdentifier.Bits) && (
                  <CurrencyMenu currencyMenuOpened={currencyMenuOpened} bits />
                )}
                <CurrencyMenu currencyMenuOpened={currencyMenuOpened} />
                <UserMenu userMenuOpened={userMenuOpened} />
              </Group>
            </Conditional>
            <Conditional if={!mobile && !user}>
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
            </Conditional>
          </Group>
        </Container>
        <Conditional if={!mobile}>
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
                opened={searchOpened}
                onClose={() => dispatch(setSearch(false))}
              >
                <Popover.Target>
                  <ActionIcon
                    variant="subtle"
                    onClick={() => dispatch(toggleSearch())}
                    mb={10}
                  >
                    <HiOutlineSearch />
                  </ActionIcon>
                </Popover.Target>

                <Popover.Dropdown p={0} className="border-0">
                  <Search />
                </Popover.Dropdown>
              </Popover>
            </Group>
          </Container>
        </Conditional>
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
              {appConfig.nav.map((tab) => (
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
      <Conditional if={!noPadding}>
        <Conditional if={modernTitle && modernSubtitle}>
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
        </Conditional>
      </Conditional>
      <Conditional if={!noPadding}>
        <Container
          mt={noContentPadding ? 0 : 26}
          sx={{
            ...(noContentPadding && {
              padding: "0px",
              maxWidth: "100%",
            }),
            ...(noOverflow && {
              overflow: "hidden",
            }),
          }}
        >
          {user && !user.emailVerified && !warningSeen && !isSSR && (
            <EmailReminder setWarningSeen={setEmailWarningSeen} />
          )}
          {children}
        </Container>
      </Conditional>
      <Conditional if={noPadding}>
        <div>{children}</div>
      </Conditional>
      <Conditional if={!immersive && footer}>
        <Footer />
      </Conditional>
    </SpotlightProvider>
  );
};

export default Framework;
