import { useFlags } from "@happykit/flags/client";
import {
  ActionIcon,
  Alert,
  Anchor,
  Badge,
  Box,
  Burger,
  Container,
  createStyles,
  Drawer,
  Group,
  Popover,
  ScrollArea,
  Stack,
  Tabs,
  Text,
  ThemeIcon,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure, useLocalStorage } from "@mantine/hooks";
import { SpotlightProvider } from "@mantine/spotlight";
import isElectron from "is-electron";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useState } from "react";
import {
  HiArrowLeft,
  HiCode,
  HiCog,
  HiGift,
  HiHome,
  HiLightBulb,
  HiMail,
  HiSearch,
  HiShieldCheck,
  HiShoppingBag,
  HiSpeakerphone,
  HiSun,
  HiTicket,
  HiUser,
  HiViewGrid,
} from "react-icons/hi";
import { getIpcRenderer } from "../util/electron";
import { User } from "../util/prisma-types";
import useConfig from "../util/useConfig";
import useMediaQuery from "../util/useMediaQuery";
import EmailReminder from "./EmailReminder";
import Footer from "./Footer";
import CurrencyMenu from "./Framework/CurrencyMenu";
import NotificationFlyout from "./Framework/NotificationFlyout";
import Search from "./Framework/Search";
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
  actions?: [string, () => void][];
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
}: FrameworkProps) => {
  const { classes } = frameworkStyles();
  const [opened, { toggle }] = useDisclosure(false);
  const [userMenuOpened, _setUserMenuOpened] = useState(false);
  const [currencyMenuOpened, _setCurrencyMenuOpened] = useState(false);
  const router = useRouter();
  const mobile = useMediaQuery("950");
  const config = useConfig();

  const tabs = [
    {
      label: "Home",
      href: "/",
      icon: <HiHome />,
      color: "pink",
    },
    {
      label: "Games",
      href: "/games",
      icon: <HiViewGrid />,
      color: "violet",
    },
    {
      label: "Catalog",
      href: "/catalog",
      icon: <HiShoppingBag />,
      color: "blue",
    },
    {
      label: "Invent",
      href: "/invent",
      icon: <HiLightBulb />,
      color: "teal",
    },
    {
      label: "Messages",
      href: "/messages",
      icon: <HiMail />,
      color: "green",
    },
    {
      label: "Avatar",
      href: "/avatar",
      icon: <HiUser />,
      color: "orange",
    },
    {
      label: "Settings",
      href: "/settings",
      icon: <HiCog />,
      color: "grape",
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
      title: "Messages",
      icon: <HiMail />,
      description: "Chat with your friends, or collaborate with others.",
      onTrigger: () => router.push("/messages"),
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
      onTrigger: () => router.push("/settings"),
    },
    {
      title: "Profile",
      icon: <HiUser />,
      description: "View your profile.",
      onTrigger: () => router.push(`/users/${user.id}`),
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
          onTrigger: () => router.push("/admin"),
        },
      ]);
    }
  }, [user]);

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
  const { flags } = useFlags();

  return (
    <SpotlightProvider
      actions={spotlight}
      searchIcon={<HiSearch size={18} />}
      searchPlaceholder="Search..."
      shortcut="mod + space"
      nothingFoundMessage="Nothing found..."
      disabled={user === null}
    >
      <div
        className={classes.header}
        style={{
          position: immersive ? "sticky" : "relative",
          top: 0,
          zIndex: 1000,
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
            paddingTop: mobile ? 10 : 0,
            paddingBottom: mobile ? 16 : 0,
          }}
        >
          <Group position="apart">
            <Group spacing={12}>
              <Link href="/" passHref>
                <FrameworkLogo />
              </Link>
              {process.env.NODE_ENV === "development" && <Badge>Preview</Badge>}
            </Group>

            {mobile && <Burger opened={opened} onClick={toggle} size="sm" />}
            {!mobile && user && (
              <Group>
                <NotificationFlyout
                  notificationData={user && user.notifications}
                />
                <CurrencyMenu currencyMenuOpened={currencyMenuOpened} />
                <UserMenu userMenuOpened={userMenuOpened} />
              </Group>
            )}
          </Group>

          {mobile && (
            <Tabs
              defaultValue={activeTab}
              variant="pills"
              classNames={{
                tabsList: classes.tabsList,
              }}
              mt={14}
            >
              <div>
                <ScrollArea>
                  <Tabs.List>
                    {tabs.map((tab) => (
                      <Tabs.Tab
                        value={tab.label.toLowerCase()}
                        key={tab.label}
                        onClick={() => {
                          router.push(tab.href);
                        }}
                        sx={{
                          width: "140px",
                        }}
                      >
                        <Group>
                          {tab.icon}
                          <Text>{tab.label}</Text>
                        </Group>
                      </Tabs.Tab>
                    ))}
                  </Tabs.List>
                </ScrollArea>
              </div>
            </Tabs>
          )}
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

        <Drawer
          opened={opened}
          onClose={toggle}
          position="right"
          sx={{
            zIndex: 1000,
          }}
        >
          <Container>
            <Stack spacing={24} mb={32}>
              {tabs.map((tab) => (
                <Group
                  onClick={() => {
                    router.push(tab.href);
                    toggle();
                  }}
                  key={tab.label}
                  sx={{ cursor: "pointer" }}
                >
                  <ThemeIcon
                    variant="outline"
                    color={tab.color}
                    size={24}
                    sx={(theme) => ({
                      boxShadow: `0 0 17px ${
                        theme.colors[tab.color][9] + "70"
                      }`,
                    })}
                  >
                    {tab.icon}
                  </ThemeIcon>
                  <Text
                    color={tab.color}
                    sx={(theme) => ({
                      color: theme.colors[tab.color][4] + "100",
                      borderBottom:
                        "3px solid " + theme.colors[tab.color][9] + "95",
                      transition: "all 0.3s ease-in-out",
                      "&:before": {
                        transition: "all 0.3s ease-in-out",
                      },
                      "&:hover": {
                        borderBottom:
                          "3px solid " + theme.colors[tab.color][9] + "90",
                      },
                      textShadow: `0 0 27px ${
                        theme.colors[tab.color][9] + "75"
                      }`,
                    })}
                  >
                    {tab.label}
                  </Text>
                </Group>
              ))}
            </Stack>

            {user && (
              <Group>
                <CurrencyMenu currencyMenuOpened={currencyMenuOpened} />
                <UserMenu userMenuOpened={userMenuOpened} />
                <NotificationFlyout
                  notificationData={user && user.notifications}
                />
                <Search />
              </Group>
            )}
          </Container>
        </Drawer>
      </div>

      {!noPadding ? (
        <>
          {flags?.bannerEnabled && (
            <Box
              sx={() => ({
                backgroundColor: "#e03131",
              })}
              p={12}
            >
              <Container
                sx={{
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <ThemeIcon color="yellow" size={28} mr={16}>
                  <HiSpeakerphone />
                </ThemeIcon>
                <Text weight={500} color="white">
                  {String(flags.bannerMessage)}
                </Text>
              </Container>
            </Box>
          )}
          {modernTitle && modernSubtitle && (
            <Box
              sx={(theme) => ({
                backgroundColor: theme.colorScheme === "dark" ? "#000" : "#fff",
                position: immersive ? "sticky" : "relative",
                zIndex: 500,
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
            {config?.features?.additional?.ukraine?.enabled && (
              <Alert mb={16} icon={<HiGift size={36} />}>
                {config.features.additional.ukraine.supportText}{" "}
                <Anchor
                  href={config.features.additional.ukraine.supportUrl}
                  target="_blank"
                >
                  Help Provide Humanitarian Aid to Ukraine
                </Anchor>
              </Alert>
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
