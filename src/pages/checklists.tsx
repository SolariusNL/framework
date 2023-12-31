import CreateChecklist from "@/components/checklists/create-checklist";
import CreateTask from "@/components/checklists/create-task";
import ChecklistTask from "@/components/checklists/task";
import DataGrid from "@/components/data-grid";
import Descriptive from "@/components/descriptive";
import Framework from "@/components/framework";
import ModernEmptyState from "@/components/modern-empty-state";
import ShadedCard from "@/components/shaded-card";
import SidebarTabNavigation from "@/layouts/SidebarTabNavigation";
import authorizedRoute from "@/util/auth";
import prisma from "@/util/prisma";
import { User } from "@/util/prisma-types";
import {
  ActionIcon,
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
} from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { ChecklistItem, Prisma } from "@prisma/client";
import { getCookie } from "cookies-next";
import { GetServerSidePropsContext, NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  HiCheck,
  HiDotsVertical,
  HiFilter,
  HiOutlineCheckCircle,
  HiOutlineClipboard,
  HiOutlineClock,
  HiOutlineTrash,
  HiOutlineXCircle,
  HiPlusCircle,
  HiSortAscending,
  HiTable,
  HiViewGrid,
} from "react-icons/hi";
import ReactNoSSR from "react-no-ssr";

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
  const router = useRouter();
  const [createChecklistOpen, setCreateChecklistOpen] = useState(false);
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortBy | null>(null);
  const [display, setDisplay] = useState<"cards" | "list">("cards");
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [showOverdue, setShowOverdue] = useState(false);

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

  const deleteChecklist = async (id: string) => {
    await fetch(`/api/checklists/${id}/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    })
      .then((res) => res.json())
      .then((res) => {
        fetchChecklists();
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

    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    if (id) {
      setActive(id);
      setCurrentChecklist(checklists?.find((item) => item.id === id) || null);
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
          href: "/invent/games",
        }}
      >
        <SidebarTabNavigation>
          <SidebarTabNavigation.Sidebar>
            {checklists &&
              checklists.map((item) => (
                <NavLink
                  key={item.name}
                  label={item.name}
                  active={active === item.id}
                  onClick={() => {
                    setActive(item.id);
                    setCurrentChecklist(item);
                    router.push(
                      {
                        pathname: "/checklists",
                        query: { id: item.id },
                      },
                      undefined,
                      {
                        shallow: true,
                      }
                    );
                  }}
                  description={
                    <span className="line-clamp-2">{item.description}</span>
                  }
                  icon={<HiTable />}
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
          </SidebarTabNavigation.Sidebar>
          <SidebarTabNavigation.Content>
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
                <div className="flex items-center justify-between">
                  <Title order={2} mb="xs">
                    {currentChecklist?.name}
                  </Title>
                  <Menu width={200}>
                    <Menu.Target>
                      <ActionIcon>
                        <HiDotsVertical />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Label>
                        Created on{" "}
                        {new Date(
                          currentChecklist?.createdAt as Date
                        ).toLocaleDateString()}
                      </Menu.Label>
                      <Menu.Item
                        icon={<HiOutlineClipboard />}
                        onClick={() => {
                          navigator.clipboard.writeText(active);
                        }}
                      >
                        Copy ID
                      </Menu.Item>
                      <Menu.Item
                        icon={<HiOutlineTrash />}
                        onClick={() =>
                          openConfirmModal({
                            title: "Are you sure?",
                            labels: { confirm: "Delete", cancel: "Cancel" },
                            confirmProps: {
                              color: "red",
                              leftIcon: <HiOutlineTrash />,
                            },
                            onConfirm: () => deleteChecklist(active),
                            children: (
                              <Text size="sm" color="dimmed">
                                Are you sure you want to delete this checklist?
                                This action cannot be undone.
                              </Text>
                            ),
                          })
                        }
                        color="red"
                      >
                        Delete checklist
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </div>
                <Text>{currentChecklist?.description}</Text>

                <ShadedCard className="my-6">
                  <DataGrid
                    className="mt-0"
                    mdCols={2}
                    smCols={2}
                    defaultCols={1}
                    items={[
                      {
                        tooltip: "Created",
                        value: new Date(
                          currentChecklist?.createdAt as Date
                        ).toLocaleDateString(),
                        icon: <HiOutlineClock />,
                      },
                      {
                        tooltip: "Tasks",
                        value: String(currentChecklist?.items.length),
                        icon: <HiOutlineCheckCircle />,
                      },
                      {
                        tooltip: "Completed",
                        value: String(
                          currentChecklist?.items.filter(
                            (item) => item.completed
                          ).length
                        ),
                        icon: <HiOutlineCheckCircle />,
                      },
                      {
                        tooltip: "Incomplete",
                        value: String(
                          currentChecklist?.items.filter(
                            (item) => !item.completed
                          ).length
                        ),
                        icon: <HiOutlineXCircle />,
                      },
                    ]}
                  />
                </ShadedCard>

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

                        <Menu.Item closeMenuOnClick={false}>
                          <Descriptive
                            title="Overdue"
                            description="Show only overdue tasks"
                          >
                            <Checkbox
                              label="Show overdue"
                              checked={showOverdue}
                              onChange={(e) => setShowOverdue(e.target.checked)}
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
                      return tagFilter.every((tag) => item.tags.includes(tag));
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
