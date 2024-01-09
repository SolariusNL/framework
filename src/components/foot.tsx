import SoodamLogo from "@/components/soodam-logo";
import clsx from "@/util/clsx";
import getConfig from "@/util/config";
import { Fw } from "@/util/fw";
import {
  Anchor,
  Badge,
  Button,
  Container,
  createStyles,
  Group,
  Popover,
  Stack,
  Text,
} from "@mantine/core";
import Link from "next/link";
import { useEffect, useState } from "react";
import { HiPaperClip } from "react-icons/hi";
import ReactNoSSR from "react-no-ssr";

const useStyles = createStyles((theme) => ({
  footer: {
    marginTop: 120,
    paddingTop: theme.spacing.xl * 2,
    paddingBottom: theme.spacing.xl * 2,
    borderTop: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[2]
    }`,
  },

  logo: {
    maxWidth: 200,

    [theme.fn.smallerThan("sm")]: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
  },

  description: {
    marginTop: 5,

    [theme.fn.smallerThan("sm")]: {
      marginTop: theme.spacing.xs,
      textAlign: "center",
    },
  },

  inner: {
    display: "flex",
    justifyContent: "space-between",

    [theme.fn.smallerThan("sm")]: {
      flexDirection: "column",
      alignItems: "center",
    },
  },

  groups: {
    display: "flex",
    flexWrap: "wrap",

    [theme.fn.smallerThan("sm")]: {
      display: "none",
    },
    textAlign: "right",
  },

  wrapper: {
    width: 160,
  },

  link: {
    display: "block",
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[1]
        : theme.colors.gray[6],
    fontSize: theme.fontSizes.sm,
    paddingTop: 3,
    paddingBottom: 3,

    "&:hover": {
      textDecoration: "underline",
    },
  },

  title: {
    fontSize: theme.fontSizes.lg,
    fontWeight: 700,
    marginBottom: theme.spacing.xs / 2,
    color: theme.colorScheme === "dark" ? theme.white : theme.black,
  },

  afterFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 40,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    borderTop: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[2]
    }`,

    [theme.fn.smallerThan("sm")]: {
      flexDirection: "column",
    },
  },

  right: {
    [theme.fn.smallerThan("sm")]: {
      marginTop: theme.spacing.md,
    },
  },
}));

const Footer = () => {
  const { classes } = useStyles();
  const config = getConfig();
  const [status, setStatus] = useState<
    "up" | "problems" | "disabled" | "loading"
  >("loading");

  const groups = config?.footer?.links?.map((group) => {
    const links = group.links?.map((link, index) => (
      <Link passHref href={String(link.url)} key={index}>
        <Text<"a"> className={classes.link} component="a">
          {link.label}
        </Text>
      </Link>
    ));

    return (
      <div className={classes.wrapper} key={group.sectionName}>
        <Text className={classes.title}>{group.sectionName}</Text>
        {links}
      </div>
    );
  });

  const getStatus = async () => {
    if (process.env.NEXT_PUBLIC_BETTER_UPTIME_ENABLED === "true") {
      await fetch("/api/doc/status")
        .then((res) => res.json())
        .then((res) => {
          setStatus(res.status);
        });
    } else {
      setStatus("disabled");
    }
  };

  useEffect(() => {
    getStatus();
  }, []);

  return (
    <footer className={clsx(classes.footer, "relative")}>
      <Container className={classes.inner}>
        <div className={classes.logo}>
          <SoodamLogo height={30} />
          <Text
            size="xs"
            color="dimmed"
            mb={12}
            className={classes.description}
          >
            {config?.footer?.description ||
              "Passionate about open source and a better future for the web."}
          </Text>
          <ReactNoSSR>
            {process.env.NEXT_PUBLIC_BETTER_UPTIME_ENABLED === "true" && (
              <a
                href={String(process.env.NEXT_PUBLIC_STATUSPAGE_URL)}
                target="_blank"
                rel="noreferrer noopener"
                style={{ textDecoration: "none" }}
              >
                <Badge
                  color={
                    status === "up"
                      ? "blue"
                      : status === "problems"
                      ? "red"
                      : "blue"
                  }
                  radius="md"
                  className="cursor-pointer mt-2"
                >
                  {status === "up"
                    ? "Systems normal"
                    : status === "problems"
                    ? "Experiencing issues"
                    : "..."}
                </Badge>
              </a>
            )}
          </ReactNoSSR>
        </div>
        <div className={classes.groups}>{groups}</div>
      </Container>
      <Container className={classes.afterFooter}>
        <Stack spacing={8} className="md:text-start text-center">
          <Text color="dimmed" size="sm">
            © 2021-2024 Solarius. All rights reserved.
          </Text>
          <Text color="dimmed" size="sm">
            VAT ID: NL-8188.17.147.B01{" "}
            <span className="ml-1 mr-2">{Fw.Elements.bullet()}</span>
            Chamber of Commerce: 34262929
          </Text>
        </Stack>

        {config.footer?.flagPs && (
          <Group spacing={0} className={classes.right} position="right" noWrap>
            <Popover position="bottom-end" transition="pop-bottom-right">
              <Popover.Target>
                <Button
                  variant="subtle"
                  color="gray"
                  className="text-dimmed"
                  classNames={{
                    label: "flex items-center gap-2",
                  }}
                  size="xs"
                >
                  <span>🇵🇸</span>
                  <span>Stand with Palestine</span>
                  <span>🇵🇸</span>
                </Button>
              </Popover.Target>
              <Popover.Dropdown>
                <div className="flex flex-col gap-2">
                  <Text size="sm" color="dimmed">
                    Stand for what&apos;s right. Stop the genocide.
                  </Text>
                  <div className="flex flex-col gap-1">
                    {[
                      {
                        label: "Islamic Relief (USA)",
                        url: "https://irusa.org/middle-east/palestine/",
                      },
                      {
                        label: "Medical Aid for Palestinians (UK)",
                        url: "https://www.map.org.uk/donate/donate",
                      },
                      {
                        label: "Palestinian Red Crescent",
                        url: "https://www.palestinercs.org/ar/donation",
                      },
                    ].map((resource, i) => (
                      <Anchor
                        className="flex items-center gap-2"
                        href={resource.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        key={i}
                      >
                        <HiPaperClip />
                        <span>{resource.label}</span>
                      </Anchor>
                    ))}
                  </div>
                </div>
              </Popover.Dropdown>
            </Popover>
          </Group>
        )}
      </Container>
    </footer>
  );
};

export default Footer;
