import {
  ActionIcon,
  Avatar,
  Badge,
  Divider,
  Loader,
  Menu,
  NavLink,
  Select,
  Text,
  TextInput,
  Title,
  Tooltip,
  useMantineTheme
} from "@mantine/core";
import { openModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { Prism } from "@mantine/prism";
import { Connection } from "@prisma/client";
import Convert from "ansi-to-html";
import { getCookie } from "cookies-next";
import { AnimatePresence, motion } from "framer-motion";
import { GetServerSideProps } from "next";
import { FC, ReactNode, useEffect, useState } from "react";
import {
  HiArrowLeft,
  HiArrowRight,
  HiBeaker,
  HiChartBar,
  HiChip,
  HiClipboard,
  HiCloud,
  HiCode,
  HiCubeTransparent,
  HiDotsVertical,
  HiExclamationCircle,
  HiFolder,
  HiRefresh,
  HiSearch,
  HiServer,
  HiSortAscending,
  HiStop,
  HiWifi,
  HiXCircle
} from "react-icons/hi";
import ConsoleOutput from "../../components/Developer/ConsoleOutput";
import { Section } from "../../components/Home/FriendsWidget";
import ModernEmptyState from "../../components/ModernEmptyState";
import ShadedButton from "../../components/ShadedButton";
import ShadedCard from "../../components/ShadedCard";
import Developer from "../../layouts/DeveloperLayout";
import SidebarTabNavigation from "../../layouts/SidebarTabNavigation";
import authorizedRoute from "../../util/auth";
import clsx from "../../util/clsx";
import shutdownNucleus from "../../util/fetch/shutdownNucleus";
import getMediaUrl from "../../util/get-media";
import { Game, User } from "../../util/prisma-types";

type ServersProps = {
  user: User;
};
type ConnectionWithGame = Connection & { game: Game };
type SidebarItem = {
  title: string;
  description: string;
  icon: ReactNode;
  value: SidebarValue;
};
enum SidebarValue {
  Servers,
  ErrorLog,
  PerformanceStatistics,
  CI,
}
type ServerSort = "ip" | "port";
type ServerFilter = "online" | "offline" | "all";

const sidebar: SidebarItem[] = [
  {
    title: "Servers",
    description: "Manage your dedicated & self hosted Cosmic servers",
    icon: <HiServer />,
    value: SidebarValue.Servers,
  },
  {
    title: "Error log",
    description: "Get an oversight of your servers' logs",
    icon: <HiExclamationCircle />,
    value: SidebarValue.ErrorLog,
  },
  {
    title: "Performance statistics",
    description: "See how your servers are performing",
    icon: <HiChartBar />,
    value: SidebarValue.PerformanceStatistics,
  },
  {
    title: "Continuous integration",
    description: "Manage CI/CD workflows to automate development",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-4 h-4"
      >
        <path
          fillRule="evenodd"
          d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 01.75.75c0 5.056-2.383 9.555-6.084 12.436A6.75 6.75 0 019.75 22.5a.75.75 0 01-.75-.75v-4.131A15.838 15.838 0 016.382 15H2.25a.75.75 0 01-.75-.75 6.75 6.75 0 017.815-6.666zM15 6.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z"
          clipRule="evenodd"
        />
        <path d="M5.26 17.242a.75.75 0 10-.897-1.203 5.243 5.243 0 00-2.05 5.022.75.75 0 00.625.627 5.243 5.243 0 005.022-2.051.75.75 0 10-1.202-.897 3.744 3.744 0 01-3.008 1.51c0-1.23.592-2.323 1.51-3.008z" />
      </svg>
    ),
    value: SidebarValue.CI,
  },
];

const Servers: FC<ServersProps> = ({ user }) => {
  const [servers, setServers] = useState<ConnectionWithGame[]>();
  const [activeTab, setActiveTab] = useState<SidebarValue>(
    SidebarValue.Servers
  );
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [serverSort, setServerSort] = useState<ServerSort>("ip");
  const [serverFilter, setServerFilter] = useState<ServerFilter>("all");
  const [selectedServer, setSelectedServer] = useState<ConnectionWithGame>();
  const [shouldAnimateMainServerPanel, setShouldAnimateMainServerPanel] =
    useState(false);
  const [stdout, setStdout] = useState<string[]>([]);
  const theme = useMantineTheme();

  const filterFn = (s: ConnectionWithGame) => {
    if (serverFilter === "all") return true;
    return s.online === (serverFilter === "online" ? true : false);
  };

  const sortFn = (a: ConnectionWithGame, b: ConnectionWithGame) => {
    if (serverSort === "ip") {
      return a.ip.localeCompare(b.ip);
    } else if (serverSort === "port") {
      return a.port > b.port ? 1 : 0;
    }
    return 0;
  };

  const searchFn = (s: ConnectionWithGame) => {
    return s.ip.toLowerCase().includes(search.toLowerCase());
  };

  const getServers = async () => {
    setLoading(true);
    await fetch("/api/cosmic/my/servers", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setServers(res as ConnectionWithGame[]);
        setLoading(false);
      });
  };

  const pollStdout = async () => {
    await fetch(`/api/cosmic/my/servers/${selectedServer?.id}/stdout`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setStdout((res as string[]).map((s) => new Convert().toHtml(s)));
      });
  };

  useEffect(() => {
    getServers();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedServer) {
        pollStdout();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedServer]);

  useEffect(() => {
    setStdout([]);
    if (selectedServer) {
      pollStdout();
    }
  }, [selectedServer]);

  return (
    <Developer
      user={user}
      title="Servers"
      description="Manage your self-hosted and dedicated Cosmic servers."
    >
      <SidebarTabNavigation>
        <SidebarTabNavigation.Sidebar>
          {sidebar.map((s) => (
            <NavLink
              icon={s.icon}
              label={s.title}
              description={s.description}
              active={activeTab === s.value}
              onClick={() => setActiveTab(s.value)}
              key={s.title}
              className="rounded-md"
            />
          ))}
        </SidebarTabNavigation.Sidebar>
        <SidebarTabNavigation.Content>
          {activeTab === SidebarValue.Servers && (
            <div>
              <AnimatePresence mode="wait" initial={false}>
                {selectedServer !== undefined ? (
                  <motion.div
                    key="server-details"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    }}
                  >
                    <AnimatePresence>
                      {selectedServer && (
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                            delay: 0.05,
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-start gap-5">
                              <div className="flex items-center md:gap-6 gap-2">
                                <ActionIcon
                                  onClick={() => {
                                    setSelectedServer(undefined);
                                    setShouldAnimateMainServerPanel(true);
                                  }}
                                  size="xl"
                                  className="rounded-full hover:border-zinc-500/50 transition-all"
                                  sx={{
                                    borderWidth: 1,
                                  }}
                                >
                                  <HiArrowLeft />
                                </ActionIcon>
                                <HiServer size={32} />
                              </div>
                              <div>
                                <Title order={3}>{selectedServer.ip}</Title>
                                <Text color="dimmed">
                                  {selectedServer.port}
                                </Text>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              {loading && <Loader size="sm" />}
                              <Badge
                                size="lg"
                                radius="md"
                                color={selectedServer.online ? "green" : "red"}
                              >
                                {selectedServer.online ? "Online" : "Offline"}
                              </Badge>
                              <Menu width={180}>
                                <Menu.Target>
                                  <ActionIcon>
                                    <HiDotsVertical />
                                  </ActionIcon>
                                </Menu.Target>
                                <Menu.Dropdown>
                                  <Menu.Label>Actions</Menu.Label>
                                  <Menu.Item
                                    icon={<HiBeaker />}
                                    disabled={!selectedServer.online}
                                    onClick={async () => {
                                      await fetch(
                                        `/api/nucleus/test/${selectedServer.gameId}`,
                                        {
                                          method: "GET",
                                          headers: {
                                            "Content-Type": "application/json",
                                            Authorization: String(
                                              getCookie(".frameworksession")
                                            ),
                                          },
                                        }
                                      )
                                        .then((res) => res.json())
                                        .then((res) => {
                                          if (res.success) {
                                            openModal({
                                              title: "Connection test",
                                              children: (
                                                <>
                                                  <Text
                                                    mb="md"
                                                    size="sm"
                                                    color="dimmed"
                                                  >
                                                    Connection to{" "}
                                                    {selectedServer.ip}:
                                                    {selectedServer.port} was
                                                    successful:
                                                  </Text>
                                                  <Prism language="json">
                                                    {JSON.stringify(
                                                      res.data,
                                                      null,
                                                      2
                                                    )}
                                                  </Prism>
                                                </>
                                              ),
                                            });
                                          } else {
                                            showNotification({
                                              title: "Connection Failed",
                                              message: `Connection to ${selectedServer.ip}:${selectedServer.port} failed.`,
                                              icon: <HiXCircle />,
                                            });
                                          }
                                        });
                                    }}
                                  >
                                    Test connection
                                  </Menu.Item>
                                  <Menu.Item icon={<HiClipboard />}>
                                    Copy ID
                                  </Menu.Item>
                                  <Menu.Item
                                    icon={<HiRefresh />}
                                    onClick={() => {
                                      getServers().then(() => {
                                        setSelectedServer(
                                          servers?.find(
                                            (s) => s.id === selectedServer.id
                                          )
                                        );
                                      });
                                    }}
                                  >
                                    Refresh
                                  </Menu.Item>
                                  <Menu.Divider />
                                  <Menu.Label>Danger zone</Menu.Label>
                                  <Menu.Item
                                    color="red"
                                    icon={<HiStop />}
                                    disabled={!selectedServer.online}
                                    onClick={async () =>
                                      await shutdownNucleus(
                                        selectedServer.gameId
                                      ).then(() => {
                                        setTimeout(() => {
                                          getServers().then(() => {
                                            setSelectedServer(
                                              servers?.find(
                                                (s) =>
                                                  s.id === selectedServer.id
                                              )
                                            );
                                          });
                                        }, 1500);
                                      })
                                    }
                                  >
                                    Stop server
                                  </Menu.Item>
                                </Menu.Dropdown>
                              </Menu>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <div
                      className={clsx(
                        "flex flex-col md:flex-row gap-4 md:gap-8 mt-6"
                      )}
                    >
                      <div className="flex flex-col w-full md:w-1/3 gap-2">
                        {[
                          {
                            tooltip: "IP address",
                            icon: HiServer,
                            value: selectedServer.ip,
                          },
                          {
                            tooltip: "Port",
                            icon: HiWifi,
                            value: selectedServer.port,
                          },
                          {
                            tooltip: "Game",
                            icon: HiCubeTransparent,
                            value: selectedServer.game.name,
                          },
                          {
                            tooltip: "Protocol version",
                            icon: HiCode,
                            value: selectedServer.protocol,
                          },
                          {
                            tooltip: "CPU cores",
                            icon: HiChip,
                            value: `${selectedServer.reportedCores} cores`,
                          },
                          {
                            tooltip: "Memory",
                            icon: HiChip,
                            value: `${selectedServer.reportedMemoryGb} GB`,
                          },
                          {
                            tooltip: "Disk",
                            icon: HiFolder,
                            value: `${selectedServer.reportedDiskGb} GB`,
                          },
                        ].map(({ tooltip, icon: Icon, value }) => (
                          <Tooltip label={`${tooltip}: ${value}`} key={tooltip}>
                            <div className="flex items-center gap-3">
                              <Icon
                                color={theme.colors.gray[5]}
                                className="flex-shrink-0"
                              />
                              <Text weight={500} color="dimmed" lineClamp={1}>
                                {value}
                              </Text>
                            </div>
                          </Tooltip>
                        ))}
                        <Divider mt="md" mb="md" />
                        <NavLink
                          icon={<HiArrowRight />}
                          label="Console"
                          description="Remotely administer your server."
                          className="rounded-md"
                        />
                        <NavLink
                          icon={<HiArrowRight />}
                          label="Scripts"
                          description="Hot deploy scripts to your server without restarting."
                          className="rounded-md"
                        />
                        <NavLink
                          icon={<HiArrowRight />}
                          label="Plugins"
                          description="Manage your server's plugins."
                          className="rounded-md"
                        />
                      </div>
                      <div className="flex flex-col w-full md:w-2/3 gap-2">
                        <ConsoleOutput stdout={stdout} />
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="server-list"
                    initial={{
                      opacity: 0,
                      x: shouldAnimateMainServerPanel ? 20 : 0,
                    }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{
                      opacity: 0,
                      x: shouldAnimateMainServerPanel ? 20 : 0,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    }}
                  >
                    <Section
                      title="Servers"
                      description="Manage your Cosmic servers."
                    />
                    {loading ? (
                      <ShadedCard className="w-full flex justify-center items-center py-12">
                        <Loader />
                      </ShadedCard>
                    ) : servers && servers.length > 0 ? (
                      <>
                        <div
                          className={clsx(
                            "flex-initial flex-col md:flex-row flex items-center gap-4",
                            "items-stretch md:items-center mb-8"
                          )}
                        >
                          <TextInput
                            icon={<HiSearch />}
                            placeholder="Search by IP address"
                            sx={{
                              flex: "0 0 45%",
                            }}
                            value={search}
                            onChange={(e) => {
                              setSearch(e.target.value);
                            }}
                          />
                          <Select
                            value={serverFilter}
                            onChange={(v) => {
                              setServerFilter(v as ServerFilter);
                            }}
                            data={
                              [
                                { value: "all", label: "All" },
                                { value: "offline", label: "Offline servers" },
                                { value: "online", label: "Online servers" },
                              ] as { value: ServerFilter; label: string }[]
                            }
                            placeholder="Filter by status"
                          />
                          <Select
                            icon={<HiSortAscending />}
                            value={serverSort}
                            onChange={(v) => {
                              setServerSort(v as ServerSort);
                            }}
                            data={[
                              { value: "ip", label: "IP address" },
                              { value: "port", label: "Port" },
                            ]}
                            placeholder="Sort by"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {servers
                            .filter(filterFn)
                            .sort(sortFn)
                            .filter(searchFn).length > 0 ? (
                            servers
                              .filter(filterFn)
                              .sort(sortFn)
                              .filter(searchFn)
                              .map((s) => (
                                <ShadedButton
                                  key={s.id}
                                  className="w-full flex flex-col gap-4"
                                  onClick={() => setSelectedServer(s)}
                                >
                                  <Badge
                                    radius="md"
                                    color={s.online ? "green" : "red"}
                                    className="cursor-pointer"
                                  >
                                    {s.online ? "Online" : "Offline"}
                                  </Badge>
                                  <Text
                                    size="lg"
                                    className="flex items-center gap-2"
                                  >
                                    {s.ip}{" "}
                                    <Text size="sm" color="dimmed">
                                      :{s.port}
                                    </Text>
                                  </Text>
                                  <div className="flex justify-between items-center w-full mt-4">
                                    <div className="flex items-center gap-3">
                                      <Avatar
                                        size={24}
                                        src={getMediaUrl(s.game.iconUri)}
                                        radius="sm"
                                      />
                                      <Text>{s.game.name}</Text>
                                    </div>
                                    <Tooltip label="Protocol version">
                                      <div className="flex items-center gap-2">
                                        <HiCloud className="text-gray-500" />
                                        <Text size="sm" color="dimmed">
                                          {s.protocol}
                                        </Text>
                                      </div>
                                    </Tooltip>
                                  </div>
                                </ShadedButton>
                              ))
                          ) : (
                            <ShadedCard className="w-full flex justify-center items-center col-span-full">
                              <ModernEmptyState
                                title="No servers"
                                body="No results for your provided filters. Try changing up your search."
                              />
                            </ShadedCard>
                          )}
                        </div>
                      </>
                    ) : (
                      <ShadedCard className="w-full flex justify-center items-center">
                        <ModernEmptyState
                          title="No servers"
                          body="You do not have any Cosmic servers yet."
                        />
                      </ShadedCard>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
          {activeTab === SidebarValue.ErrorLog && (
            <>
              <Section
                title="Error Log"
                description="Monitor the logs from your servers and catch errors when they happen."
              />
              <ShadedCard className="w-full flex justify-center items-center">
                <ModernEmptyState
                  title="Unavailable"
                  body="This feature is not available yet."
                />
              </ShadedCard>
            </>
          )}
          {activeTab === SidebarValue.PerformanceStatistics && (
            <>
              <Section
                title="Performance Statistics"
                description="Monitor the performance of your Cosmic servers to scale accordingly."
              />
              <ShadedCard className="w-full flex justify-center items-center">
                <ModernEmptyState
                  title="Unavailable"
                  body="This feature is not available yet."
                />
              </ShadedCard>
            </>
          )}
          {activeTab === SidebarValue.CI && (
            <>
              <Section
                title="Continuous Integration and Delivery"
                description="Manage your CI/CD workflows to automate your development experience."
              />
              <ShadedCard className="w-full flex justify-center items-center mb-8">
                <ModernEmptyState
                  title="Unavailable"
                  body="This feature is not available yet."
                />
              </ShadedCard>
              <Section
                title="Workflows"
                description="Add new workflow triggers."
              />
              <ShadedCard className="w-full flex justify-center items-center">
                <ModernEmptyState
                  title="Unavailable"
                  body="This feature is not available yet."
                />
              </ShadedCard>
            </>
          )}
        </SidebarTabNavigation.Content>
      </SidebarTabNavigation>
    </Developer>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return await authorizedRoute(ctx, true, false);
};

export default Servers;
