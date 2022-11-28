import {
  Avatar,
  Badge,
  Button,
  Group,
  Modal,
  Pagination,
  Text,
  Textarea,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import {
  DiscordConnectCode,
  Notification,
  Session,
  UserAdminNotes,
} from "@prisma/client";
import { getCookie } from "cookies-next";
import { useEffect, useState } from "react";
import { HiBell, HiCheckCircle, HiSearch } from "react-icons/hi";
import ReactNoSSR from "react-no-ssr";
import getMediaUrl from "../../../util/getMedia";
import { NonUser, User } from "../../../util/prisma-types";
import useMediaQuery from "../../../util/useMediaQuery";
import Stateful from "../../Stateful";
import UserSelect from "../../UserSelect";
import UserView from "../UserView";

export type AdminViewUser = User & {
  sessions: Session[];
  discordAccount: DiscordConnectCode | null;
  notifications: Notification[];
  notes: UserAdminNotes &
    {
      author: NonUser;
      user: NonUser;
    }[];
};

const Users = () => {
  const [users, setUsers] = useState<AdminViewUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminViewUser | null>(null);
  const mobile = useMediaQuery("768");
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(0);

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
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        <div style={{ width: mobile ? "100%" : "38%" }}>
          <Group mb={12}>
            <TextInput
              icon={<HiSearch />}
              placeholder="Search users"
              className="w-full"
            />
          </Group>
          <ReactNoSSR>
            <Button.Group mb={12}>
              <Stateful>
                {(opened, setOpened) => (
                  <>
                    <Button
                      leftIcon={<HiBell />}
                      onClick={() => setOpened(true)}
                    >
                      Send bulk notification
                    </Button>

                    <Modal
                      title="Send bulk notification"
                      opened={opened}
                      onClose={() => setOpened(false)}
                    >
                      <Text mb={16}>
                        Send a notification to all users. This is useful for
                        announcing new features or updates.
                      </Text>

                      <form
                        onSubmit={bulkNotificationForm.onSubmit(
                          async (values) =>
                            await fetch("/api/admin/notifications/send/all", {
                              method: "POST",
                              headers: {
                                Authorization: String(
                                  getCookie(".frameworksession")
                                ),
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify(values),
                            })
                              .then((res) => res.json())
                              .then((res) => {
                                if (res.error) {
                                  bulkNotificationForm.setFieldError(
                                    "message",
                                    res.error
                                  );
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
                  </>
                )}
              </Stateful>
              <Stateful>
                {(opened, setOpened) => (
                  <>
                    <Button
                      leftIcon={<HiBell />}
                      onClick={() => setOpened(true)}
                    >
                      Send notification
                    </Button>

                    <Modal
                      title="Send single notification"
                      opened={opened}
                      onClose={() => setOpened(false)}
                    >
                      <Text mb={16}>
                        Send a notification to a single user. This is useful for
                        notifying a user about a report or a ban, or for sending
                        them a message.
                      </Text>

                      <form
                        onSubmit={singleNotificationForm.onSubmit(
                          async (values) =>
                            await fetch(
                              `/api/admin/notifications/send/${values.userid}`,
                              {
                                method: "POST",
                                headers: {
                                  Authorization: String(
                                    getCookie(".frameworksession")
                                  ),
                                  "Content-Type": "application/json",
                                },
                                body: JSON.stringify({
                                  title: values.title,
                                  message: values.message,
                                }),
                              }
                            )
                              .then((res) => res.json())
                              .then((res) => {
                                if (res.error) {
                                  singleNotificationForm.setFieldError(
                                    "message",
                                    res.error
                                  );
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
                            singleNotificationForm.setFieldValue(
                              "userid",
                              user.id
                            );
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
                  </>
                )}
              </Stateful>
            </Button.Group>
          </ReactNoSSR>
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
                <UnstyledButton
                  sx={(theme) => ({
                    padding: theme.spacing.xs,
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
                    width: "100%",
                    display: "flex",
                  })}
                  onClick={() => {
                    setSelectedUserId(u.id);
                    setSelectedUser(u);
                  }}
                  key={u.id}
                >
                  <Avatar src={getMediaUrl(u.avatarUri)} className="mr-3" />
                  <div>
                    <div className="flex items-center">
                      <Text weight={600} className="mr-2">
                        {u.username}
                      </Text>
                      {u.role === "ADMIN" && <Badge>Staff</Badge>}
                      {u.banned && <Badge color="red">Banned</Badge>}
                    </div>
                    <Text size="sm" color="dimmed">
                      {u.email}
                    </Text>
                  </div>
                </UnstyledButton>
              ))}
          </div>
        </div>
        <div
          style={{ width: mobile ? "100%" : "58%", marginTop: mobile ? 16 : 0 }}
        >
          {selectedUserId ? (
            <ReactNoSSR>
              <UserView user={selectedUser as AdminViewUser} />
            </ReactNoSSR>
          ) : (
            <Text size="xl" weight={700}>
              Select a user to view their profile.
            </Text>
          )}
        </div>
      </div>
    </>
  );
};

export default Users;
