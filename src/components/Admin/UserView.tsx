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
  Title,
} from "@mantine/core";
import Link from "next/link";
import React from "react";
import { useUserInformationDialog } from "../../contexts/UserInformationDialog";
import getMediaUrl from "../../util/getMedia";
import Copy from "../Copy";
import ModernEmptyState from "../ModernEmptyState";
import NoteTable, { NoteUser } from "./NoteTable";
import { AdminViewUser } from "./Pages/Users";
import Punishment from "./Punishment";

interface UserViewProps {
  user: AdminViewUser;
}

const UserView = ({ user }: UserViewProps) => {
  const randomKey = () => {
    return Math.random().toString(36).substring(7);
  };

  const { setOpen, setUser, setDefaultTab } = useUserInformationDialog();
  const [punishOpened, setPunishOpened] = React.useState(false);

  return (
    <>
      <Punishment
        user={user}
        punishOpened={punishOpened}
        setPunishOpened={setPunishOpened}
        onCompleted={() => {
          setPunishOpened(false);
        }}
      />
      <Group mb={18}>
        <Avatar size="xl" radius={999} src={getMediaUrl(user.avatarUri)} />
        <Stack spacing={3}>
          <Group>
            <Title order={3}>{user.username}</Title>
            {user.role === "ADMIN" && <Badge>Staff</Badge>}
            {user.banned && <Badge color="red">Banned</Badge>}
          </Group>
          <Text color="dimmed">
            {user.bio.split("\n").map((line, i) => (
              <React.Fragment key={randomKey()}>
                {line}
                <br />
              </React.Fragment>
            ))}
          </Text>
        </Stack>
      </Group>

      <Group mb={18}>
        <Button
          color="red"
          onClick={() => {
            setPunishOpened(true);
          }}
        >
          Punish
        </Button>
        <Button.Group>
          <Button>Impersonate</Button>
          <Link href={`/profile/${user.username}`}>
            <Button>View Profile</Button>
          </Link>
        </Button.Group>
      </Group>

      <Tabs defaultValue="info" variant="pills">
        <Tabs.List
          mb="md"
          style={{
            flexWrap: "wrap",
          }}
        >
          <Tabs.Tab value="info">Info</Tabs.Tab>
          <Tabs.Tab value="sessions">Sessions</Tabs.Tab>
          <Tabs.Tab value="punishment">Punishment</Tabs.Tab>
          <Tabs.Tab value="notifications">Notifications</Tabs.Tab>
          <Tabs.Tab value="secrets">Secrets</Tabs.Tab>
          <Tabs.Tab value="history">
            Punishment History
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="info">
          <Table striped mb={6}>
            <tbody>
              {[
                ["Username", user.username],
                ["Alias", user.alias],
                [
                  "Previous Usernames",
                  user.previousUsernames.join(", ") || "None",
                ],
                ["ID", user.id],
                ["Email", user.email],
                ["Role", <Badge key={randomKey()}>{user.role}</Badge>],
                ["Bio", user.bio],
                ["Avatar URI", user.avatarUri],
                ["Created at", user.createdAt],
                ["Premium", user.premium],
                ["Banned", user.banned],
                ["Tickets", user.tickets],
                ["Linked Discord", user.discordAccount?.discordId],
                ["Games", user.games.map((g) => g.id).join(", ")],
                ["Links", user.profileLinks.map((l) => l.url).join(", ")],
                [
                  "Followers",
                  <div
                    onClick={() => {
                      setOpen(true);
                      setUser(user);
                      setDefaultTab("followers");
                    }}
                    key={randomKey()}
                    className="cursor-pointer text-blue-500 underline"
                  >
                    {user.followers.length}
                  </div>,
                ],
                [
                  "Following",
                  <div
                    key={randomKey()}
                    className="cursor-pointer text-blue-500 underline"
                    onClick={() => {
                      setOpen(true);
                      setUser(user);
                      setDefaultTab("following");
                    }}
                  >
                    {user.following.length}
                  </div>,
                ],
                ["Country", user.country],
                ["Last seen", user.lastSeen],
                ["Busy", user.busy],
                ["Verified", user.emailVerified],
                ["2FA", user.emailRequiredLogin],
              ]
                .map((i) => {
                  if (typeof i[1] === "boolean") {
                    return [i[0], i[1] ? "Yes" : "No"];
                  }
                  return i;
                })
                .map((h) => (
                  <tr key={String(h[0])}>
                    <td className="font-semibold">{String(h[0])}</td>
                    <td>{h[1] as string | number | JSX.Element | null}</td>
                  </tr>
                ))}
            </tbody>
          </Table>
          <NoteTable user={user as unknown as NoteUser} />
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
              {user.sessions.map((s) => (
                <tr key={s.id}>
                  <td>{s.id.substring(0, 8)}</td>
                  <td>
                    <Badge>{s.os}</Badge>
                  </td>
                  <td className="flex items-center">
                    <Copy value={s.token} />
                    <Text>{s.token.substring(0, 23)}</Text>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tabs.Panel>

        <Tabs.Panel value="punishment">
          {!user.banned && !user.warning ? (
            <ModernEmptyState
              title="No active punishments"
              body="This user has no active punishments."
            />
          ) : (
            <>
              <Stack spacing={8}>
                {[
                  {
                    title: "Ban info",
                    sections: [["Ban note", user.banReason]],
                    condition: user.banned,
                  },
                  {
                    title: "Warning info",
                    sections: [["Warning note", user.warning]],
                    condition: user.warning,
                  },
                ]
                  .filter((i) => i.condition)
                  .map((data) => (
                    <Card key={randomKey()} withBorder>
                      <Card.Section inheritPadding py="xs" mb={16} withBorder>
                        <Text color="dimmed" weight={700} size="sm">
                          {data.title}
                        </Text>
                      </Card.Section>

                      {data.sections.map(([title, value]) => (
                        <Text mb={6} key={randomKey()}>
                          {title}:{" "}
                          <span className="font-semibold">{value}</span>
                        </Text>
                      ))}
                    </Card>
                  ))}
              </Stack>
            </>
          )}
        </Tabs.Panel>

        <Tabs.Panel value="notifications">
          <Table striped>
            <thead>
              <tr>
                <th>Type</th>
                <th>Title</th>
                <th>Body</th>
                <th>Created at</th>
              </tr>
            </thead>
            <tbody>
              {user.notifications
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                )
                .map((n) => (
                  <tr key={n.id}>
                    <td>
                      <Badge>{n.type}</Badge>
                    </td>
                    <td>{n.title}</td>
                    <td>{n.message}</td>
                    <td>{new Date(n.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
            </tbody>
          </Table>
        </Tabs.Panel>

        <Tabs.Panel value="secrets">
          <Table striped>
            <thead>
              <tr>
                <th>Name</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {user.secrets.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td className="flex items-center">
                    <Copy value={s.code} />
                    <Text>{s.code.substring(0, 23)}</Text>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tabs.Panel>

        <Tabs.Panel value="history">
            
        </Tabs.Panel>
      </Tabs>
    </>
  );
};

export default UserView;
