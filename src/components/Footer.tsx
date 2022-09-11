import {
  createStyles,
  Text,
  Container,
  ActionIcon,
  Group,
} from "@mantine/core";
import {
  IconBrandTwitter,
  IconBrandYoutube,
  IconBrandInstagram,
} from "@tabler/icons";
import Link from "next/link";
import useConfig from "../util/useConfig";
import SoodamLogo from "./SoodamLogo";

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

    "& > *": {
      marginRight: 32,
    },
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
    marginTop: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
    borderTop: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[2]
    }`,

    [theme.fn.smallerThan("sm")]: {
      flexDirection: "column",
    },
  },

  social: {
    [theme.fn.smallerThan("sm")]: {
      marginTop: theme.spacing.xs,
    },
  },
}));

const Footer = () => {
  const { classes } = useStyles();
  const config = useConfig();

  const groups = config.footer.links.map((group) => {
    const links = group.links.map((link, index) => (
      <Link passHref href={link.url} key={index}>
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

  return (
    <footer className={classes.footer}>
      <Container className={classes.inner}>
        <div className={classes.logo}>
          <SoodamLogo height={64} width={64} />
          <Text size="xs" color="dimmed" className={classes.description}>
            For a better tomorrow, we are building a better today.
          </Text>
        </div>
        <div className={classes.groups}>{groups}</div>
      </Container>
      <Container className={classes.afterFooter}>
        <Text color="dimmed" size="sm">
          © 2021-2022 Soodam.re Corporation. All rights reserved.
        </Text>

        <Group spacing={0} className={classes.social} position="right" noWrap>
          {config.footer.socials.twitter.show && (
            <Link href={config.footer.socials.twitter.url}>
              <ActionIcon size="lg">
                <IconBrandTwitter size={18} stroke={1.5} />
              </ActionIcon>
            </Link>
          )}
          {config.footer.socials.youtube.show && (
            <Link href={config.footer.socials.youtube.url}>
              <ActionIcon size="lg">
                <IconBrandYoutube size={18} stroke={1.5} />
              </ActionIcon>
            </Link>
          )}
          {config.footer.socials.instagram.show && (
            <Link href={config.footer.socials.instagram.url}>
              <ActionIcon size="lg">
                <IconBrandInstagram size={18} stroke={1.5} />
              </ActionIcon>
            </Link>
          )}
        </Group>
      </Container>
    </footer>
  );
};

export default Footer;
