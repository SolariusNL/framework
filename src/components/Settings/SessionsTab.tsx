import {
  Badge,
  Button,
  CloseButton,
  Pagination,
  Skeleton,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { Session } from "@prisma/client";
import { deleteCookie, getCookie } from "cookies-next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  HiCheck,
  HiLogout,
  HiOutlineDesktopComputer,
  HiOutlineDeviceMobile,
} from "react-icons/hi";
import logout from "../../util/api/logout";
import { User } from "../../util/prisma-types";
import {
  Device,
  getOperatingSystemDevice,
  getOperatingSystemEnumFromString,
  getOperatingSystemString,
} from "../../util/ua";
import ShadedCard from "../ShadedCard";
import SettingsTab from "./SettingsTab";
import SideBySide from "./SideBySide";

interface SessionsTabProps {
  user: User;
}

const SessionsTab: React.FC<SessionsTabProps> = ({ user }) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [page, setPage] = useState(1);

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
    <SettingsTab tabValue="sessions" tabTitle="Sessions">
      <Text mb={32}>
        Manage your active sessions. If you suspect that your account has been
        compromised, you can log out of all sessions below.
      </Text>
      <Stack spacing={16}>
        {loading ? (
          Array(5).map((_, i) => <Skeleton height={120} key={i} />)
        ) : (
          <>
            <SideBySide
              title="Log out all sessions"
              description="Log out of all sessions on all devices. This will log you out of this device as well."
              icon={<HiLogout />}
              right={
                <>
                  <Button
                    leftIcon={<HiLogout />}
                    color="red"
                    onClick={async () => {
                      openConfirmModal({
                        title: "Log out",
                        children: (
                          <Text size="sm" color="dimmed">
                            Are you sure you want to log out all of your
                            sessions? You will need to log back into your
                            account on all your devices.
                          </Text>
                        ),
                        labels: { confirm: "Yes", cancel: "Nevermind" },
                        async onConfirm() {
                          sessions.forEach(async (session) => {
                            await logout(session.token, true);
                          });

                          deleteCookie(".frameworksession");
                          router.push("/");
                        },
                        closeOnConfirm: true,
                        confirmProps: { color: "red", leftIcon: <HiCheck /> },
                      });
                    }}
                    fullWidth
                  >
                    Log out of all devices
                  </Button>
                  <Text color="dimmed" mt={8}>
                    This will log you out of all devices, including this one.
                  </Text>
                </>
              }
              noUpperBorder
              shaded
            />
            <div className="flex items-center justify-center">
              <Pagination
                total={Math.ceil(sessions.length / 5)}
                page={page}
                onChange={setPage}
                mt="md"
                mb="md"
                radius="md"
              />
            </div>
            {sessions.slice((page - 1) * 5, page * 5).map((session) => (
              <ShadedCard
                key={session.id}
                className="flex items-center justify-between overflow-visible"
                sx={(theme) => ({
                  backgroundColor:
                    theme.colorScheme === "dark"
                      ? theme.colors.dark[8]
                      : theme.colors.gray[1],
                })}
              >
                <div className="flex flex-col md:flex-row">
                  <Badge
                    sx={{
                      width: 48,
                      height: 48,
                    }}
                    className="flex items-center justify-center"
                  >
                    {getOperatingSystemDevice(
                      getOperatingSystemEnumFromString(session.os)
                    ) === Device.Desktop ? (
                      <HiOutlineDesktopComputer
                        size={20}
                        className="flex items-center justify-center"
                      />
                    ) : (
                      <HiOutlineDeviceMobile
                        size={20}
                        className="flex items-center justify-center"
                      />
                    )}
                  </Badge>
                  <div className="flex flex-col md:ml-4 mt-4 md:mt-0">
                    <div className="flex items-center gap-2">
                      <Text size="lg" weight={600}>
                        {getOperatingSystemString(
                          getOperatingSystemEnumFromString(session.os)
                        )}
                      </Text>
                      {getCookie(".frameworksession") == session.token && (
                        <Badge size="sm">Current Session</Badge>
                      )}
                    </div>
                    <Text color="dimmed" size="sm">
                      {session.ip.includes("::ffff:")
                        ? "localhost"
                        : session.ip.includes(":")
                        ? session.ip.split(":").slice(-2).join(":")
                        : session.ip}{" "}
                      - {session.ua.split(")")[0].split("(")[1]}
                    </Text>
                    {session.impersonation && (
                      <Text mt="md" color="dimmed" size="sm">
                        Your account is being accessed by a staff member using
                        this session.
                      </Text>
                    )}
                  </div>
                </div>
                <Tooltip label="Log out of this session">
                  <CloseButton
                    onClick={async () =>
                      await logout(session.token, true).then(() => {
                        fetchSessions();
                      })
                    }
                    disabled={getCookie(".frameworksession") == session.token}
                  />
                </Tooltip>
              </ShadedCard>
            ))}
          </>
        )}
      </Stack>
    </SettingsTab>
  );
};

export default SessionsTab;
