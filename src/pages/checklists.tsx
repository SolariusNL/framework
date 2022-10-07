import {
  AppShell,
  Badge,
  Button,
  Center,
  Checkbox,
  Container,
  Group,
  Menu,
  Navbar,
  NavLink,
  ScrollArea,
  Text,
  Title,
  Tooltip,
  UnstyledButton,
  useMantineColorScheme,
} from "@mantine/core";
import { ChecklistItem, Prisma } from "@prisma/client";
import { getCookie } from "cookies-next";
import { motion } from "framer-motion";
import { GetServerSidePropsContext, NextPage } from "next";
import { useEffect, useState } from "react";
import {
  HiCheck,
  HiCheckCircle,
  HiClipboardCheck,
  HiClipboardList,
  HiClock,
  HiDownload,
  HiFilter,
  HiPlusCircle,
  HiSortAscending,
} from "react-icons/hi";
import ReactNoSSR from "react-no-ssr";
import CreateChecklist from "../components/Checklists/CreateChecklist";
import CreateTask from "../components/Checklists/CreateTask";
import Descriptive from "../components/Descriptive";
import Framework from "../components/Framework";
import ModernEmptyState from "../components/ModernEmptyState";
import authorizedRoute from "../util/authorizedRoute";
import { User } from "../util/prisma-types";

interface ChecklistsProps {
  user: User;
}

const ChecklistWithTasks = Prisma.validator<Prisma.ChecklistArgs>()({
  include: {
    items: true,
  },
});

type ChecklistWithTasks = Prisma.ChecklistGetPayload<typeof ChecklistWithTasks>;

enum SortBy {
  CreatedAt = "createdAt",
  ScheduledFor = "scheduled",
}

const Checklists: NextPage<ChecklistsProps> = ({ user }) => {
  const [checklists, setChecklists] = useState<ChecklistWithTasks[] | null>(
    null
  );
  const [active, setActive] = useState("");
  const [currentChecklist, setCurrentChecklist] =
    useState<ChecklistWithTasks | null>(null);
  const [createChecklistOpen, setCreateChecklistOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const { colorScheme } = useMantineColorScheme();
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState(SortBy.ScheduledFor);

  const sortByLabel = (sort: SortBy) => {
    switch (sort) {
      case SortBy.CreatedAt:
        return "Created at";
      case SortBy.ScheduledFor:
        return "Schedule priority";
    }
  };

  const fetchChecklists = async () => {
    setLoading(true);
    await fetch("/api/users/@me/checklists", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setChecklists(res);

        if (res.length > 0) {
          setActive(res[0].id);
          setCurrentChecklist(res[0]);
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    fetchChecklists();
  }, []);

  useEffect(() => {
    if (currentChecklist) {
      setCurrentChecklist({
        ...currentChecklist,
        items: currentChecklist.items.sort(
          (a: ChecklistItem, b: ChecklistItem) => {
            if (sortBy === SortBy.CreatedAt) {
              return a.createdAt > b.createdAt ? -1 : 1;
            } else {
              return (a.scheduled ?? 0) > (b.scheduled ?? 0) ? -1 : 1;
            }
          }
        ),
      });
    }
  }, [sortBy]);

  const deleteTask = async (id: string) => {
    await fetch(`/api/users/@me/checklists/${active}/tasks/${id}/delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    })
      .then(() => {
        fetchChecklists();
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const setTaskCompleted = async (id: string, completed: boolean) => {
    await fetch(`/api/users/@me/checklists/${active}/tasks/${id}/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
      body: JSON.stringify({
        finished: completed,
      }),
    }).catch((err) => {
      console.error(err);
    });
  };

  return (
    <>
      <ReactNoSSR>
        <CreateTask
          opened={createTaskOpen}
          setOpened={setCreateTaskOpen}
          checklistId={String(currentChecklist?.id)}
        />
      </ReactNoSSR>

      <ReactNoSSR>
        <CreateChecklist
          opened={createChecklistOpen}
          setOpened={setCreateChecklistOpen}
        />
      </ReactNoSSR>

      <Framework
        activeTab="invent"
        user={user}
        modernTitle="Checklists"
        modernSubtitle="Use checklists to manage and keep track of certain things like development progress, game ideas, and more."
        noContentPadding
        immersive
        beta
      >
        <AppShell
          navbar={
            <Navbar
              width={{
                base: 300,
              }}
              sx={{
                backgroundColor: colorScheme === "dark" ? "#000" : "#fff",
                border: 0,
              }}
            >
              <Navbar.Section component={ScrollArea} grow mx="-xs" px="xs">
                {loading && (
                  <NavLink label="..." icon={<HiDownload />} active />
                )}
                {checklists !== null &&
                  checklists.map((item) => (
                    <NavLink
                      key={item.name}
                      label={item.name}
                      active={active === item.id}
                      onClick={() => {
                        setActive(item.id);
                        setCurrentChecklist(item);
                      }}
                      description={item.description.substring(0, 78) + "..."}
                      icon={<HiCheck />}
                    />
                  ))}
                <NavLink
                  label="Create new checklist"
                  description="Set up a new checklist to keep track of something new"
                  icon={<HiPlusCircle />}
                  onClick={() => setCreateChecklistOpen(true)}
                />
              </Navbar.Section>
            </Navbar>
          }
        >
          {active === "" ? (
            <ModernEmptyState
              title={loading ? "Loading..." : "No checklists"}
              body={
                loading
                  ? "Getting your checklists..."
                  : "You have no checklists. Create one by clicking the 'Create new checklist' button in the navigation bar."
              }
            />
          ) : (
            <Container>
              <Group spacing={12}>
                <Title
                  order={4}
                  mb={16}
                  sx={{
                    color: "#909296",
                  }}
                >
                  # Checklist
                </Title>
                <Title order={3} mb={16}>
                  {currentChecklist?.name}
                </Title>
              </Group>
              <Text mb={24}>{currentChecklist?.description}</Text>
              <Group mb={24} spacing={24}>
                {[
                  {
                    label: "Created",
                    value: new Date(
                      currentChecklist?.createdAt as Date
                    ).toLocaleDateString(),
                    icon: HiClock,
                  },
                  {
                    label: "Tasks",
                    value: currentChecklist?.items.length,
                    icon: HiCheckCircle,
                  },
                  {
                    label: "Completed",
                    value: currentChecklist?.items.filter(
                      (item) => item.completed
                    ).length,
                    icon: HiClipboardCheck,
                  },
                  {
                    label: "Incomplete",
                    value: currentChecklist?.items.filter(
                      (item) => !item.completed
                    ).length,
                    icon: HiClipboardList,
                  },
                ].map((item) => (
                  <Group spacing={6} key={item.label}>
                    <>
                      <item.icon size={20} />
                      <Group>
                        <Text weight={700}>{item.label}</Text>
                        <Text>{item.value}</Text>
                      </Group>
                    </>
                  </Group>
                ))}
              </Group>

              <Group mb={24}>
                <Button.Group>
                  <Button size="xs" leftIcon={<HiFilter />}>
                    Filter by...
                  </Button>
                  <Menu>
                    <Menu.Target>
                      <Button size="xs" leftIcon={<HiSortAscending />}>
                        Sort by...
                      </Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                      {Object.keys(SortBy).map((item) => {
                        const sort = SortBy[item as keyof typeof SortBy];

                        return (
                          <Menu.Item
                            key={item}
                            onClick={() => {
                              setSortBy(sort);
                            }}
                          >
                            {sortBy == sort && (
                              <HiCheck size={12} style={{ marginRight: 12 }} />
                            )}
                            {sortByLabel(sort)}
                          </Menu.Item>
                        );
                      })}
                    </Menu.Dropdown>
                  </Menu>
                </Button.Group>
                <Button
                  size="xs"
                  leftIcon={<HiPlusCircle />}
                  onClick={() => setCreateTaskOpen(true)}
                >
                  Create task
                </Button>
              </Group>

              {currentChecklist?.items.length === 0 && (
                <Center mt={24}>
                  <ModernEmptyState
                    title="No tasks"
                    body="You have no tasks. Create one by clicking the 'Create task' button."
                  />
                </Center>
              )}

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                }}
              >
                {currentChecklist?.items.map((task) => (
                  <UnstyledButton
                    sx={(theme) => ({
                      borderRadius: theme.radius.md,
                      color:
                        theme.colorScheme === "dark"
                          ? theme.colors.dark[0]
                          : theme.black,

                      "&:hover": {
                        backgroundColor:
                          theme.colorScheme === "dark"
                            ? theme.colors.dark[6]
                            : theme.colors.gray[0],
                      },
                      width: "33%",
                      padding: "12px",
                      opacity: task.completed ? 0.5 : 1,
                    })}
                    key={task.id}
                  >
                    <Descriptive
                      title={task.name}
                      description={task.description}
                    >
                      <Checkbox
                        label="Completed"
                        checked={task.completed}
                        onChange={(e) => {
                          task.completed = e.target.checked;
                          setCurrentChecklist({
                            ...currentChecklist,
                          });
                          setTaskCompleted(task.id, e.target.checked);
                        }}
                      />
                    </Descriptive>
                    <Group mt={12}>
                      {task.scheduled && (
                        <Group spacing={12}>
                          <HiClock
                            color={
                              colorScheme === "dark" ? "#909296" : "#868e96"
                            }
                          />
                          <Tooltip
                            label={`Due by ${new Date(
                              task.scheduled
                            ).toLocaleDateString()}`}
                            position="bottom"
                          >
                            <Text color="dimmed" size="sm">
                              {new Date(task.scheduled).toLocaleDateString()}
                            </Text>
                          </Tooltip>
                        </Group>
                      )}
                      {task.tags && (
                        <Group spacing={12}>
                          {task.tags.map((tag) => (
                            <Badge key={tag}>{tag}</Badge>
                          ))}
                        </Group>
                      )}
                    </Group>
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{
                        opacity: task.completed ? 1 : 0,
                        height: task.completed ? "auto" : 0,
                      }}
                      transition={{ duration: 0.2 }}
                      style={{
                        marginTop: task.completed ? 12 : 0,
                      }}
                    >
                      <Button
                        fullWidth
                        color="red"
                        onClick={() => deleteTask(task.id)}
                      >
                        Delete
                      </Button>
                    </motion.div>
                  </UnstyledButton>
                ))}
              </div>
            </Container>
          )}
        </AppShell>
      </Framework>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return await authorizedRoute(context, true, false);
}

export default Checklists;
