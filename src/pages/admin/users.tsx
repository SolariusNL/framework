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
  useMantineTheme
} from "@mantine/core";
import { Session } from "@prisma/client";
import { GetServerSidePropsContext, NextPage } from "next";
import { useState } from "react";
import { HiSearch } from "react-icons/hi";
import Framework from "../../components/Framework";
import authorizedRoute from "../../util/authorizedRoute";
import prisma from "../../util/prisma";
import { User, userSelect } from "../../util/prisma-types";

type UserWithSessions = User & { sessions: Session[] };

interface UsersProps {
  user: User;
  initialUsers: UserWithSessions[];
}

const Users: NextPage<UsersProps> = ({ user, initialUsers }) => {
  const [users, setUsers] = useState(initialUsers);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserWithSessions | null>(
    null
  );

  const theme = useMantineTheme();

  return (
    <>
      <Framework
        user={user}
        activeTab="none"
        modernTitle="Users"
        modernSubtitle="Manage users of this instance."
      >
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
                  shadow="sm"
                  sx={{
                    cursor: "pointer",
                    ...(selectedUserId === u.id && {
                      border: `2px solid ${theme.colors.blue[5]}`,
                    }),
                  }}
                  onClick={() => {
                    setSelectedUserId(u.id);
                    setSelectedUser(u);
                  }}
                >
                  <Group>
                    <Avatar src={u.avatarUri} size={24} radius="xl" />
                    <Text weight={750} color="dimmed">
                      {u.username}
                    </Text>
                  </Group>
                </Card>
              ))}
            </div>
          </div>
          <div
            style={{
              width: "50%"
            }}
          >
            {selectedUserId ? (
              <>
                <Group mb={18}>
                  <Avatar
                    size="xl"
                    radius={999}
                    src={selectedUser?.avatarUri}
                  />
                  <Stack spacing={3}>
                    <Group>
                      <Title order={3}>{selectedUser?.username}</Title>
                      {selectedUser?.role === "ADMIN" && <Badge>Staff</Badge>}
                      {selectedUser?.banned && (
                        <Badge color="red">Banned</Badge>
                      )}
                    </Group>
                    <Text color="dimmed">{user.bio}</Text>
                  </Stack>
                </Group>

                <Group mb={18}>
                  <Button color="red" disabled={selectedUser?.banned}>
                    Ban
                  </Button>
                  <Button.Group>
                    <Button>Impersonate</Button>
                    <Button>View Profile</Button>
                  </Button.Group>
                </Group>

                <Tabs defaultValue="info">
                  <Tabs.List>
                    <Tabs.Tab value="info">Info</Tabs.Tab>
                    <Tabs.Tab value="sessions">Sessions</Tabs.Tab>
                    <Tabs.Tab value="activity">History</Tabs.Tab>
                  </Tabs.List>

                  <Tabs.Panel value="info">
                    <Table striped>
                      <tbody>
                        {Object.entries(selectedUser as UserWithSessions).map(
                          ([key, value]) => (
                            <tr key={key}>
                              <td>{key}</td>
                              <td>
                                {typeof value === "boolean" ? (
                                  <Badge color={value ? "green" : "red"}>
                                    {value.toString()}
                                  </Badge>
                                ) : Array.isArray(value) ? (
                                  value
                                    .map((v) =>
                                      typeof v === "object" ? v.id : v
                                    )
                                    .join(", ") || "None"
                                ) : typeof value === "object" ? (
                                  JSON.stringify(value) || "None"
                                ) : (
                                  value
                                )}{" "}
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </Table>
                  </Tabs.Panel>
                  <Tabs.Panel value="sessions">
                    <Table striped>
                      <tbody>
                        {selectedUser?.sessions.map((s) => (
                          <tr key={s.id}>
                            <td>{s.id}</td>
                            <td>{s.os}</td>
                            <td>{s.token.substring(0, 23)}</td>
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
      </Framework>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const auth = await authorizedRoute(context, true, false, true);
  if (auth.redirect) return auth;

  const users = await prisma.user.findMany({
    select: {
      ...userSelect,
      sessions: true,
    },
    take: 50,
  });

  return {
    props: {
      user: auth.props.user,
      initialUsers: JSON.parse(JSON.stringify(users)),
    },
  };
}

export default Users;
