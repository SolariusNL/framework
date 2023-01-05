import {
  Box,
  Burger,
  Button,
  Center,
  Collapse,
  createStyles,
  Divider,
  Drawer,
  Group,
  Header,
  HoverCard,
  ScrollArea,
  SimpleGrid,
  Text,
  ThemeIcon,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";
import { BsDiscord } from "react-icons/bs";
import {
  HiBookOpen,
  HiChevronDown,
  HiClipboardList,
  HiCloud,
  HiCode,
  HiEye,
  HiLibrary,
  HiOfficeBuilding,
  HiUserGroup,
  HiUsers,
} from "react-icons/hi";
import FrameworkLogo from "./FrameworkLogo";

const useStyles = createStyles((theme) => ({
  link: {
    display: "flex",
    alignItems: "center",
    height: "100%",
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.md,
    textDecoration: "none",
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
    fontWeight: 500,
    fontSize: theme.fontSizes.sm,

    [theme.fn.smallerThan("sm")]: {
      height: 42,
      display: "flex",
      alignItems: "center",
      width: "100%",
    },

    ...theme.fn.hover({
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
    }),
  },

  subLink: {
    width: "100%",
    padding: `${theme.spacing.xs}px ${theme.spacing.md}px`,
    borderRadius: theme.radius.md,

    ...theme.fn.hover({
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[7]
          : theme.colors.gray[0],
    }),

    "&:active": theme.activeStyles,
  },

  dropdownFooter: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[7]
        : theme.colors.gray[0],
    margin: -theme.spacing.md,
    marginTop: theme.spacing.sm,
    padding: `${theme.spacing.md}px ${theme.spacing.md * 2}px`,
    paddingBottom: theme.spacing.xl,
    borderTop: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[1]
    }`,
  },

  hiddenMobile: {
    [theme.fn.smallerThan("sm")]: {
      display: "none",
    },
  },

  hiddenDesktop: {
    [theme.fn.largerThan("sm")]: {
      display: "none",
    },
  },
}));

const tabs = [
  {
    title: "Corporate",
    icon: HiOfficeBuilding,
    children: [
      {
        icon: HiEye,
        title: "Privacy",
        description: "Framework's privacy policy, how we use your data",
        href: "/privacy",
      },
      {
        icon: HiLibrary,
        title: "Terms of service",
        description:
          "Framework's terms of service, your rights and obligations, and our responsibilities",
        href: "/terms",
      },
      {
        icon: HiClipboardList,
        title: "Community guidelines",
        description: "How you're expected to behave in the Framework community",
        href: "/guidelines",
      },
    ],
    footer: {
      title: "Get started",
      description:
        "Get started on your journey. Join the Framework community today.",
      href: "/login",
      btnText: "Start now",
    },
  },
  {
    title: "Learn",
    icon: HiBookOpen,
    children: [
      {
        icon: HiCode,
        title: "Framework.ts documentation",
        description: "Learn how to use Framework.ts and build your first game",
        href: "/docs/frts",
      },
      {
        icon: HiCloud,
        title: "Framework Cloud",
        description:
          "Learn how to use the Framework Cloud platform to build a reliable development pipeline and access our API",
        href: "/docs/cloud",
      },
    ],
    footer: {
      title: "Build on Framework",
      description:
        "Build your next game on Framework. Join the Framework community today.",
      href: "/login",
      btnText: "Build your dream game",
    },
  },
  {
    title: "Community",
    icon: HiUsers,
    children: [
      {
        icon: HiUsers,
        title: "Discourse",
        description: "Join the Framework community on Discourse",
        href: "https://discourse.soodam.rocks",
      },
      {
        icon: HiUserGroup,
        title: "Groups",
        description:
          "Browse groups on Framework and find people with common interests",
        href: "/groups",
      },
      {
        icon: BsDiscord,
        title: "Discord",
        description: "Join the Framework community on Discord",
        href: "https://discord.gg/g88JS6Tmte",
      },
    ],
    footer: {
      title: "Join our forums",
      description:
        "Join the Framework community. Get help, share your work, and meet other developers.",
      href: "https://discourse.soodam.rocks",
      btnText: "Join now",
    },
  },
];

const LandingHeader = () => {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);
  const [linksOpened, { toggle: toggleLinks }] = useDisclosure(false);
  const { classes } = useStyles();

  const tabItems = tabs.map((tab) => (
    <HoverCard
      width={600}
      position="bottom"
      radius="md"
      shadow="md"
      withinPortal
      key={tab.title}
    >
      <HoverCard.Target>
        <a href="#" className={classes.link}>
          <Center inline>
            <Box component="span" mr={5}>
              {tab.title}
            </Box>
            <HiChevronDown size={16} className="text-gray-400" />
          </Center>
        </a>
      </HoverCard.Target>

      <HoverCard.Dropdown sx={{ overflow: "hidden" }}>
        <Text weight={500}>{tab.title}</Text>

        <Divider my="sm" mx="-md" />

        <SimpleGrid cols={2} spacing={0}>
          {tab.children.map((item) => (
            <Link href={item.href} key={item.title}>
              <UnstyledButton className={classes.subLink}>
                <Group noWrap align="flex-start">
                  <ThemeIcon size={34} radius="md">
                    <item.icon size={22} className="text-white" />
                  </ThemeIcon>
                  <div>
                    <Text size="sm" weight={500}>
                      {item.title}
                    </Text>
                    <Text size="xs" color="dimmed">
                      {item.description}
                    </Text>
                  </div>
                </Group>
              </UnstyledButton>
            </Link>
          ))}
        </SimpleGrid>

        <div className={classes.dropdownFooter}>
          <Group position="apart">
            <div>
              <Text weight={500} size="sm">
                {tab.footer.title}
              </Text>
              <Text size="xs" color="dimmed">
                {tab.footer.description}
              </Text>
            </div>
            <Link passHref href={tab.footer.href}>
              <Button variant="default">{tab.footer.btnText}</Button>
            </Link>
          </Group>
        </div>
      </HoverCard.Dropdown>
    </HoverCard>
  ));

  return (
    <>
      <Box className="sticky top-0 z-50">
        <Header height={60} px="md">
          <Group position="apart" sx={{ height: "100%" }}>
            <FrameworkLogo />

            <Group
              sx={{ height: "100%" }}
              spacing={0}
              className={classes.hiddenMobile}
            >
              {tabItems}
            </Group>

            <Group className={classes.hiddenMobile}>
              <Link passHref href="/login">
                <Button variant="default">Log in</Button>
              </Link>
              <Link passHref href="/register">
                <Button>Sign up</Button>
              </Link>
            </Group>

            <Burger
              opened={drawerOpened}
              onClick={toggleDrawer}
              className={classes.hiddenDesktop}
            />
          </Group>
        </Header>

        <Drawer
          opened={drawerOpened}
          onClose={closeDrawer}
          size="100%"
          padding="md"
          title="Framework"
          className={classes.hiddenDesktop}
          zIndex={1000000}
        >
          <ScrollArea sx={{ height: "calc(100vh - 60px)" }} mx="-md">
            <Divider my="sm" />
            {tabItems.map((item) => (
              <div key={item.key}>
                <UnstyledButton className={classes.link} onClick={toggleLinks}>
                  {item}
                </UnstyledButton>
                <Collapse in={linksOpened}>
                  {/**
                   * this is really scuffed but it works
                   */}
                  {item.props.children[1].props.children[2].props.children.map(
                    (child: React.ReactElement) => (
                      <div key={child.key}>{child}</div>
                    )
                  )}
                </Collapse>
              </div>
            ))}
            <Divider my="sm" />
            <Link passHref href="/login">
              <Group position="center" pb="xl" px="md" grow>
                <Button variant="default">Log in</Button>
                <Button>Sign up</Button>
              </Group>
            </Link>
          </ScrollArea>
        </Drawer>
      </Box>
    </>
  );
};

export default LandingHeader;
