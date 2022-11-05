import {
  Avatar,
  Badge,
  Button,
  Card,
  Group,
  Stack,
  Table,
  Tabs,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { Session } from "@prisma/client";
import { getCookie } from "cookies-next";
import Link from "next/link";
import { useEffect, useState } from "react";
import { HiSearch } from "react-icons/hi";
import { useUserInformationDialog } from "../../../contexts/UserInformationDialog";
import { User } from "../../../util/prisma-types";
import Copy from "../../Copy";

type UserWithSessions = User & { sessions: Session[] };

const Users = () => {
  const [users, setUsers] = useState<UserWithSessions[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserWithSessions | null>(
    null
  );

  const { setOpen, setUser, setDefaultTab } = useUserInformationDialog();

  const fetchUsers = async () => {
    await fetch("/api/admin/users", {
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

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <>
      <div
        style={{
          display: "flex",
        }}
      >
        <div
          style={{
            width: "50%",
          }}
        >
          <Group mb={12}>
            <TextInput icon={<HiSearch />} placeholder="Search users" />
          </Group>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {users.map((u) => (
              <Card
                key={u.id}
                onClick={() => {
                  setSelectedUserId(u.id);
                  setSelectedUser(u);
                }}
                className={
                  "cursor-pointer" +
                  (selectedUserId === u.id
                    ? " bg-blue-500 text-white border-blue-600"
                    : "")
                }
              >
                <Group>
                  <Avatar src={u.avatarUri} size={24} radius="xl" />
                  <Text weight={750}>{u.username}</Text>
                </Group>
              </Card>
            ))}
          </div>
        </div>
        <div
          style={{
            width: "50%",
          }}
        >
          {selectedUserId ? (
            <>
              <Group mb={18}>
                <Avatar size="xl" radius={999} src={selectedUser?.avatarUri} />
                <Stack spacing={3}>
                  <Group>
                    <Title order={3}>{selectedUser?.username}</Title>
                    {selectedUser?.role === "ADMIN" && <Badge>Staff</Badge>}
                    {selectedUser?.banned && <Badge color="red">Banned</Badge>}
                  </Group>
                  <Text color="dimmed">{selectedUser?.bio}</Text>
                </Stack>
              </Group>

              <Group mb={18}>
                <Button color="red" disabled={selectedUser?.banned}>
                  Ban
                </Button>
                <Button.Group>
                  <Button>Impersonate</Button>
                  <Link href={`/profile/${selectedUser?.username}`}>
                    <Button>View Profile</Button>
                  </Link>
                </Button.Group>
              </Group>

              <Tabs defaultValue="info" variant="pills">
                <Tabs.List mb="md">
                  <Tabs.Tab value="info">Info</Tabs.Tab>
                  <Tabs.Tab value="sessions">Sessions</Tabs.Tab>
                  <Tabs.Tab value="activity">History</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="info">
                  <Table striped>
                    <tbody>
                      {[
                        ["Username", selectedUser?.username],
                        ["ID", selectedUser?.id],
                        ["Email", selectedUser?.email],
                        ["Role", selectedUser?.role],
                        ["Bio", selectedUser?.bio],
                        ["Avatar URI", selectedUser?.avatarUri],
                        ["Created at", selectedUser?.createdAt],
                        ["Premium", selectedUser?.premium],
                        ["Banned", selectedUser?.banned],
                        ["Tickets", selectedUser?.tickets],
                        [
                          "Games",
                          selectedUser?.games.map((g) => g.id).join(", "),
                        ],
                        [
                          "Followers",
                          <div
                            onClick={() => {
                              setOpen(true);
                              setUser(selectedUser);
                              setDefaultTab("followers");
                            }}
                            key={Array.from(
                              { length: 10 },
                              () => Math.random().toString(36)[2]
                            ).join("")}
                            className="cursor-pointer text-blue-500 underline"
                          >
                            {selectedUser?.followers.length}
                          </div>,
                        ],
                        [
                          "Following",
                          <div
                            key={Array.from(
                              { length: 10 },
                              () => Math.random().toString(36)[2]
                            ).join("")}
                            className="cursor-pointer text-blue-500 underline"
                            onClick={() => {
                              setOpen(true);
                              setUser(selectedUser);
                              setDefaultTab("following");
                            }}
                          >
                            {selectedUser?.following.length}
                          </div>,
                        ],
                        ["Country", selectedUser?.country],
                        ["Last seen", selectedUser?.lastSeen],
                        ["Busy", selectedUser?.busy],
                        ["Verified", selectedUser?.emailVerified],
                      ].map((h) => (
                        <tr key={String(h[0])}>
                          <td className="font-semibold">{String(h[0])}</td>
                          <td>
                            {h[1] as string | number | JSX.Element | null}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Tabs.Panel>
                <Tabs.Panel value="sessions">
                  <Table striped>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>OS</th>
                        <th>Token</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedUser?.sessions.map((s) => (
                        <tr key={s.id}>
                          <td>{s.id.substring(0, 8)}</td>
                          <td>{s.os}</td>
                          <td className="flex items-center">
                            <Copy value={s.token} />
                            <Text>{s.token.substring(0, 23)}</Text>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Tabs.Panel>
              </Tabs>
            </>
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
