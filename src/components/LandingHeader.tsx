import {
  Box,
  Burger,
  Button,
  Center,
  Container,
  createStyles,
  Drawer,
  Group,
  Header,
  HoverCard,
  ScrollArea,
  Text,
  ThemeIcon,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";
import { BsDiscord } from "react-icons/bs";
import {
  HiArrowRight,
  HiChevronDown,
  HiExternalLink,
  HiUserGroup,
  HiUsers,
} from "react-icons/hi";
import clsx from "../util/clsx";
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
    title: "Community",
    icon: HiUsers,
    children: [
      {
        icon: HiUsers,
        title: "Discourse",
        description:
          "Join the Framework community on Discourse and get help from other developers",
        href: "https://discourse.soodam.rocks",
      },
      {
        icon: HiUserGroup,
        title: "Teams",
        description:
          "Browse teams on the Framework community and find your next project",
        href: "/teams",
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
const links = [
  {
    title: "Home",
    href: "/",
  },
  {
    title: "Blog",
    href: "/blog",
  },
  {
    title: "Docs",
    href: "https://wiki.soodam.rocks",
  },
];

const LandingHeader = () => {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] =
    useDisclosure(false);
  const [linksOpened, { toggle: toggleLinks }] = useDisclosure(false);
  const { classes } = useStyles();

  const tabItems = tabs.map((tab) => (
    <HoverCard
      width={400}
      position="bottom"
      radius="lg"
      shadow="md"
      withinPortal
      key={tab.title}
      transitionDuration={300}
    >
      <HoverCard.Target>
        <div className={clsx(classes.link, "rounded-md cursor-pointer")}>
          <Center inline>
            <Box component="span" mr={5}>
              {tab.title}
            </Box>
            <HiChevronDown
              size={16}
              className="text-gray-400 dark:text-white/50"
            />
          </Center>
        </div>
      </HoverCard.Target>

      <HoverCard.Dropdown
        sx={(theme) => ({
          overflow: "hidden",
          backgroundColor: theme.colorScheme === "dark" ? "#000" : "#fff",
        })}
        className="mt-4"
      >
        {tab.children.map((item) => (
          <Link href={item.href} key={item.title}>
            <UnstyledButton className={clsx(classes.subLink, "transition-all")}>
              <Group noWrap align="flex-start">
                <ThemeIcon size={34} radius="md" className="bg-sky-500/50">
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
  const linkItems = links.map((link) => (
    <Link passHref href={link.href} key={link.title}>
      <a className={clsx(classes.link, "rounded-md cursor-pointer")}>
        <Center inline>
          <Box component="span" mr={5}>
            {link.title}
          </Box>
          <HiExternalLink
            size={16}
            className="text-gray-400 dark:text-white/50"
          />
        </Center>
      </a>
    </Link>
  ));

  return (
    <>
      <Box className="sticky top-0 z-50">
        <Header
          height={60}
          px="md"
          className="flex items-center justify-between w-full"
        >
          <Container className="flex justify-between w-full">
            <div className="flex justify-between w-full items-center">
              <FrameworkLogo />

              <Group
                sx={{ height: "100%" }}
                spacing={0}
                className={classes.hiddenMobile}
              >
                {linkItems}
                {tabItems}
              </Group>

              <Group className={classes.hiddenMobile}>
                <Link passHref href="/register">
                  <Button
                    color="pink"
                    leftIcon={<HiArrowRight />}
                    className="transition-all"
                  >
                    Get started
                  </Button>
                </Link>
              </Group>

              <Burger
                opened={drawerOpened}
                onClick={toggleDrawer}
                className={classes.hiddenDesktop}
              />
            </div>
          </Container>
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
            <Group spacing={0} className="mb-4 p-4">
              {linkItems}
            </Group>
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
