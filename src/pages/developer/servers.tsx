import {
  ActionIcon,
  Anchor,
  Avatar,
  Badge,
  Button,
  Code,
  Divider,
  Loader,
  Menu,
  Modal,
  NavLink,
  NumberInput,
  Select,
  Text,
  TextInput,
  Title,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { openModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { Connection, CosmicCommand, NucleusKey } from "@prisma/client";
import Convert from "ansi-to-html";
import { getCookie } from "cookies-next";
import { AnimatePresence, motion } from "framer-motion";
import { GetServerSideProps } from "next";
import { FC, ReactNode, useEffect, useState } from "react";
import {
  HiArrowLeft,
  HiArrowUp,
  HiCheckCircle,
  HiChip,
  HiCloud,
  HiCode,
  HiCubeTransparent,
  HiDotsVertical,
  HiExclamationCircle,
  HiFolder,
  HiOutlineCode,
  HiPlus,
  HiQuestionMarkCircle,
  HiSearch,
  HiServer,
  HiSortAscending,
  HiUpload,
  HiWifi,
  HiXCircle,
} from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import ContextMenu from "../../components/ContextMenu";
import ConsoleOutput from "../../components/Developer/ConsoleOutput";
import ServerContextMenu from "../../components/Developer/ServerContextMenu";
import Dot from "../../components/Dot";
import FilterIndicator from "../../components/FilterIndicator";
import { Section } from "../../components/Home/FriendsWidget";
import ModernEmptyState from "../../components/ModernEmptyState";
import ShadedButton from "../../components/ShadedButton";
import ShadedCard from "../../components/ShadedCard";
import Rocket from "../../icons/Rocket";
import Developer from "../../layouts/DeveloperLayout";
import SidebarTabNavigation from "../../layouts/SidebarTabNavigation";
import {
  appendLines,
  setCanLoadMore,
  setPage,
  setStdout,
} from "../../reducers/stdout";
import { RootState } from "../../reducers/store";
import IResponseBase from "../../types/api/IResponseBase";
import authorizedRoute from "../../util/auth";
import clsx from "../../util/clsx";
import fetchJson from "../../util/fetch";
import getMediaUrl from "../../util/get-media";
import { Game, User } from "../../util/prisma-types";
import { BLACK } from "../teams/t/[slug]/issue/create";

type ServersProps = {
  user: User;
};
export type ConnectionWithGameAndKey = Connection & {
  game: Game;
  nucleusKey: NucleusKey;
  commands: CosmicCommand[];
};
type SidebarItem = {
  title: string;
  description: string;
  icon: ReactNode;
  value: SidebarValue;
};
enum SidebarValue {
  Servers,
  ErrorLog,
  CI,
  CreateServer,
}
type ServerSort = "ip" | "port";
type ServerFilter = "online" | "offline" | "all";
type ServerForm = {
  ip: string;
  port: number;
  gameId: number;
};

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
    title: "Continuous integration",
    description: "Manage CI/CD workflows to automate development",
    icon: <Rocket />,
    value: SidebarValue.CI,
  },
];

const Servers: FC<ServersProps> = ({ user }) => {
  const [servers, setServers] = useState<ConnectionWithGameAndKey[]>();
  const [activeTab, setActiveTab] = useState<SidebarValue>(
    SidebarValue.Servers
  );
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [serverSort, setServerSort] = useState<ServerSort>("ip");
  const [serverFilter, setServerFilter] = useState<ServerFilter>("all");
  const [selectedServer, setSelectedServer] =
    useState<ConnectionWithGameAndKey>();
  const [shouldAnimateMainServerPanel, setShouldAnimateMainServerPanel] =
    useState(false);
  const [games, setGames] = useState<
    Pick<Game, "id" | "name" | "connection">[]
  >([]);
  const [args, setArgs] = useState<string>("");
  const [createLoading, setCreateLoading] = useState(false);
  const [remoteRun, setRemoteRun] = useState(false);
  const [remoteRunTarget, setRemoteRunTarget] = useState<CosmicCommand>();
  const form = useForm<ServerForm>({
    initialValues: {
      ip: "",
      port: 5572,
      gameId: 0,
    },
    validate: {
      ip: (value) => {
        if (
          !value.match(
            /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
          )
        )
          return "Must be a valid IP address";
        return null;
      },
      port: (value) => {
        if (value < 0 || value > 65535) return "Must be a valid port";
        return null;
      },
      gameId: (value) => {
        if (value === 0) return "Must select a game";
        return null;
      },
    },
  });
  const theme = useMantineTheme();
  const stdout = useSelector((state: RootState) => state.stdout);
  const dispatch = useDispatch();

  const filterFn = (s: ConnectionWithGameAndKey) => {
    if (serverFilter === "all") return true;
    return s.online === (serverFilter === "online" ? true : false);
  };

  const sortFn = (a: ConnectionWithGameAndKey, b: ConnectionWithGameAndKey) => {
    if (serverSort === "ip") {
      return a.ip.localeCompare(b.ip);
    } else if (serverSort === "port") {
      return a.port > b.port ? 1 : 0;
    }
    return 0;
  };

  const searchFn = (s: ConnectionWithGameAndKey) => {
    const parts = search.split(" ");
    const filters: Record<string, string> = {};
    parts.forEach((part) => {
      const [key, value] = part.split(":");
      filters[key] = value;
    });

    return (
      s.ip.toLowerCase().includes(search.toLowerCase()) ||
      s.game.name.toLowerCase().includes(search.toLowerCase()) ||
      Number(filters.id) === s.gameId
    );
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
        setServers(res as ConnectionWithGameAndKey[]);
        setLoading(false);
      });
  };

  const pollStdout = async () => {
    await fetch(
      `/api/cosmic/my/servers/${selectedServer?.id}/stdout/${stdout.page}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: String(getCookie(".frameworksession")),
        },
      }
    )
      .then((res) => res.json())
      .then((res) => {
        if (res.length === 0) dispatch(setCanLoadMore(false));
        else {
          if (stdout.page === 1)
            dispatch(
              setStdout((res as string[]).map((s) => new Convert().toHtml(s)))
            );
          else
            dispatch(
              appendLines((res as string[]).map((s) => new Convert().toHtml(s)))
            );
        }
      });
  };

  const getGames = async () => {
    await fetchJson<
      IResponseBase<{ games: Pick<Game, "id" | "name" | "connection">[] }>
    >("/api/users/@me/games", {
      method: "GET",
      auth: true,
    }).then((res) => {
      setGames(res.data?.games!);
    });
  };

  useEffect(() => {
    getServers();
    getGames();

    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const page = urlParams.get("page");
      const search = urlParams.get("q");

      if (page) {
        const tab = SidebarValue[page as keyof typeof SidebarValue];
        if (tab) setActiveTab(tab);
      }

      if (search) setSearch(search);
    }
  }, []);

  useEffect(() => {
    if (!stdout.canLoadMore) return;
    const interval = setInterval(() => {
      if (selectedServer) {
        pollStdout();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedServer, stdout.page]);

  useEffect(() => {
    if (selectedServer) {
      pollStdout();
    } else {
      dispatch(setStdout([]));
      dispatch(setCanLoadMore(true));
      dispatch(setPage(1));
    }
  }, [selectedServer, stdout.page]);

  return (
    <Developer
      user={user}
      title="Servers"
      description="Manage your self-hosted and dedicated Cosmic servers."
    >
      <Modal
        title="Remotely run command"
        opened={remoteRun}
        onClose={() => setRemoteRun(false)}
        className={theme.colorScheme}
      >
        <Text size="sm" color="dimmed" mb="md">
          This will run the command{" "}
          <span className="font-mono font-semibold">
            {remoteRunTarget?.name}
          </span>{" "}
          on the server{" "}
          <span className="font-mono font-semibold">{selectedServer?.ip}</span>.
          Provide arguments in the input below or leave it empty to run the
          command without arguments.
        </Text>
        <TextInput
          label="Arguments"
          description="Arguments to pass to the command."
          placeholder="e.g. --help"
          value={args}
          onChange={(e) => setArgs(e.target.value)}
          classNames={{
            input: "dark:bg-black dark:text-white",
          }}
          icon={<HiCode />}
        />
        <div className="flex justify-end mt-4">
          <Button
            leftIcon={<HiUpload />}
            onClick={async () => {
              setRemoteRun(false);
              setArgs("");

              await fetchJson<IResponseBase>(
                `/api/nucleus/servers/${selectedServer?.id}/command/run`,
                {
                  method: "POST",
                  body: {
                    command: remoteRunTarget?.name,
                    args,
                  },
                  auth: true,
                }
              ).then((res) => {
                if (res.success) {
                  showNotification({
                    title: "Success",
                    message: `Command ${remoteRunTarget?.name} ran successfully. View the output in the console for more details.`,
                    icon: <HiCheckCircle />,
                  });
                }
              });
            }}
          >
            Run command
          </Button>
        </div>
      </Modal>
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
          {activeTab === SidebarValue.CreateServer ? (
            <>
              <Section
                title="Create a new server"
                description="Fill out the details below to create a new server."
              />
              <Text size="sm" color="dimmed" mb="lg">
                You will need a public IP address to provision a new server. If
                you don&apos; have one or cannot port-forward, you can use
                services like{" "}
                <Anchor
                  href="https://www.noip.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  No-IP
                </Anchor>{" "}
                or{" "}
                <Anchor
                  href="https://www.duckdns.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  DuckDNS
                </Anchor>{" "}
                to get a dynamic DNS address.
              </Text>
              <form
                onSubmit={form.onSubmit(async (values) => {
                  setCreateLoading(true);
                  await fetchJson<IResponseBase>(
                    `/api/games/${values.gameId}/connection/add`,
                    {
                      method: "POST",
                      body: {
                        ip: values.ip,
                        port: values.port,
                      },
                      auth: true,
                    }
                  )
                    .then((res) => {
                      if (res.success) {
                        getServers();
                        showNotification({
                          title: "Server created",
                          message: "Your server has been created successfully.",
                          icon: <HiCheckCircle />,
                        });
                        form.reset();
                        setActiveTab(SidebarValue.Servers);
                      } else {
                        showNotification({
                          title: "Error",
                          message:
                            res.message ||
                            "An error occurred while creating your server.",
                          icon: <HiXCircle />,
                        });
                      }
                    })
                    .finally(() => setCreateLoading(false));
                })}
              >
                <div className="grid md:grid-cols-2 gap-4 grid-cols-1">
                  <TextInput
                    label="IP address"
                    description="Enter the public IP address of the server."
                    placeholder="32.115.24.20"
                    required
                    classNames={BLACK}
                    icon={<HiServer />}
                    {...form.getInputProps("ip")}
                  />
                  <div className="flex flex-col">
                    <NumberInput
                      label="Port"
                      description="Enter the port of the server."
                      placeholder="5572"
                      required
                      classNames={BLACK}
                      icon={<HiArrowUp />}
                      {...form.getInputProps("port")}
                    />
                    <Select
                      label="Game"
                      description="Select a game to assign to the server."
                      required
                      classNames={BLACK}
                      icon={<Rocket />}
                      data={games
                        .filter((g) => g.connection.length === 0)
                        .map((g) => ({
                          label: g.name,
                          value: g.id,
                        }))}
                      className="mt-4"
                      placeholder="Select a game"
                      nothingFound="No games found"
                      {...form.getInputProps("gameId")}
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <Button
                    leftIcon={<Rocket />}
                    type="submit"
                    loading={createLoading}
                  >
                    Create server
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <>
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
                                    color={
                                      selectedServer.online ? "green" : "red"
                                    }
                                  >
                                    {selectedServer.online
                                      ? "Online"
                                      : "Offline"}
                                  </Badge>
                                  <Menu width={180}>
                                    <Menu.Target>
                                      <ActionIcon>
                                        <HiDotsVertical />
                                      </ActionIcon>
                                    </Menu.Target>
                                    <Menu.Dropdown>
                                      <ServerContextMenu
                                        server={selectedServer}
                                        onRefresh={() => {
                                          getServers().then(() => {
                                            setSelectedServer(
                                              servers?.find(
                                                (s) =>
                                                  s.id === selectedServer.id
                                              )
                                            );
                                          });
                                        }}
                                      />
                                    </Menu.Dropdown>
                                  </Menu>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        <div className="mt-6" />
                        <ConsoleOutput />
                        <Divider mt="xl" mb="xl" />
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 gap-y-6">
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
                            <Tooltip
                              label={`${tooltip}: ${value}`}
                              key={tooltip}
                            >
                              <div className="flex flex-col items-center justify-center gap-3">
                                <div className="flex items-center gap-2">
                                  <Icon
                                    color={theme.colors.gray[5]}
                                    className="flex-shrink-0 flex items-center"
                                  />
                                  <Text weight={500}>{tooltip}</Text>
                                </div>
                                <Text weight={500} color="dimmed" lineClamp={1}>
                                  {value}
                                </Text>
                              </div>
                            </Tooltip>
                          ))}
                        </div>
                        {selectedServer &&
                          selectedServer.commands.length > 0 && (
                            <>
                              <Divider mt="xl" mb="xl" />
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 gap-y-6">
                                {selectedServer.commands.map((c) => (
                                  <NavLink
                                    key={c.id}
                                    icon={<HiOutlineCode />}
                                    label={
                                      <span>
                                        Run
                                        <span className="font-mono ml-1 mr-1 font-semibold">
                                          {c.name}
                                        </span>
                                      </span>
                                    }
                                    description={c.description}
                                    className="rounded-md"
                                    onClick={() => {
                                      setRemoteRun(true);
                                      setRemoteRunTarget(c);
                                    }}
                                  />
                                ))}
                              </div>
                            </>
                          )}
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
                          right={
                            <Button
                              leftIcon={<HiPlus />}
                              onClick={() =>
                                setActiveTab(SidebarValue.CreateServer)
                              }
                            >
                              New server
                            </Button>
                          }
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
                                "items-stretch md:items-center"
                              )}
                            >
                              <TextInput
                                icon={<HiSearch />}
                                placeholder="Search servers"
                                sx={{
                                  flex: "0 0 45%",
                                }}
                                value={search}
                                onChange={(e) => {
                                  setSearch(e.target.value);
                                }}
                                rightSection={
                                  <ActionIcon
                                    className="rounded-full"
                                    onClick={() =>
                                      openModal({
                                        title: "Advanced server search",
                                        children: (
                                          <>
                                            <Text
                                              size="sm"
                                              color="dimmed"
                                              mb="xs"
                                            >
                                              Server search includes an advanced
                                              search system to help you find
                                              servers that match your criteria.
                                            </Text>
                                            <Text
                                              size="sm"
                                              color="dimmed"
                                              mb="xs"
                                            >
                                              If you&apos;re looking for servers
                                              for a specific game, you can
                                              search for it by name or ID. For
                                              example, if you want to find
                                              servers for My Game with ID 25,
                                              you can search for{" "}
                                              <Code>id:25</Code> or{" "}
                                              <Code>My Game</Code>.
                                            </Text>
                                            <div className="flex flex-col items-center justify-center mb-4 gap-2">
                                              <Code>id:25</Code>
                                              <Text
                                                size="sm"
                                                color="dimmed"
                                                weight={500}
                                              >
                                                Returns servers for game ID 25
                                              </Text>
                                            </div>
                                            <Text
                                              size="sm"
                                              color="dimmed"
                                              mb="xs"
                                            >
                                              Here is another example, where we
                                              look for servers under game ID 42
                                              with an IP that begin in 72.
                                            </Text>
                                            <div className="flex flex-col items-center justify-center mb-4 gap-2">
                                              <Code className="w-fit">
                                                72. id:42
                                              </Code>
                                              <Text
                                                size="sm"
                                                color="dimmed"
                                                weight={500}
                                              >
                                                Returns servers for game ID 25
                                                where IP begins with 72.
                                              </Text>
                                            </div>
                                          </>
                                        ),
                                      })
                                    }
                                  >
                                    <HiQuestionMarkCircle />
                                  </ActionIcon>
                                }
                              />
                              <Select
                                value={serverFilter}
                                onChange={(v) => {
                                  setServerFilter(v as ServerFilter);
                                }}
                                data={
                                  [
                                    { value: "all", label: "All" },
                                    {
                                      value: "offline",
                                      label: "Offline servers",
                                    },
                                    {
                                      value: "online",
                                      label: "Online servers",
                                    },
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
                            {search.includes("id:") && (
                              <FilterIndicator
                                text={`id: ${search.split("id:")[1]}`}
                                onClick={() =>
                                  setSearch(search.split("id:")[0])
                                }
                                className="mt-2"
                              />
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                              {servers
                                .filter(filterFn)
                                .sort(sortFn)
                                .filter(searchFn).length > 0 ? (
                                servers
                                  .filter(filterFn)
                                  .sort(sortFn)
                                  .filter(searchFn)
                                  .map((s) => (
                                    <ContextMenu
                                      dropdown={
                                        <ServerContextMenu
                                          server={s}
                                          onRefresh={() => {
                                            getServers();
                                          }}
                                        />
                                      }
                                      width={190}
                                      key={s.id}
                                    >
                                      <ShadedButton
                                        className="w-full flex flex-col gap-4"
                                        onClick={() => setSelectedServer(s)}
                                      >
                                        {!s.hasConnected && (
                                          <Tooltip label="Server has never connected to Nucleus">
                                            <Badge
                                              radius="md"
                                              color="orange"
                                              className="cursor-pointer"
                                            >
                                              Inactive
                                            </Badge>
                                          </Tooltip>
                                        )}
                                        <div className="flex items-center gap-3">
                                          <Tooltip
                                            label={
                                              s.online ? "Online" : "Offline"
                                            }
                                          >
                                            <div>
                                              <Dot
                                                color={
                                                  s.online ? "green" : "red"
                                                }
                                                classNames={{
                                                  dot: "w-2 h-2",
                                                  pulsar: "w-3 h-3",
                                                }}
                                                pulse
                                              />
                                            </div>
                                          </Tooltip>
                                          <Text
                                            size="lg"
                                            className="flex items-center gap-2"
                                          >
                                            {s.ip}{" "}
                                            <Text
                                              size="sm"
                                              color="dimmed"
                                              weight={700}
                                            >
                                              {s.port}
                                            </Text>
                                          </Text>
                                        </div>
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
                                    </ContextMenu>
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
