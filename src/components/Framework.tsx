import { useFlags } from "@happykit/flags/client";
import {
  ActionIcon,
  Alert,
  Anchor,
  Autocomplete,
  Avatar,
  Badge,
  Box,
  Burger,
  Container,
  createStyles,
  Drawer,
  Group,
  Kbd,
  Menu,
  Popover,
  ScrollArea,
  Stack,
  Tabs,
  Text,
  ThemeIcon,
  Title,
  UnstyledButton,
  useMantineColorScheme,
} from "@mantine/core";
import { useDisclosure, useLocalStorage } from "@mantine/hooks";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useRef, useState } from "react";
import {
  HiArrowLeft,
  HiChevronDown,
  HiCog,
  HiCurrencyDollar,
  HiGift,
  HiHome,
  HiLibrary,
  HiLightBulb,
  HiLogout,
  HiMail,
  HiMoon,
  HiSearch,
  HiSearchCircle,
  HiShoppingBag,
  HiSpeakerphone,
  HiStar,
  HiSun,
  HiTicket,
  HiUser,
  HiViewGrid,
  HiViewList,
} from "react-icons/hi";
import abbreviateNumber from "../util/abbreviate";
import logout from "../util/api/logout";
import { User } from "../util/prisma-types";
import useConfig from "../util/useConfig";
import useMediaQuery from "../util/useMediaQuery";
import EmailReminder from "./EmailReminder";
import Footer from "./Footer";
import NotificationFlyout from "./NotificationFlyout";
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
}

const HeaderStyle = {
  marginTop: 0,
  marginBottom: 0,
  backgroundImage:
    "url('https://assets-global.website-files.com/600ead1452cf056d0e52dbed/603408f80d379f66929884cf_PurpleBackground%20(1).png')",
  backgroundPosition: "0 15%",
  backgroundSize: "cover",
  fontSize: "1.2rem",
  lineHeight: "1em",
  fontWeight: "900",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  WebkitTextFillColor: "transparent",
  opacity: 1,
  transform:
    "translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)",
  transformStyle: "preserve-3d",
} as React.CSSProperties;

const useStyles = createStyles((theme) => ({
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

const Search = ({ ref }: { ref: React.RefObject<HTMLInputElement> }) => {
  const [search, setSearch] = React.useState("");
  const router = useRouter();
  const searchOptions = [
    search.trim().length > 0
      ? ["games", "users", "catalog", "sounds"].map((provider) => {
          return {
            value: `Search ${provider} for "${search}"`,
            provider: provider,
            query: search,
          };
        })
      : [],
  ].flat();

  return (
    <Autocomplete
      icon={<HiSearchCircle />}
      placeholder="Search Framework"
      variant="default"
      type="search"
      styles={{ rightSection: { pointerEvents: "none" } }}
      rightSectionWidth={90}
      rightSection={
        <div style={{ display: "flex", alignItems: "center" }}>
          <Kbd>Ctrl</Kbd>
          <span style={{ margin: "0 5px" }}>+</span>
          <Kbd>K</Kbd>
        </div>
      }
      value={search}
      onChange={setSearch}
      data={searchOptions}
      onItemSubmit={(item) => {
        const { provider, query } = item;

        setSearch("");
        router.push(`/search?query=${query}&category=${provider}`);
      }}
      ref={ref}
    />
  );
};

const UserMenu = ({ classes, userMenuOpened, user, cx, router }: any) => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <Menu transition="pop-top-right" width={240}>
      <Menu.Target>
        <UnstyledButton
          className={cx(classes.user, {
            [classes.userActive]: userMenuOpened,
          })}
        >
          <Group spacing={12}>
            <Avatar
              src={
                user.avatarUri ||
                `https://avatars.dicebear.com/api/identicon/${user.id}.png`
              }
              alt={user.username}
              radius="xl"
              size={20}
            />
            <Text weight={500} size="sm" sx={{ lineHeight: 1 }} mr={3}>
              {user.username}
            </Text>
            <HiChevronDown size={12} stroke="1.5" />
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>
          👻 Framework {process.env.NEXT_PUBLIC_VERSION} - Built by Emil, Rosé{" "}
          {"&"} contributors
        </Menu.Label>
        <Menu.Divider />
        {user.role == "ADMIN" && (
          <>
            <Menu.Item
              icon={<HiLibrary />}
              onClick={() => router.push("/admin")}
            >
              Admin Dashboard
            </Menu.Item>
            <Menu.Divider />
          </>
        )}
        <Menu.Item icon={<HiGift />} onClick={() => router.push("/prizes")}>
          Daily prizes
        </Menu.Item>
        <Menu.Item icon={<HiTicket />} onClick={() => router.push("/redeem")}>
          Redeem prizes
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          icon={<HiUser />}
          onClick={() => router.push(`/profile/${user.username}`)}
        >
          Profile
        </Menu.Item>
        <Menu.Item
          icon={
            colorScheme === "dark" ? <HiMoon size={18} /> : <HiSun size={18} />
          }
          color={colorScheme === "dark" ? "yellow" : "blue"}
          onClick={() => toggleColorScheme()}
        >
          Change theme{" "}
          <Badge color={colorScheme === "dark" ? "yellow" : "blue"}>WIP</Badge>
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          icon={<HiCog size={18} />}
          onClick={() => router.push("/settings")}
        >
          Settings
        </Menu.Item>
        <Menu.Item
          icon={<HiUser size={18} />}
          onClick={() => router.push("/avatar")}
        >
          Avatar
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item
          sx={{ fontWeight: 500 }}
          color="red"
          icon={<HiLogout />}
          onClick={async () => await logout().then(() => router.push("/login"))}
        >
          Logout
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

const CurrencyMenu = ({
  cx,
  classes,
  currencyMenuOpened,
  theme,
  user,
}: any) => {
  const router = useRouter();
  return (
    <Menu transition="pop-top-right">
      <Menu.Target>
        <UnstyledButton
          className={cx(classes.currency, {
            [classes.currencyActive]: currencyMenuOpened,
          })}
        >
          <Group spacing={6}>
            <HiCurrencyDollar color={theme.colors.green[3]} />
            <Text
              color={theme.colors.green[4]}
              weight={500}
              size="sm"
              sx={{ lineHeight: 1 }}
            >
              {abbreviateNumber(user.tickets)}
            </Text>
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>
          You have{" "}
          {Math.round(user.tickets)
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
          tickets
        </Menu.Label>

        <Menu.Item
          icon={<HiCurrencyDollar />}
          onClick={() => router.push("/tickets")}
        >
          Your Tickets
        </Menu.Item>
        <Menu.Divider />
        <Menu.Item icon={<HiShoppingBag />}>Purchase tickets</Menu.Item>
        <Menu.Item
          icon={<HiViewList />}
          onClick={() => router.push("/tickets/transactions")}
        >
          Transaction history
        </Menu.Item>

        {!user.premium && (
          <>
            <Menu.Divider />
            <Menu.Item
              icon={<HiStar />}
              onClick={() => router.push("/premium")}
            >
              Get premium
            </Menu.Item>
          </>
        )}
      </Menu.Dropdown>
    </Menu>
  );
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
}: FrameworkProps) => {
  const { classes, theme, cx } = useStyles();
  const [opened, { toggle }] = useDisclosure(false);
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const [currencyMenuOpened, setCurrencyMenuOpened] = useState(false);
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

  const [warningSeen, setEmailWarningSeen] = useLocalStorage({
    key: "email-warning-seen",
    defaultValue: false,
  });

  const [isSSR, setIsSSR] = useState(true);

  React.useEffect(() => {
    setIsSSR(false);
  }, []);

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

  const searchRef = useRef<HTMLInputElement>(null);
  const [searchPopoverOpen, setSearchPopoverOpen] = useState(false);

  const { flags } = useFlags();

  return (
    <>
      <div
        className={classes.header}
        style={{
          position: immersive ? "sticky" : "relative",
          top: 0,
          zIndex: 1000,
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
                <Title
                  // @ts-ignore
                  sx={{
                    ":hover": {
                      backgroundPosition: "0 100%",
                      backgroundRepeat: "no-repeat",
                      transition: "all 0.8s ease",
                    },
                    transition: "all 0.8s ease",
                    cursor: "pointer",
                    ":active": {
                      transform: "scale(0.9)",
                      transition: "transform 0.3s ease",
                    },
                    ":focus": {
                      outline: "none",
                    },
                    ...HeaderStyle,
                  }}
                  order={5}
                >
                  Framework
                </Title>
              </Link>
              {process.env.NODE_ENV === "development" && <Badge>Preview</Badge>}
            </Group>

            {mobile && <Burger opened={opened} onClick={toggle} size="sm" />}
            {!mobile && (
              <Group>
                <NotificationFlyout
                  notificationData={user && user.notifications}
                />
                <CurrencyMenu
                  cx={cx}
                  classes={classes}
                  currencyMenuOpened={currencyMenuOpened}
                  theme={theme}
                  user={user}
                />
                <UserMenu
                  cx={cx}
                  classes={classes}
                  userMenuOpened={userMenuOpened}
                  user={user}
                  router={router}
                />
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
                  <Search ref={searchRef} />
                </Popover.Dropdown>
              </Popover>
            </Group>
          </Container>
        )}

        <Drawer opened={opened} onClose={toggle} position="right">
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

            <Group>
              <CurrencyMenu
                cx={cx}
                classes={classes}
                currencyMenuOpened={currencyMenuOpened}
                theme={theme}
                user={user}
              />
              <UserMenu
                cx={cx}
                classes={classes}
                userMenuOpened={userMenuOpened}
                user={user}
                router={router}
              />
              <NotificationFlyout
                notificationData={user && user.notifications}
              />
              <Search ref={searchRef} />
            </Group>
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
    </>
  );
};

export default Framework;
