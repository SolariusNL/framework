import {
  Button,
  Center,
  Checkbox,
  Group,
  Loader,
  Menu,
  MultiSelect,
  NavLink,
  Text,
  Title,
  Tooltip,
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
  HiFilter,
  HiPlusCircle,
  HiSortAscending,
  HiViewGrid,
} from "react-icons/hi";
import ReactNoSSR from "react-no-ssr";
import CreateChecklist from "../components/Checklists/CreateChecklist";
import CreateTask from "../components/Checklists/CreateTask";
import ChecklistTask from "../components/Checklists/Task";
import Descriptive from "../components/Descriptive";
import Framework from "../components/Framework";
import ModernEmptyState from "../components/ModernEmptyState";
import ShadedCard from "../components/ShadedCard";
import SidebarTabNavigation from "../layouts/SidebarTabNavigation";
import authorizedRoute from "../util/authorizedRoute";
import prisma from "../util/prisma";
import { User } from "../util/prisma-types";
import useMediaQuery from "../util/useMediaQuery";

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
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortBy | null>(null);
  const [display, setDisplay] = useState<"cards" | "list">("cards");
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [showOverdue, setShowOverdue] = useState(false);
  const mobile = useMediaQuery("768");

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
        setLoading(false);

        if (res.length > 0) {
          setActive(res[0].id);
          setCurrentChecklist(res[0]);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  useEffect(() => {
    if (checklists) {
      setLoading(false);
      if (checklists.length > 0) {
        setActive(checklists[0].id);
        setCurrentChecklist(checklists[0]);
      }
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
          existingtags={
            currentChecklist?.items
              .map((item) => item.tags)
              .flat()
              .filter((tag, index, self) => self.indexOf(tag) === index) || []
          }
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
        beta
        returnTo={{
          label: "Back to Invent",
          href: "/invent",
        }}
      >
        <SidebarTabNavigation>
          <SidebarTabNavigation.Sidebar>
            {loading ? (
              <div className="col-span-full flex justify-center items-center">
                <Loader />
              </div>
            ) : (
              <>
                {checklists &&
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
                      className="rounded-md h-fit"
                    />
                  ))}
                <NavLink
                  label="Create new checklist"
                  description="Set up a new checklist to keep track of something new"
                  icon={<HiPlusCircle />}
                  onClick={() => setCreateChecklistOpen(true)}
                  className="rounded-md"
                />
              </>
            )}
          </SidebarTabNavigation.Sidebar>
          <SidebarTabNavigation.Content>
            <ShadedCard>
              {loading ? (
                <div className="w-full flex items-center justify-center py-8">
                  <Loader />
                </div>
              ) : active === "" ? (
                <ModernEmptyState
                  title="No active checklist"
                  body="You don't have any checklist selected."
                />
              ) : (
                <>
                  <Title order={3} mb={16}>
                    {currentChecklist?.name}
                  </Title>
                  <Text mb={24}>{currentChecklist?.description}</Text>
                  <div
                    style={{
                      marginBottom: 24,
                      display: "flex",
                    }}
                  >
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
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          textAlign: "center",
                          flex: 1,
                          gap: 8,
                        }}
                        key={item.label}
                      >
                        <>
                          <item.icon size={20} />
                          <Tooltip label={item.label}>
                            <Text color="dimmed">{item.value}</Text>
                          </Tooltip>
                        </>
                      </div>
                    ))}
                  </div>

                  <Group mb={24}>
                    <Button.Group>
                      <Menu width={270}>
                        <Menu.Target>
                          <Button size="xs" leftIcon={<HiFilter />}>
                            Filter by...
                          </Button>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item
                            closeMenuOnClick={false}
                            rightSection={
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
                            }
                          ></Menu.Item>

                          <Menu.Item closeMenuOnClick={false}>
                            <Descriptive
                              title="Overdue"
                              description="Show only overdue tasks"
                            >
                              <Checkbox
                                label="Show overdue"
                                checked={showOverdue}
                                onChange={(e) =>
                                  setShowOverdue(e.target.checked)
                                }
                              />
                            </Descriptive>
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
                                <HiCheck
                                  size={12}
                                  style={{ marginRight: 12 }}
                                />
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
                                  <HiCheck
                                    size={12}
                                    style={{ marginRight: 12 }}
                                  />
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full flex-wrap">
                    {currentChecklist?.items
                      .filter((item) => {
                        if (tagFilter.length === 0) return true;
                        return tagFilter.every((tag) =>
                          item.tags.includes(tag)
                        );
                      })
                      .filter((item) => {
                        if (!showOverdue) return true;
                        return (
                          new Date(item.scheduled as Date).getTime() <
                          new Date().getTime()
                        );
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
                </>
              )}
            </ShadedCard>
          </SidebarTabNavigation.Content>
        </SidebarTabNavigation>
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
