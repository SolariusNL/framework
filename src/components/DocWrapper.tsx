import {
  Anchor,
  Container,
  Divider,
  Grid,
  Group,
  Text,
  createStyles,
  Box,
} from "@mantine/core";
import Link from "next/link";
import React from "react";
import { HiChevronLeft, HiSearch } from "react-icons/hi";
import useMediaQuery from "../util/useMediaQuery";
import { renderToString } from "react-dom/server";
import { useState } from "react";
import MinimalFooter from "./MinimalFooter";

const LINK_HEIGHT = 38;
const INDICATOR_SIZE = 10;
const INDICATOR_OFFSET = (LINK_HEIGHT - INDICATOR_SIZE) / 2;

const useStyles = createStyles((theme) => ({
  link: {
    ...theme.fn.focusStyles(),
    display: "block",
    textDecoration: "none",
    color: theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,
    lineHeight: `${LINK_HEIGHT}px`,
    fontSize: theme.fontSizes.sm,
    height: LINK_HEIGHT,
    borderTopRightRadius: theme.radius.sm,
    borderBottomRightRadius: theme.radius.sm,
    borderLeft: `2px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[4] : theme.colors.gray[2]
    }`,

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
    },
  },

  linkActive: {
    fontWeight: 500,
    color:
      theme.colors[theme.primaryColor][theme.colorScheme === "dark" ? 3 : 7],
  },

  links: {
    position: "relative",
  },

  indicator: {
    transition: "transform 150ms ease",
    border: `2px solid ${
      theme.colors[theme.primaryColor][theme.colorScheme === "dark" ? 3 : 7]
    }`,
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
    height: INDICATOR_SIZE,
    width: INDICATOR_SIZE,
    borderRadius: INDICATOR_SIZE,
    position: "absolute",
    left: -INDICATOR_SIZE / 2 + 1,
  },
}));

interface DocWrapperProps {
  children: React.ReactNode;
  meta: {
    title: string;
    lastModified: string;
    summary: string;
  };
}

interface TableOfContentsFloatingProps {
  links: { label: string; link: string; order: number }[];
}

const HeaderStyle = (mobile: boolean) => {
  return {
    marginTop: 0,
    marginBottom: "24px",
    backgroundImage:
      "url('https://assets-global.website-files.com/600ead1452cf056d0e52dbed/603408f80d379f66929884cf_PurpleBackground%20(1).png')",
    backgroundPosition: "0 15%",
    backgroundSize: "cover",
    fontSize: !mobile ? "3.5rem" : "2.5rem",
    lineHeight: "1.2em",
    fontWeight: "900",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    WebkitTextFillColor: "transparent",
    opacity: 1,
    transform:
      "translate3d(0px, 0px, 0px) scale3d(1, 1, 1) rotateX(0deg) rotateY(0deg) rotateZ(0deg) skew(0deg, 0deg)",
    transformStyle: "preserve-3d",
    fontFamily: "Inter",
  } as React.CSSProperties;
};

const DocWrapper = ({ children, meta }: DocWrapperProps) => {
  const mobile = useMediaQuery("768");

  const { classes, cx } = useStyles();
  const [active, setActive] = useState(0);

  const contentString = renderToString(children as React.ReactElement);

  const getHeadings = (source: string) => {
    const regex: RegExp = /<h2>(.*?)<\/h2>/g;

    if (source.match(regex)) {
      return source.match(regex)?.map((heading) => {
        const headingText = heading.replace("<h2>", "").replace("</h2>", "");

        const link = "#" + headingText.replace(/ /g, "_").toLowerCase();

        return {
          text: headingText,
          link,
        };
      });
    }

    return [];
  };

  const headings = getHeadings(contentString);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const h2s = Array.from(document.querySelectorAll("h2"));
      h2s.forEach((h2, i) => {
        h2.id = h2.innerText.replace(/ /g, "_").toLowerCase();
      });
    }
  });

  return (
    <Container p={mobile ? 20 : 64}>
      <Grid columns={24}>
        <Grid.Col span={mobile ? 24 : 16}>
          <Link href="/">
            <Anchor>
              <Group spacing={5}>
                <HiChevronLeft />
                <Text>Back to Home</Text>
              </Group>
            </Anchor>
          </Link>
          <h1 style={HeaderStyle(mobile)}>{meta.title}</h1>
          <Text size="sm" weight={500}>
            {meta.summary}
          </Text>

          <Divider mt={24} mb={24} />
          <Text size="sm">Last updated: {meta.lastModified}</Text>

          {children}

          <Group
            mt={30}
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <MinimalFooter />
          </Group>
        </Grid.Col>

        <Grid.Col span={mobile ? 24 : 8}>
          <div>
            <Group mb="md">
              <HiSearch size={18} stroke="1.5" />
              <Text>Table of contents</Text>
            </Group>

            <div className={classes.links}>
              <div
                className={classes.indicator}
                style={{
                  transform: `translateY(${
                    active * LINK_HEIGHT + INDICATOR_OFFSET
                  }px)`,
                }}
              />

              {headings?.map((heading, index) => (
                <Box<"a">
                  component="a"
                  href={heading.link}
                  key={heading.text}
                  onClick={(e) => {
                    setActive(index);
                  }}
                  className={cx(
                    classes.link,
                    active === index && classes.linkActive
                  )}
                  sx={(theme) => ({ paddingLeft: 1 * theme.spacing.lg })}
                >
                  {heading.text}
                </Box>
              ))}
            </div>
          </div>
        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default DocWrapper;
