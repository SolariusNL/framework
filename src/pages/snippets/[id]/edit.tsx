import {
  AppShell,
  Badge,
  Burger,
  Button,
  Container,
  Group,
  Header,
  Loader,
  MediaQuery,
  Navbar,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
  Transition,
  createStyles,
  useMantineColorScheme,
} from "@mantine/core";
import { useScrollLock } from "@mantine/hooks";
import Editor from "@monaco-editor/react";
import { CodeSnippet } from "@prisma/client";
import { LayoutGroup, motion } from "framer-motion";
import { GetServerSidePropsContext, NextPage } from "next";
import Head from "next/head";
import React, { useEffect } from "react";
import { HiCode, HiCog, HiSave, HiTag } from "react-icons/hi";
import Framework from "../../../components/Framework";
import { Section } from "../../../components/Home/FriendsWidget";
import SideBySide from "../../../components/Settings/SideBySide";
import useAmoled from "../../../stores/useAmoled";
import authorizedRoute from "../../../util/auth";
import clsx from "../../../util/clsx";
import { getCookie } from "../../../util/cookies";
import useMediaQuery from "../../../util/media-query";
import prisma from "../../../util/prisma";
import { User } from "../../../util/prisma-types";
import { BLACK } from "../../teams/t/[slug]/issue/create";

type EditSnippetProps = {
  user: User;
  snippet: CodeSnippet;
};
type ActiveTab = "edit" | "settings";

const useStyles = createStyles((theme, _params, getRef) => {
  const icon = getRef("icon");
  return {
    header: {
      paddingBottom: theme.spacing.md,
      marginBottom: theme.spacing.md * 1.5,
      borderBottom: `1px solid ${
        theme.colorScheme === "dark"
          ? theme.colors.dark[4]
          : theme.colors.gray[2]
      }`,
    },

    footer: {
      paddingTop: theme.spacing.md,
      marginTop: theme.spacing.md,
      borderTop: `1px solid ${
        theme.colorScheme === "dark"
          ? theme.colors.dark[4]
          : theme.colors.gray[2]
      }`,
    },

    link: {
      ...theme.fn.focusStyles(),
      display: "flex",
      alignItems: "center",
      textDecoration: "none",
      fontSize: theme.fontSizes.sm,
      color:
        theme.colorScheme === "dark"
          ? theme.colors.dark[1]
          : theme.colors.gray[7],
      padding: `${theme.spacing.xs}px ${theme.spacing.md}px`,
      borderRadius: theme.radius.md,
      fontWeight: 500,

      "&:hover": {
        backgroundColor:
          theme.colorScheme === "dark" ? theme.colors.dark[8] : theme.white,
        color: theme.colorScheme === "dark" ? theme.white : theme.black,

        [`& .${icon}`]: {
          color: theme.colorScheme === "dark" ? theme.white : theme.black,
        },
      },
    },

    linkIcon: {
      ref: icon,
      color:
        theme.colorScheme === "dark"
          ? theme.colors.dark[2]
          : theme.colors.gray[6],
      marginRight: theme.spacing.md + 2,
    },

    linkActive: {
      "&, &:hover": {
        backgroundColor: theme.fn.variant({
          variant: "light",
          color: theme.primaryColor,
        }).background,
        color: theme.fn.variant({ variant: "light", color: theme.primaryColor })
          .color,
        [`& .${icon}`]: {
          color: theme.fn.variant({
            variant: "light",
            color: theme.primaryColor,
          }).color,
        },
      },
    },
  };
});

const items: Array<{
  label: string;
  value: ActiveTab;
  icon: React.ReactNode;
  subtitle: string;
}> = [
  {
    label: "Edit",
    icon: <HiCode />,
    value: "edit",
    subtitle: "Edit this code snippet",
  },
  {
    label: "Settings",
    icon: <HiCog />,
    value: "settings",
    subtitle: "Edit details about this snippet",
  },
];

const EditSnippet: NextPage<EditSnippetProps> = ({ user, snippet }) => {
  const [dirty, setDirty] = React.useState(false);
  const [updatedCode, setUpdatedCode] = React.useState(snippet.code);
  const [opened, setOpened] = React.useState(false);
  const { classes, cx, theme } = useStyles();
  const { enabled: amoled } = useAmoled();
  const [active, setActive] = React.useState<ActiveTab>("edit");
  const { colorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";
  const mobile = useMediaQuery("768");
  const [locked, setLocked] = useScrollLock();
  const [updatedSnippet, setUpdatedSnippet] = React.useState(snippet);
  const [settingsDirty, setSettingsDirty] = React.useState(false);

  globalThis.onbeforeunload = (event: BeforeUnloadEvent) => {
    const message = "You have unsaved changes.";

    if (typeof event == "undefined") {
      (event as Event | undefined) = window.event;
    }
    if (event && dirty) {
      event.returnValue = message;
    }

    if (dirty) {
      return message;
    }

    return;
  };

  const getTab = () => {
    return items.find((i) => i.value === active);
  };

  const updateSnippetProperty = (key: keyof CodeSnippet, value: any) => {
    setUpdatedSnippet((s) => ({ ...s, [key]: value }));
  };

  const saveChanges = async () => {
    await fetch(`/api/snippets/${snippet.id}/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
      body: JSON.stringify({
        ...updatedSnippet,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setDirty(false);
          setSettingsDirty(false);
        } else {
          alert(
            "Something went wrong, and your changes were not saved. Please try again."
          );
        }
      })
      .catch((err) => {
        alert(
          "Something went wrong, and your changes were not saved. Please try again."
        );
      });
  };

  const links = items.map((item) => (
    <motion.a
      className={clsx(
        "dark:text-zinc-300s font-normal flex cursor-pointer items-center gap-2 w-full md:px-6 px-4 h-9 rounded-md relative",
        active === item.label.toLowerCase()
          ? "dark:text-pink-200 text-pink-700 !font-medium"
          : "dark:hover:text-zinc-200 dark:hover:bg-zinc-700/10",
        mobile && active === item.label.toLowerCase() && "dark:bg-pink-900/30"
      )}
      style={{
        fontSize: theme.fontSizes.sm,
      }}
      key={item.label}
      onClick={(event) => {
        setActive(item.value as ActiveTab);
        event.preventDefault();
      }}
    >
      {active === item.label.toLowerCase() && (
        <motion.span
          layoutId="sidebar"
          className={clsx(
            "absolute left-0 right-0 top-0 bottom-0 rounded-md bg-pink-900/30"
          )}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="bg-pink-800 w-[2px] rounded-full absolute top-2.5 left-2.5 h-4" />
        </motion.span>
      )}
      {item.icon}
      {item.label}
    </motion.a>
  ));

  const nav = (
    <Navbar
      width={{ sm: 300 }}
      p="md"
      hiddenBreakpoint="sm"
      hidden={!opened}
      sx={{
        ...(amoled && {
          backgroundColor: "black",
        }),
      }}
    >
      <Navbar.Section>
        <div className={clsx(classes.header, "flex flex-col gap-2")}>
          <Group position="apart" className="w-full">
            <Title order={3}>{snippet.name}</Title>

            <MediaQuery largerThan="sm" styles={{ display: "none" }}>
              <Burger
                opened={opened}
                onClick={() => setOpened((o) => !o)}
                size="sm"
                color={theme.colors.gray[6]}
              />
            </MediaQuery>
          </Group>
          <div>
            <Badge color="grape">{snippet.language}</Badge>
          </div>
          <Text size="sm" color="dimmed" lineClamp={2}>
            {snippet.description}
          </Text>
        </div>
      </Navbar.Section>

      <Navbar.Section
        grow
        component={React.forwardRef<HTMLDivElement>((props, ref) => (
          <ScrollArea className="h-full" {...props} />
        ))}
      >
        <LayoutGroup id="sidebar">
          <div className="flex flex-col gap-y-1">{links}</div>
        </LayoutGroup>
      </Navbar.Section>
    </Navbar>
  );

  useEffect(() => {
    setLocked(true);
  }, []);

  return (
    <>
      <Head>
        <style jsx global>
          {`
            html,
            body {
              overflow: hidden !important;
            }
          `}
        </style>
      </Head>
      <Transition transition="slide-up" mounted={dirty || settingsDirty}>
        {(styles) => (
          <div
            className="flex justify-center items-center"
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              zIndex: 999,
              padding: "1rem",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              ...styles,
            }}
          >
            <div>
              <Button
                size="lg"
                fullWidth
                leftIcon={<HiSave />}
                onClick={saveChanges}
                disabled={!settingsDirty && !dirty}
              >
                {dirty ? "Save changes and update" : "Update snippet settings"}
              </Button>
            </div>
          </div>
        )}
      </Transition>
      <Framework
        noOverflow
        user={user}
        footer={false}
        activeTab="none"
        noPadding
      >
        <AppShell
          navbar={nav}
          padding={0}
          {...(mobile && {
            header: (
              <Header height={50} p="md" mt={69}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  <MediaQuery largerThan="sm" styles={{ display: "none" }}>
                    <Burger
                      opened={opened}
                      onClick={() => setOpened((o) => !o)}
                      size="sm"
                      color={theme.colors.gray[6]}
                      mr="xl"
                    />
                  </MediaQuery>

                  <div className="flex items-center gap-4">
                    <Text size="lg" weight={500}>
                      {getTab()?.label}
                    </Text>
                    <Text size="sm" color="dimmed" lineClamp={1}>
                      {getTab()?.subtitle}
                    </Text>
                  </div>
                </div>
              </Header>
            ),
          })}
        >
          <div className={clsx(active === "edit" ? "block" : "hidden")}>
            <Editor
              defaultLanguage={snippet.language}
              defaultValue={snippet.code}
              loading={<Loader size="xl" />}
              className="monaco-editor"
              onChange={(val) => {
                if (val !== updatedCode) {
                  setDirty(true);
                }

                updateSnippetProperty("code", String(val));
              }}
              theme={dark ? "vs-dark" : "vs"}
            />
          </div>
          <div
            className={clsx(
              active === "settings" ? "block" : "hidden",
              "md:py-8 py-2"
            )}
          >
            <Container
              sx={{
                width: "100%",
                maxWidth: 800,
              }}
            >
              <Section
                title="Details"
                description="Edit the details of this code snippet"
              />
              <Stack spacing="md">
                <SideBySide
                  title="Snippet name"
                  description="Name of the snippet. Quickly summarize what your snippet does. Ex: Get Array Keys"
                  noUpperBorder
                  shaded
                  right={
                    <TextInput
                      icon={<HiTag />}
                      label="Name"
                      description="Snippet name field"
                      classNames={BLACK}
                      value={updatedSnippet.name}
                      onChange={(e) => {
                        updateSnippetProperty("name", e.target.value);
                        setSettingsDirty(true);
                      }}
                      max={30}
                    />
                  }
                />
                <SideBySide
                  title="Snippet description"
                  description="Describe the functionality of this snippet. Document lines of code & what they do."
                  noUpperBorder
                  shaded
                  right={
                    <Textarea
                      label="Description"
                      description="Snippet description field"
                      classNames={BLACK}
                      value={updatedSnippet.description}
                      maxLength={512}
                      onChange={(e) => {
                        updateSnippetProperty("description", e.target.value);
                        setSettingsDirty(true);
                      }}
                    />
                  }
                />
              </Stack>
            </Container>
          </div>
        </AppShell>
      </Framework>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { id } = context.query;
  const auth = await authorizedRoute(context, true, false);

  if (auth.redirect) {
    return auth;
  }

  const snippet = await prisma.codeSnippet.findFirst({
    where: { id: String(id), userId: auth.props.user?.id },
  });

  if (!snippet) {
    return {
      redirect: {
        destination: "/404",
        permanent: false,
      },
    };
  }

  return {
    props: {
      user: auth.props.user,
      snippet: JSON.parse(JSON.stringify(snippet)),
    },
  };
}

export default EditSnippet;
