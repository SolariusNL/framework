import ModernEmptyState from "@/components/modern-empty-state";
import SettingsTab from "@/components/settings/settings-tab";
import SideBySide from "@/components/settings/side-by-side";
import ShadedCard from "@/components/shaded-card";
import logout from "@/util/api/logout";
import clsx from "@/util/clsx";
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
  CloseButton,
  Pagination,
  Select,
  Skeleton,
  Stack,
  Text,
  Tooltip,
} from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { OAuthApplication, Session } from "@prisma/client";
import { deleteCookie, getCookie } from "cookies-next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  HiCheck,
  HiFilter,
  HiLink,
  HiLogout,
  HiOutlineDesktopComputer,
  HiOutlineDeviceMobile,
  HiQuestionMarkCircle,
} from "react-icons/hi";

type SessionsTabProps = {
  user: User;
};
type Filter = "all" | "desktop" | "mobile" | "staff" | "oauth";
type SessionWithOAuth = Session & { oauth: OAuthApplication | null };

const SessionsTab: React.FC<SessionsTabProps> = ({ user }) => {
  const [sessions, setSessions] = useState<SessionWithOAuth[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<Filter>("all");
  const currentSessionToken = getCookie(".frameworksession");

  const getOS = (os: string) =>
    getOperatingSystemDevice(getOperatingSystemEnumFromString(os));

  const filterFn = (session: SessionWithOAuth) => {
    if (filter === "all") return true;
    if (filter === "desktop") return getOS(session.os) === Device.Desktop;
    if (filter === "mobile") return getOS(session.os) === Device.Mobile;
    if (filter === "staff") return session.impersonation;
    if (filter === "oauth") return session.oauth !== null;
  };
  const sortFn = (a: SessionWithOAuth, b: SessionWithOAuth) => {
    if (a.token === currentSessionToken) {
      return -1;
    } else if (b.token === currentSessionToken) {
      return 1;
    } else {
      return 0;
    }
  };

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
                        confirmProps: {
                          color: "red",
                          leftIcon: <HiCheck />,
                          radius: "xl",
                          variant: "light",
                        },
                        cancelProps: {
                          color: "gray",
                          radius: "xl",
                          variant: "light",
                        },
                      });
                    }}
                    fullWidth
                    radius="xl"
                    variant="light"
                  >
                    Log out of all devices
                  </Button>
                  <Text color="dimmed" mt={8} size="sm">
                    This will log you out of all devices, including this one.
                  </Text>
                </>
              }
              noUpperBorder
              shaded
            />
            <div className="flex items-center md:flex-row flex-col justify-between mt-4 mb-4 gap-4">
              <Pagination
                total={Math.ceil(sessions.filter(filterFn).length / 5)}
                page={page}
                onChange={setPage}
                radius="md"
              />
              <Select
                icon={<HiFilter />}
                value={filter}
                onChange={(v) => setFilter(v as Filter)}
                placeholder="Filter by"
                data={[
                  { label: "All", value: "all" },
                  { label: "Desktop sessions", value: "desktop" },
                  { label: "Mobile sessions", value: "mobile" },
                  { label: "Staff sessions", value: "staff" },
                  { label: "OAuth applications", value: "oauth" },
                ]}
              />
            </div>
            {sessions.filter(filterFn).length > 0 ? (
              sessions
                .filter(filterFn)
                .sort(sortFn)
                .slice((page - 1) * 5, page * 5)
                .map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center p-2 justify-between overflow-visible"
                  >
                    <div className="flex flex-col md:flex-row flex-shrink-0">
                      <Badge
                        sx={{
                          width: 48,
                          height: 48,
                        }}
                        className="flex items-center justify-center"
                      >
                        {getOS(session.os) === Device.Desktop ? (
                          <HiOutlineDesktopComputer
                            size={20}
                            className="flex items-center justify-center"
                          />
                        ) : getOS(session.os) === Device.Mobile ? (
                          <HiOutlineDeviceMobile
                            size={20}
                            className="flex items-center justify-center"
                          />
                        ) : session.oauth !== null ? (
                          <HiLink
                            size={20}
                            className="flex items-center justify-center"
                          />
                        ) : (
                          <HiQuestionMarkCircle
                            size={20}
                            className="flex items-center justify-center"
                          />
                        )}
                      </Badge>
                      <div
                        className={clsx(
                          "flex flex-col md:ml-4 mt-4 md:mt-0",
                          "max-w-[280px] md:max-w-[300px] lg:max-w-[400px]"
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Text size="lg" weight={600}>
                            {session.impersonation
                              ? "Admin session"
                              : session.oauth
                              ? session.oauth.name
                              : getOperatingSystemString(
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
                            Your account is being accessed by a staff member
                            using this session.
                          </Text>
                        )}
                        {session.oauth && (
                          <Text mt="md" color="dimmed" size="sm">
                            This session is being used by an OAuth application,{" "}
                            {session.oauth.name}. If you don&apos;t recognize
                            this application, you should revoke access to it.
                          </Text>
                        )}
                      </div>
                    </div>
                    <Tooltip
                      label={
                        session.oauth
                          ? "Revoke access to this application"
                          : "Log out of this session"
                      }
                    >
                      <CloseButton
                        onClick={async () =>
                          await logout(session.token, true).then(() => {
                            fetchSessions();
                          })
                        }
                        disabled={
                          getCookie(".frameworksession") == session.token
                        }
                      />
                    </Tooltip>
                  </div>
                ))
            ) : (
              <ShadedCard className="flex items-center justify-center">
                <ModernEmptyState
                  title="No sessions found"
                  body="No sessions found with the selected filter."
                />
              </ShadedCard>
            )}
          </>
        )}
      </Stack>
    </SettingsTab>
  );
};

export default SessionsTab;
