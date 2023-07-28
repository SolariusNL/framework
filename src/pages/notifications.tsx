import Copy from "@/components/copy";
import DataGrid from "@/components/data-grid";
import Framework from "@/components/framework";
import LoadingIndicator from "@/components/loading-indicator";
import ModernEmptyState from "@/components/modern-empty-state";
import ShadedCard from "@/components/shaded-card";
import Stateful from "@/components/stateful";
import Infinity from "@/icons/Infinity";
import SidebarTabNavigation from "@/layouts/SidebarTabNavigation";
import IResponseBase from "@/types/api/IResponseBase";
import authorizedRoute from "@/util/auth";
import clsx from "@/util/clsx";
import fetchJson from "@/util/fetch";
import { Fw } from "@/util/fw";
import boldPlugin from "@/util/fw/plugins/bold";
import linkPlugin from "@/util/fw/plugins/links";
import { User } from "@/util/prisma-types";
import {
  ActionIcon,
  Badge,
  Divider,
  MantineColor,
  Menu,
  Pagination,
  Select,
  Stack,
  Tabs,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { Notification, NotificationType } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import { GetServerSideProps } from "next";
import React, { useEffect, useState } from "react";
import {
  HiCheckCircle,
  HiOutlineCalendar,
  HiOutlineCog,
  HiOutlineExclamation,
  HiOutlineEye,
  HiOutlineGift,
  HiOutlineIdentification,
  HiOutlineInformationCircle,
  HiOutlineLogin,
  HiOutlineSearchCircle,
  HiOutlineSortAscending,
  HiOutlineTag,
  HiOutlineTrash,
  HiSortDescending,
  HiSparkles,
  HiTrash,
  HiXCircle,
} from "react-icons/hi";

type NotificationsPage = {
  user: User;
};
type TabValue = Lowercase<NotificationType> | "all";
type FetchNotificationsResponse = IResponseBase<{
  notifications: Notification[];
}>;
type NotificationSort = "title" | "date" | "type";
type SortNotificationFnType = Pick<
  Notification,
  "title" | "type" | "createdAt"
>;
type SortOrder = "asc" | "desc";

const TABS: Array<{
  value: TabValue;
  icon: React.ReactNode;
  label: string;
  color: MantineColor;
}> = [
  {
    value: "all",
    label: "All",
    icon: <Infinity />,
    color: "blue",
  },
  {
    value: "login",
    label: "Logins",
    icon: <HiOutlineLogin />,
    color: "blue",
  },
  {
    value: "info",
    label: "Informatives",
    icon: <HiOutlineInformationCircle />,
    color: "blue",
  },
  {
    value: "gift",
    label: "Gifts",
    icon: <HiOutlineGift />,
    color: "pink",
  },
  {
    value: "success",
    label: "Successful",
    icon: <HiSparkles />,
    color: "green",
  },
  {
    value: "alert",
    label: "Alerts",
    icon: <HiOutlineExclamation />,
    color: "red",
  },
];
const PAGE_SIZE = 5;

const NotificationsPage: React.FC<NotificationsPage> = ({ user }) => {
  const [active, setActive] = useState<TabValue>("all");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<NotificationSort>("date");
  const [order, setOrder] = useState<SortOrder>("desc");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const tab = TABS.find((tab) => tab.value === active)!;
  const fetchNotifications = async () => {
    setLoading(true);
    setNotifications([]);

    await fetchJson<FetchNotificationsResponse>(
      `/api/notifications?type=${active.toUpperCase()}`,
      {
        auth: true,
        throwOnFail: false,
      }
    )
      .then((res) => {
        if (res.success && res.data) {
          setNotifications(res.data.notifications);
        } else {
          showNotification({
            title: "Error",
            message:
              "Whoops, something went wrong while fetching your notifications. Please try again later.",
            icon: <HiXCircle />,
            color: "red",
          });
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
    setSort("date");
    setSearch("");
  }, [active]);

  const sortFn = (a: SortNotificationFnType, b: SortNotificationFnType) => {
    if (sort === "title") {
      return order === "asc"
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    } else if (sort === "type") {
      return order === "asc"
        ? a.type.localeCompare(b.type)
        : b.type.localeCompare(a.type);
    } else if (sort === "date") {
      return order === "asc"
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }

    return 0;
  };
  const searchFn = (notification: Notification) => {
    if (search.length === 0) return true;

    return (
      notification.title.toLowerCase().includes(search.toLowerCase()) ||
      notification.message.toLowerCase().includes(search.toLowerCase())
    );
  };
  const updateNotification = async (
    id: string,
    key: keyof Notification,
    value: any
  ) => {
    setNotifications((notifications) =>
      notifications.map((notification) => {
        if (notification.id === id) {
          return {
            ...notification,
            [key]: value,
          };
        }

        return notification;
      })
    );
  };

  const handleReadNotification = (notification: Notification) => {
    updateNotification(notification.id, "seen", true);

    fetchJson<IResponseBase>(`/api/notifications/${notification.id}/read`, {
      method: "POST",
      auth: true,
    })
      .then((res) => {
        if (res.success) {
          showNotification({
            title: "Success",
            message: "Notification marked as read",
            icon: <HiCheckCircle />,
          });
        }
      })
      .catch(() => alert("Error marking notification as read"));
  };
  const handleDeleteNotification = (notification: Notification) => {
    setNotifications((notifications) =>
      notifications.filter((n) => n.id !== notification.id)
    );

    fetchJson<IResponseBase>(`/api/notifications/${notification.id}/delete`, {
      method: "DELETE",
      auth: true,
    })
      .then((res) => {
        if (res.success) {
          showNotification({
            title: "Success",
            message: "Notification successfully deleted",
            icon: <HiCheckCircle />,
          });
        }
      })
      .catch(() => alert("Error deleting notification"));
  };

  return (
    <Framework
      activeTab="none"
      user={user}
      modernTitle="Notifications"
      modernSubtitle="View your notification history and remove outdated notifications"
      beta
    >
      <SidebarTabNavigation>
        <SidebarTabNavigation.Sidebar>
          <Tabs
            orientation="vertical"
            variant="pills"
            defaultValue={active}
            value={active}
            onTabChange={(value) => setActive(value as TabValue)}
            className="md:block hidden"
          >
            <Tabs.List className="w-full">
              {TABS.map((tab) => (
                <Tabs.Tab
                  key={tab.value}
                  icon={tab.icon}
                  value={tab.value}
                  color={tab.color}
                >
                  {tab.label}
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs>
          <Select
            size="lg"
            data={TABS.map((tab) => ({
              label: tab.label,
              value: tab.value,
            }))}
            value={active}
            onChange={(v) => setActive(v as TabValue)}
            className="md:hidden"
          />
        </SidebarTabNavigation.Sidebar>
        <SidebarTabNavigation.Content>
          <Title order={2}>{tab.label}</Title>
          <Text color="dimmed">
            {loading ? "..." : notifications.length}{" "}
            {Fw.Strings.pluralize(notifications.length, "notification")} found
            for this type
          </Text>
          <div
            className={clsx(
              "flex-initial flex-col md:flex-row flex items-center gap-4",
              "items-stretch md:items-center mt-4"
            )}
          >
            <TextInput
              icon={<HiOutlineSearchCircle />}
              placeholder="Search by title or description"
              sx={{
                flex: "0 0 45%",
              }}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
            />
            <Select
              icon={<HiSortDescending />}
              value={order}
              onChange={(v) => {
                setOrder(v as SortOrder);
              }}
              data={[
                { label: "Descending", value: "desc" },
                { label: "Ascending", value: "asc" },
              ]}
              placeholder="Sort order..."
            />
            <Select
              icon={<HiOutlineSortAscending />}
              value={sort}
              onChange={(v) => {
                setSort(v as NotificationSort);
              }}
              data={[
                { label: "Sort by date", value: "date" },
                { label: "Sort by title", value: "title" },
                { label: "Sort by type", value: "type" },
              ]}
              placeholder="Sort by..."
            />
          </div>
          <Divider my="xl" />
          <Stack spacing="lg">
            {loading ? (
              <div className="flex items-center justify-center w-full h-32">
                <LoadingIndicator />
              </div>
            ) : notifications &&
              notifications.filter(searchFn).sort(sortFn).length === 0 ? (
              <div className="flex justify-center">
                <ModernEmptyState
                  title="No notifications"
                  body="No notifications were found for the current queries."
                />
              </div>
            ) : (
              notifications
                .filter(searchFn)
                .sort(sortFn)
                .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
                .map((notification, i) => (
                  <Stateful key={i}>
                    {(open, setOpen) => (
                      <motion.div
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <ShadedCard
                          className="cursor-pointer"
                          onClick={() => setOpen(!open)}
                        >
                          <div className="flex items-center gap-4">
                            <Title order={3}>{notification.title}</Title>
                            <Menu withinPortal>
                              <Menu.Target>
                                <ActionIcon
                                  size="lg"
                                  radius="xl"
                                  onClick={(e: React.MouseEvent) =>
                                    e.stopPropagation()
                                  }
                                >
                                  <HiOutlineCog />
                                </ActionIcon>
                              </Menu.Target>
                              <Menu.Dropdown>
                                <Menu.Label>
                                  {new Date(
                                    notification.createdAt
                                  ).toLocaleString()}
                                </Menu.Label>
                                <Menu.Item
                                  icon={<HiOutlineEye />}
                                  onClick={(e: React.MouseEvent) => {
                                    e.stopPropagation();
                                    handleReadNotification(notification);
                                  }}
                                  disabled={notification.seen}
                                >
                                  Mark as read
                                </Menu.Item>
                                <Menu.Item
                                  icon={<HiTrash />}
                                  color="red"
                                  onClick={(e: React.MouseEvent) => {
                                    e.stopPropagation();
                                    openConfirmModal({
                                      title: "Delete notification",
                                      children: (
                                        <Text size="sm" color="dimmed">
                                          Are you sure you want to delete this
                                          notification? This action cannot be
                                          undone.
                                        </Text>
                                      ),
                                      confirmProps: {
                                        color: "red",
                                        leftIcon: <HiOutlineTrash />,
                                      },
                                      labels: {
                                        confirm: "Delete",
                                        cancel: "Nevermind",
                                      },
                                      onConfirm: () => {
                                        handleDeleteNotification(notification);
                                      },
                                    });
                                  }}
                                >
                                  Delete
                                </Menu.Item>
                              </Menu.Dropdown>
                            </Menu>
                          </div>
                          <Text size="sm" color="dimmed" mt="xs" lineClamp={2}>
                            {Fw.StringParser.t(notification.message)
                              .addPlugins(boldPlugin, linkPlugin)
                              .parse()}
                          </Text>
                          <AnimatePresence mode="wait" initial={false}>
                            {open && (
                              <motion.div
                                initial={{
                                  opacity: 0,
                                  y: -20,
                                  height: 0,
                                  marginTop: 8,
                                }}
                                animate={{
                                  opacity: 1,
                                  y: 0,
                                  height: "auto",
                                  marginTop: 12,
                                }}
                                exit={{
                                  opacity: 0,
                                  y: -20,
                                  height: 0,
                                  marginTop: 0,
                                }}
                                transition={{
                                  type: "spring",
                                  stiffness: 500,
                                  damping: 30,
                                  delay: 0.05,
                                }}
                              >
                                <ShadedCard
                                  sx={(theme) => ({
                                    backgroundColor:
                                      theme.colorScheme === "dark"
                                        ? "#000"
                                        : "#FFF",
                                  })}
                                >
                                  <DataGrid
                                    className="mt-0"
                                    items={[
                                      {
                                        tooltip: "Created at",
                                        value: new Date(
                                          notification.createdAt
                                        ).toLocaleDateString(),
                                        icon: <HiOutlineCalendar />,
                                      },
                                      {
                                        tooltip: "Type",
                                        value: (
                                          <Badge>
                                            {Fw.Strings.upper(
                                              notification.type
                                            )}
                                          </Badge>
                                        ),
                                        icon: <HiOutlineTag />,
                                      },
                                      {
                                        tooltip: "ID",
                                        value: (
                                          <div className="flex items-center gap-2">
                                            <Copy
                                              value={notification.id}
                                              dontPropagate
                                            />
                                            <span>
                                              {notification.id.slice(0, 8)}
                                            </span>
                                          </div>
                                        ),
                                        icon: <HiOutlineIdentification />,
                                      },
                                    ]}
                                  />
                                </ShadedCard>
                              </motion.div>
                            )}
                          </AnimatePresence>
                          <div className="flex mt-5 items-center justify-between">
                            <Text color="dimmed" weight={500}>
                              {new Date(
                                notification.createdAt as Date
                              ).toLocaleString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "numeric",
                                minute: "numeric",
                              })}
                            </Text>
                            <Badge
                              color={notification.seen ? "blue" : "orange"}
                            >
                              {notification.seen ? "Read" : "Unread"}
                            </Badge>
                          </div>
                        </ShadedCard>
                      </motion.div>
                    )}
                  </Stateful>
                ))
            )}
          </Stack>
          <div className="w-full justify-center flex">
            <Pagination
              mt="lg"
              radius="xl"
              size="xl"
              total={
                Math.ceil(notifications.filter(searchFn).length / PAGE_SIZE) ||
                1
              }
              page={page}
              onChange={(v) => setPage(v)}
            />
          </div>
        </SidebarTabNavigation.Content>
      </SidebarTabNavigation>
    </Framework>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return await authorizedRoute(ctx, true, false);
};

export default NotificationsPage;
