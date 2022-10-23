import { Badge, Button, Group, Skeleton, Table } from "@mantine/core";
import { Session } from "@prisma/client";
import { deleteCookie, getCookie } from "cookies-next";
import { GetServerSidePropsContext, NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { HiLogout } from "react-icons/hi";
import Copy from "../components/Copy";
import Framework from "../components/Framework";
import logout from "../util/api/logout";
import authorizedRoute from "../util/authorizedRoute";
import { User } from "../util/prisma-types";

interface SessionsProps {
  user: User;
}

const Sessions: NextPage<SessionsProps> = ({ user }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchSessions = async () => {
    setLoading(true);

    const res = await fetch("/api/users/@me/sessions", {
      headers: {
        Authorization: String(getCookie(".frameworksession")),
      },
    });
    const data = await res.json();

    setSessions(data.sessions);
    setLoading(false);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return (
    <Framework
      user={user}
      activeTab="settings"
      modernTitle="Sessions"
      modernSubtitle="Manage your login sessions, and log out of other devices."
      returnTo={{
        label: "Back to settings",
        href: "/settings",
      }}
    >
      <Button
        leftIcon={<HiLogout />}
        color="red"
        mb={16}
        onClick={async () => {
          sessions.forEach(async (session) => {
            await logout(session.token, true);
          });

          deleteCookie(".frameworksession");
          router.push("/");
        }}
      >
        Log out of all devices
      </Button>

      <Table striped>
        <thead>
          <tr>
            <th>Status</th>
            <th>IP Address</th>
            <th>Token</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {sessions.length > 0 ? (
            sessions.map((session) => (
              <tr key={session.id}>
                <td>
                  {getCookie(".frameworksession") == session.token ? (
                    <Badge>Current Session</Badge>
                  ) : (
                    <Badge color="orange">Other Session</Badge>
                  )}
                </td>
                <td>{session.ip}</td>
                <td>
                  <Group>
                    <Copy value={session.token} />
                    {session.token.slice(0, 10)}...
                  </Group>
                </td>
                <td>
                  <Button
                    color="red"
                    size="xs"
                    onClick={async () =>
                      await logout(session.token, true).then(() => {
                        fetchSessions();
                      })
                    }
                  >
                    Log out
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <td key={i}>
                    <Skeleton height={24} />
                  </td>
                ))}
            </tr>
          )}
        </tbody>
      </Table>
    </Framework>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return await authorizedRoute(context, true, false);
}

export default Sessions;
