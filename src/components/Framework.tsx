import { useState } from "react";
import {
  createStyles,
  Container,
  Avatar,
  UnstyledButton,
  Group,
  Text,
  Menu,
  Tabs,
  Burger,
  Drawer,
  Stack,
  ThemeIcon,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  HiChevronDown,
  HiCog,
  HiCurrencyDollar,
  HiHome,
  HiLightBulb,
  HiLogout,
  HiShoppingBag,
  HiUser,
  HiViewGrid,
  HiViewList,
} from "react-icons/hi";
import { useRouter } from "next/router";
import useMediaQuery from "../util/useMediaQuery";
import { User } from "../util/prisma-types";
import { setCookie } from "../util/cookies";

interface FrameworkProps {
  user: User;
  children: React.ReactNode;
  activeTab: "home" | "games" | "catalog" | "invent" | "avatar" | "settings";
}

const HeaderStyle = {
  marginTop: 0,
  marginBottom: 0,
  backgroundImage:
    "url('https://assets-global.website-files.com/600ead1452cf056d0e52dbed/603408f80d379f66929884cf_PurpleBackground%20(1).png')",
  backgroundPosition: "0 15%",
  backgroundSize: "cover",
  fontSize: "1.1rem",
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
    borderRadius: theme.radius.sm,
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
    borderRadius: theme.radius.sm,
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

  tab: {
    height: 38,
    backgroundColor: "transparent",
    color: theme.colors.gray[7],

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[5]
          : theme.colors.gray[1],
    },

    "&[data-active]": {
      backgroundColor:
        theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
      borderColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[7]
          : theme.colors.gray[2],
      fontWeight: 500,
      color: theme.colors.dark[7],
    },
  },
}));

const Framework = ({ user, children, activeTab }: FrameworkProps) => {
  const { classes, theme, cx } = useStyles();
  const [opened, { toggle }] = useDisclosure(false);
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const [currencyMenuOpened, setCurrencyMenuOpened] = useState(false);
  const router = useRouter();
  const mobile = useMediaQuery("768");

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

  const items = tabs.map((tab) => (
    <Tabs.Tab
      value={tab.label.toLowerCase()}
      key={tab.label}
      onClick={() => {
        router.push(tab.href);
      }}
    >
      <Group>
        {tab.icon}
        <Text>{tab.label}</Text>
      </Group>
    </Tabs.Tab>
  ));

  const UserMenu = () => (
    <Menu transition="pop-top-right">
      <Menu.Target>
        <UnstyledButton
          className={cx(classes.user, {
            [classes.userActive]: userMenuOpened,
          })}
        >
          <Group spacing={12}>
            <Avatar
              src={`https://avatars.dicebear.com/api/identicon/${user.id}.png`}
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
        <Menu.Item icon={<HiUser />}>Profile</Menu.Item>
        <Menu.Divider />
        <Menu.Item sx={{ fontWeight: 500 }} color="red" icon={<HiLogout />} onClick={() => {
          setCookie(".frameworksession", "", -365);
          router.push("/invite");
        }}>
          Logout
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );

  const CurrencyMenu = () => (
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
              {user.tickets}
            </Text>
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>You have {user.tickets} tickets</Menu.Label>

        <Menu.Item icon={<HiShoppingBag />}>Purchase tickets</Menu.Item>
        <Menu.Item icon={<HiViewList />}>Transaction history</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );

  return (
    <>
      <div className={classes.header}>
        <Container
          className={classes.mainSection}
          sx={{
            paddingTop: mobile ? 10 : 0,
            paddingBottom: mobile ? 16 : 0,
          }}
        >
          <Group position="apart">
            <h5 style={HeaderStyle}>Framework</h5>

            {mobile && <Burger opened={opened} onClick={toggle} size="sm" />}
            {!mobile && (
              <Group>
                <CurrencyMenu />
                <UserMenu />
              </Group>
            )}
          </Group>
        </Container>
        {!mobile && (
          <Container>
            <Tabs
              defaultValue={activeTab}
              variant="outline"
              classNames={{
                tabsList: classes.tabsList,
                tab: classes.tab,
              }}
            >
              <Tabs.List>{items}</Tabs.List>
            </Tabs>
          </Container>
        )}

        <Drawer opened={opened} onClose={toggle} position="right">
          <Container>
            <Stack spacing={16} mb={24}>
              {tabs.map((tab) => (
                <Group
                  onClick={() => {
                    router.push(tab.href);
                    toggle();
                  }}
                  key={tab.label}
                  sx={{ cursor: "pointer" }}
                >
                  <ThemeIcon variant="outline" color={tab.color} size={24}>
                    {tab.icon}
                  </ThemeIcon>
                  <Text
                    color={tab.color}
                    sx={(theme) => ({
                      textDecoration: `underline ${
                        theme.colors[tab.color][3]
                      } 3px`,
                      textDecorationColor: theme.colors[tab.color][3],
                    })}
                  >
                    {tab.label}
                  </Text>
                </Group>
              ))}
            </Stack>

            <Group>
              <CurrencyMenu />
              <UserMenu />
            </Group>
          </Container>
        </Drawer>
      </div>

      <Container mt={26}>{children}</Container>
    </>
  );
};

export default Framework;
