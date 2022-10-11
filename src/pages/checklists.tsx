import {
  AppShell,
  Button,
  Center,
  Container,
  Group,
  Menu,
  MultiSelect,
  Navbar,
  NavLink,
  ScrollArea,
  Text,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { ChecklistItem, Prisma } from "@prisma/client";
import { getCookie } from "cookies-next";
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
  HiViewGrid,
} from "react-icons/hi";
import ReactNoSSR from "react-no-ssr";
import CreateChecklist from "../components/Checklists/CreateChecklist";
import CreateTask from "../components/Checklists/CreateTask";
import ChecklistTask from "../components/Checklists/Task";
import Framework from "../components/Framework";
import ModernEmptyState from "../components/ModernEmptyState";
import authorizedRoute from "../util/authorizedRoute";
import prisma from "../util/prisma";
import { User } from "../util/prisma-types";

interface ChecklistsProps {
  user: User;
  checklistData: ChecklistWithTasks[] | null;
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

const Checklists: NextPage<ChecklistsProps> = ({ user, checklistData }) => {
  const [checklists, setChecklists] = useState<ChecklistWithTasks[] | null>(
    checklistData
  );
  const [active, setActive] = useState("");
  const [currentChecklist, setCurrentChecklist] =
    useState<ChecklistWithTasks | null>(null);
  const [createChecklistOpen, setCreateChecklistOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const { colorScheme } = useMantineColorScheme();
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<SortBy | null>(null);
  const [display, setDisplay] = useState<"cards" | "list">("cards");
  const [tagFilter, setTagFilter] = useState<string[]>([]);

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
    await fetch("/api/checklists", {
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
    if (checklists && checklists.length > 0) {
      setActive(checklists[0].id);
      setCurrentChecklist(checklists[0]);
    }
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
              return (new Date(a.scheduled as Date) as any) >
                (new Date(b.scheduled as Date) as any)
                ? -1
                : 1;
            }
          }
        ),
      });
    }
  }, [sortBy]);

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
                  <Menu width={270}>
                    <Menu.Target>
                      <Button size="xs" leftIcon={<HiFilter />}>
                        Filter by...
                      </Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item closeMenuOnClick={false}>
                        <MultiSelect
                          label="Tags"
                          description="Filter by tags"
                          placeholder="Create tags for this task"
                          searchable
                          data={
                            currentChecklist?.items
                              .map((item) => item.tags)
                              .flat()
                              .filter((tag, index, self) => {
                                return self.indexOf(tag) === index;
                              }) ?? []
                          }
                          value={tagFilter}
                          onChange={(value) => setTagFilter(value)}
                        />
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                  <Menu>
                    <Menu.Target>
                      <Button size="xs" leftIcon={<HiViewGrid />}>
                        View...
                      </Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                      {[
                        ["cards", "Display as cards"],
                        ["list", "Display as list"],
                      ].map((item) => (
                        <Menu.Item
                          key={item[0]}
                          onClick={() => {
                            setDisplay(item[0] as "cards" | "list");
                          }}
                        >
                          {display === item[0] && (
                            <HiCheck size={12} style={{ marginRight: 12 }} />
                          )}
                          {item[1]}
                        </Menu.Item>
                      ))}
                    </Menu.Dropdown>
                  </Menu>
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
                {currentChecklist?.items
                  .filter((item) => {
                    if (tagFilter.length === 0) return true;

                    return tagFilter.every((tag) => item.tags.includes(tag));
                  })
                  .map((task) => (
                    <ChecklistTask
                      key={task.id}
                      task={task}
                      setCurrentChecklist={setCurrentChecklist}
                      currentChecklist={currentChecklist}
                      fetchChecklists={fetchChecklists}
                      display={display}
                    />
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
  const auth = await authorizedRoute(context, true, false);
  if (auth.redirect) {
    return auth;
  }

  const checklists = await prisma.checklist.findMany({
    where: {
      userId: auth.props.user?.id,
    },
    include: {
      items: true,
    },
  });

  return {
    props: {
      user: auth.props.user,
      checklistData: JSON.parse(JSON.stringify(checklists)),
    },
  };
}

export default Checklists;
