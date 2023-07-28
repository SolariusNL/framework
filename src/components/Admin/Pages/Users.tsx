import UserView from "@/components/admin/user-view";
import ContextMenu from "@/components/context-menu";
import LoadingIndicator from "@/components/loading-indicator";
import ShadedButton from "@/components/shaded-button";
import UserSelect from "@/components/user-select";
import IResponseBase from "@/types/api/IResponseBase";
import clsx from "@/util/clsx";
import fetchJson from "@/util/fetch";
import getMediaUrl from "@/util/get-media";
import useMediaQuery from "@/util/media-query";
import { NonUser, User } from "@/util/prisma-types";
import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Menu,
  Modal,
  Pagination,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import {
  DiscordConnectCode,
  Notification,
  PunishmentLog,
  Session,
  UserAdminNotes,
} from "@prisma/client";
import { getCookie } from "cookies-next";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  HiArrowRight,
  HiBell,
  HiCheckCircle,
  HiDotsVertical,
  HiRefresh,
  HiSearch,
  HiUser,
} from "react-icons/hi";
import ReactNoSSR from "react-no-ssr";

export type AdminViewUser = User & {
  sessions: Session[];
  discordAccount: DiscordConnectCode | null;
  notifications: Notification[];
  notes: UserAdminNotes &
    {
      author: NonUser;
      user: NonUser;
    }[];
  punishmentHistory: Array<
    PunishmentLog & {
      punishedBy: NonUser;
    }
  >;
};

const Users = () => {
  const [users, setUsers] = useState<AdminViewUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminViewUser | null>(null);
  const mobile = useMediaQuery("768");
  const [page, setPage] = useState(0);
  const router = useRouter();
  const [pages, setPages] = useState(0);
  const [opened, setOpened] = useState(false);
  const [bulkOpened, setBulkOpened] = useState(false);
  const [punishPanelOpened, setPunishPanelOpened] = useState(false);
  const [userLoading, setUserLoading] = useState(false);

  const fetchUsers = async () => {
    await fetch(`/api/admin/users/${page}`, {
      headers: {
        Authorization: String(getCookie(".frameworksession")),
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setUsers(res);
      });
  };

  const fetchPages = async () => {
    await fetch("/api/admin/userpages", {
      headers: {
        Authorization: String(getCookie(".frameworksession")),
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.text())
      .then((res) => {
        setPages(Number(res));
      });
  };

  const bulkNotificationForm = useForm<{
    title: string;
    message: string;
  }>({
    initialValues: {
      title: "",
      message: "",
    },
    validate: {
      title: (value) => {
        if (!value) return "Title is required";
      },
      message: (value) => {
        if (!value) return "Message is required";
      },
    },
  });

  const fetchUser = async (id: number) => {
    await fetchJson<IResponseBase<{ user: AdminViewUser }>>(
      `/api/admin/user/${id}`,
      {
        auth: true,
      }
    )
      .then((res) => {
        if (res.success) {
          setSelectedUser(res.data?.user!);
        }
      })
      .finally(() => setUserLoading(false));
  };

  const singleNotificationForm = useForm<{
    title: string;
    message: string;
    userid: number;
  }>({
    initialValues: {
      title: "",
      message: "",
      userid: 0,
    },
    validate: {
      title: (value) => {
        if (!value) return "Title is required";
      },
      message: (value) => {
        if (!value) return "Message is required";
      },
      userid: (value) => {
        if (!value) return "User ID is required";
      },
    },
  });

  useEffect(() => {
    fetchUsers();
    fetchPages();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [page]);

  return (
    <>
      <Modal
        title="Send bulk notification"
        opened={bulkOpened}
        onClose={() => setBulkOpened(false)}
      >
        <Text mb={16}>
          Send a notification to all users. This is useful for announcing new
          features or updates.
        </Text>

        <form
          onSubmit={bulkNotificationForm.onSubmit(
            async (values) =>
              await fetch("/api/admin/notifications/send/all", {
                method: "POST",
                headers: {
                  Authorization: String(getCookie(".frameworksession")),
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
              })
                .then((res) => res.json())
                .then((res) => {
                  if (res.error) {
                    bulkNotificationForm.setFieldError("message", res.error);
                  } else {
                    setOpened(false);
                    showNotification({
                      title: "Success",
                      message: "Notification sent",
                      icon: <HiCheckCircle />,
                    });
                  }
                })
          )}
        >
          <TextInput
            label="Title"
            description="Title of the notification"
            mb={7}
            {...bulkNotificationForm.getInputProps("title")}
          />
          <Textarea
            label="Message"
            description="Message of the notification"
            mb={16}
            {...bulkNotificationForm.getInputProps("message")}
          />
          <Button type="submit" fullWidth>
            Send notifications
          </Button>
        </form>
      </Modal>
      <Modal
        title="Send single notification"
        opened={opened}
        onClose={() => setOpened(false)}
      >
        <Text mb={16}>
          Send a notification to a single user. This is useful for notifying a
          user about a report or a ban, or for sending them a message.
        </Text>

        <form
          onSubmit={singleNotificationForm.onSubmit(
            async (values) =>
              await fetch(`/api/admin/notifications/send/${values.userid}`, {
                method: "POST",
                headers: {
                  Authorization: String(getCookie(".frameworksession")),
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  title: values.title,
                  message: values.message,
                }),
              })
                .then((res) => res.json())
                .then((res) => {
                  if (res.error) {
                    singleNotificationForm.setFieldError("message", res.error);
                  } else {
                    setOpened(false);
                    showNotification({
                      title: "Success",
                      message: "Notification sent",
                      icon: <HiCheckCircle />,
                    });
                  }
                })
          )}
        >
          <UserSelect
            onUserSelect={(user) => {
              singleNotificationForm.setFieldValue("userid", user.id);
            }}
            label="User"
            description="User to send the notification to"
            mb={7}
            {...singleNotificationForm.getInputProps("userid")}
          />
          <TextInput
            label="Title"
            description="Title of the notification"
            mb={7}
            {...singleNotificationForm.getInputProps("title")}
          />
          <Textarea
            label="Message"
            description="Message of the notification"
            mb={16}
            {...singleNotificationForm.getInputProps("message")}
          />
          <Button type="submit" fullWidth>
            Send notifications
          </Button>
        </form>
      </Modal>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        <div style={{ width: mobile ? "100%" : "38%" }}>
          <div
            className={clsx(
              "flex-initial md:flex-row flex items-center gap-4",
              "items-stretch justify-between mb-4"
            )}
          >
            <TextInput
              icon={<HiSearch />}
              placeholder="Search users"
              className="w-full"
              sx={{
                flex: "0 0 85%",
              }}
            />
            <Menu>
              <Menu.Target>
                <ActionIcon className="w-9 h-9" variant="default">
                  <HiDotsVertical />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Notifications</Menu.Label>
                <Menu.Item icon={<HiBell />} onClick={() => setOpened(true)}>
                  Send notification to user
                </Menu.Item>
                <Menu.Item
                  icon={<HiBell />}
                  onClick={() => setBulkOpened(true)}
                >
                  Send all users notification
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </div>
          <Pagination
            className="w-full flex justify-center mb-6"
            radius="xl"
            page={page + 1}
            onChange={(p) => setPage(p - 1)}
            total={pages}
          />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {users &&
              users.length > 0 &&
              users.map((u) => (
                <ContextMenu
                  className="w-full"
                  dropdown={
                    <>
                      <Menu.Item
                        icon={<HiUser />}
                        onClick={() => router.push(`/profile/${u.username}`)}
                      >
                        View profile
                      </Menu.Item>
                      <Menu.Item
                        icon={<HiArrowRight />}
                        onClick={() => {
                          setSelectedUser(null);
                          setUserLoading(true);
                          fetchUser(u.id);
                        }}
                      >
                        Select user
                      </Menu.Item>
                      <Menu.Divider />
                      <Menu.Item
                        icon={<HiRefresh />}
                        onClick={() => fetchUsers()}
                      >
                        Refresh
                      </Menu.Item>
                    </>
                  }
                  key={u.id}
                  width={160}
                >
                  <ShadedButton
                    onClick={() => {
                      setSelectedUser(null);
                      setUserLoading(true);
                      fetchUser(u.id);
                    }}
                    key={u.id}
                  >
                    <Avatar src={getMediaUrl(u.avatarUri)} className="mr-3" />
                    <div>
                      <div className="flex items-center">
                        <Text weight={600} className="mr-2">
                          {u.username}
                        </Text>
                        {u.role === "ADMIN" && (
                          <Image
                            src="/brand/white.png"
                            width={16}
                            height={16}
                          />
                        )}
                        {u.banned && <Badge color="red">Banned</Badge>}
                      </div>
                      <Text size="sm" color="dimmed">
                        {u.email}
                      </Text>
                    </div>
                  </ShadedButton>
                </ContextMenu>
              ))}
          </div>
        </div>
        <div
          style={{
            width: mobile ? "100%" : "58%",
            marginTop: mobile ? 16 : 0,
          }}
        >
          {userLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingIndicator />
            </div>
          ) : (
            <ReactNoSSR>
              <UserView
                user={selectedUser as AdminViewUser}
                loading={userLoading}
              />
            </ReactNoSSR>
          )}
        </div>
      </div>
    </>
  );
};

export default Users;
