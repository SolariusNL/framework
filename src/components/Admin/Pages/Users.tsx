import {
  Avatar,
  Badge,
  Group,
  Pagination,
  Text,
  TextInput,
  UnstyledButton
} from "@mantine/core";
import {
  DiscordConnectCode,
  Notification,
  Session,
  UserAdminNotes
} from "@prisma/client";
import { getCookie } from "cookies-next";
import { useEffect, useState } from "react";
import { HiSearch } from "react-icons/hi";
import ReactNoSSR from "react-no-ssr";
import getMediaUrl from "../../../util/getMedia";
import { NonUser, User } from "../../../util/prisma-types";
import useMediaQuery from "../../../util/useMediaQuery";
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
