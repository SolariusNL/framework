import {
  ActionIcon,
  Avatar,
  Badge,
  Loader,
  NavLink,
  Select,
  Text,
  TextInput,
  Title,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { Connection } from "@prisma/client";
import Convert from "ansi-to-html";
import { getCookie } from "cookies-next";
import { AnimatePresence, motion } from "framer-motion";
import { GetServerSideProps } from "next";
import { FC, ReactNode, useEffect, useState } from "react";
import {
  HiArrowLeft,
  HiChartBar,
  HiCloud,
  HiCode,
  HiCubeTransparent,
  HiExclamationCircle,
  HiSearch,
  HiServer,
  HiSortAscending,
  HiWifi,
} from "react-icons/hi";
import { Section } from "../../components/Home/FriendsWidget";
import ModernEmptyState from "../../components/ModernEmptyState";
import ShadedButton from "../../components/ShadedButton";
import ShadedCard from "../../components/ShadedCard";
import Developer from "../../layouts/DeveloperLayout";
import SidebarTabNavigation from "../../layouts/SidebarTabNavigation";
import authorizedRoute from "../../util/auth";
import clsx from "../../util/clsx";
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
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-4">
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
                        <div>
                          <Title order={3}>{selectedServer.ip}</Title>
                          <Text color="dimmed">{selectedServer.port}</Text>
                        </div>
                      </div>
                    </div>
                    <div
                      className={clsx(
                        "flex flex-col md:flex-row gap-4 md:gap-8 mt-4"
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
                            value: "r1001",
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
                      </div>
                      <div className="flex flex-col w-full md:w-2/3 gap-2">
                        <ShadedCard>
                          <Text color="dimmed" weight={500}>
                            Console output
                          </Text>
                          <div
                            className="mt-4 bg-black p-4 rounded-md"
                            style={{
                              height: 300,
                              flexDirection: "column-reverse",
                              overflowX: "hidden",
                              overflowY: "auto",
                              display: "flex",
                            }}
                          >
                            <div className="flex gap-2 flex-col-reverse">
                              {stdout.map((s, i) => (
                                <div
                                  key={i}
                                  className="text-sm"
                                  dangerouslySetInnerHTML={{ __html: s }}
                                />
                              ))}
                            </div>
                          </div>
                        </ShadedCard>
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
                                          r1001
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
        </SidebarTabNavigation.Content>
      </SidebarTabNavigation>
    </Developer>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return await authorizedRoute(ctx, true, false);
};

export default Servers;
