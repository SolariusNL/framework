import Copy from "@/components/copy";
import Framework from "@/components/framework";
import ShadedCard from "@/components/shaded-card";
import logout from "@/util/api/logout";
import authorizedRoute from "@/util/auth";
import { User } from "@/util/prisma-types";
import {
  Device,
  getOperatingSystemDevice,
  getOperatingSystemEnumFromString,
  getOperatingSystemString,
} from "@/util/ua";
import {
  Badge,
  Button,
  Card,
  Skeleton,
  Table,
  Text,
  Tooltip,
} from "@mantine/core";
import { Session } from "@prisma/client";
import { deleteCookie, getCookie } from "cookies-next";
import { GetServerSidePropsContext, NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { HiDesktopComputer, HiDeviceMobile, HiLogout } from "react-icons/hi";

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
        href: "/settings/account",
      }}
    >
      <Button
        leftIcon={<HiLogout />}
        color="red"
        mb={32}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} height={200} radius="md" />
            ))
          : sessions.map((session) => (
              <ShadedCard shadow="sm" key={session.id} p={0} withBorder>
                <Card.Section withBorder p={12}>
                  <div className="flex justify-between items-center">
                    <div>
                      <Badge>
                        {getOperatingSystemDevice(
                          getOperatingSystemEnumFromString(session.os)
                        ) === Device.Desktop ? (
                          <HiDesktopComputer />
                        ) : (
                          <HiDeviceMobile />
                        )}
                        {getOperatingSystemString(
                          getOperatingSystemEnumFromString(session.os)
                        )}
                      </Badge>
                    </div>
                    <div>
                      {getCookie(".frameworksession") == session.token ? (
                        <Badge color="teal">Current Session</Badge>
                      ) : (
                        <Badge color="orange">Other Session</Badge>
                      )}
                    </div>
                  </div>
                </Card.Section>
                <Table>
                  <tbody>
                    <tr>
                      <td>IP Address</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Copy value={session.ip} />
                          <Text weight={700} lineClamp={1}>
                            {session.ip}
                          </Text>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>User Agent</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Copy value={session.ua} />
                          <Text lineClamp={1} className="font-mono font-bold">
                            {session.ua.substring(0, 10)}...
                          </Text>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td>Token</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Copy value={session.token} />
                          <Text lineClamp={1} className="font-mono font-bold">
                            {session.token.substring(0, 10)}...
                          </Text>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </Table>
                <div className="p-6">
                  <Tooltip
                    label={
                      getCookie(".frameworksession") == session.token
                        ? "You cannot log out of your current session"
                        : "Log out of this device, and delete this session"
                    }
                  >
                    <Button
                      color="red"
                      onClick={async () =>
                        await logout(session.token, true).then(() => {
                          fetchSessions();
                        })
                      }
                      disabled={getCookie(".frameworksession") == session.token}
                    >
                      Log out
                    </Button>
                  </Tooltip>
                </div>
              </ShadedCard>
            ))}
      </div>
    </Framework>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return await authorizedRoute(context, true, false);
}

export default Sessions;
