import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Image,
  Menu,
  Paper,
  Popover,
  ScrollArea,
  Spoiler,
  Stack,
  Text,
  Title,
  Tooltip,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  HiChartBar,
  HiCheckCircle,
  HiDotsVertical,
  HiExclamationCircle,
  HiExternalLink,
  HiPencil,
  HiPlus,
  HiServer,
  HiThumbDown,
  HiThumbUp,
  HiTrash,
  HiUsers,
  HiXCircle,
} from "react-icons/hi";
import abbreviateNumber from "../../util/abbreviate";
import getMediaUrl from "../../util/getMedia";
import { User } from "../../util/prisma-types";
import Copy from "../Copy";
import ModernEmptyState from "../ModernEmptyState";
import InventTab from "./InventTab";

interface GamesProps {
  user: User;
}

const Games = ({ user }: GamesProps) => {
  const router = useRouter();
  const { colorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();

  return (
    <InventTab
      tabValue="games"
      tabTitle="Games"
      actions={
        <>
          <Button
            leftIcon={<HiPlus />}
            variant="default"
            onClick={() => router.push("/game/create")}
          >
            Create a Game
          </Button>
        </>
      }
    >
      <Title order={4} mb={10}>
        Your games
      </Title>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {user.games.length == 0 && (
          <ModernEmptyState
            title="No games"
            body="You don't have any games on your account."
          />
        )}
        {user.games.map((game) => {
          const warnings: Array<{
            title: string;
            description: string;
            severity: "low" | "medium" | "high";
          }> = [];

          const checks = [
            {
              title: "Game has an icon",
              description:
                "Your game should have an icon to help users identify it and increase result optimization.",
              severity: "low",
              check: game.iconUri != null,
            },
            {
              title: "Game has a description",
              description:
                "Your game should have a description exceeding 20 characters to help users easily interpret your game and if it's what they're looking for.",
              severity: "medium",
              check: game.description != null && game.description.length >= 20,
            },
            {
              title: "Game has at-least one thumbnail",
              description:
                "Your game should have at least one thumbnail image to increase attraction to your game.",
              severity: "medium",
              check: game.gallery.length > 0,
            },
            {
              title: "Game should be playable",
              description:
                "Your game must have a server set up to allow connections to your game.",
              severity: "high",
              check: game.connection.length > 0,
            },
          ];

          checks.forEach((check) => {
            if (!check.check) {
              warnings.push(
                check as {
                  title: string;
                  description: string;
                  severity: "low" | "medium" | "high";
                }
              );
            }
          });

          return (
            <Paper
              withBorder
              shadow="md"
              p="md"
              key={game.id}
              sx={{
                flex: 1,
                backgroundColor:
                  colorScheme == "dark" ? theme.colors.dark[8] : "#fff",
                height: "auto",
              }}
            >
              <div className="h-full">
                <Text weight={500} size="xl" mb={16}>
                  {game.name}
                </Text>
                <div className="flex justify-between mb-6">
                  <Group>
                    <Image
                      src={getMediaUrl(game.iconUri)}
                      width={48}
                      height={48}
                      withPlaceholder
                    />
                    <Stack spacing={5}>
                      <Group>
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 12,
                          }}
                        >
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                            }}
                          >
                            <Badge color="teal" variant="dot" size="sm">
                              Active
                            </Badge>
                          </div>
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                            }}
                          >
                            <Text color="dimmed" size="sm">
                              id: <strong>{game.id}</strong>
                            </Text>
                            <Copy value={game.id} />
                          </div>
                        </div>
                      </Group>
                      <div style={{ display: "flex", gap: 12 }}>
                        {[
                          {
                            property: game.likedBy.length,
                            icon: HiThumbUp,
                            tooltip: "Likes",
                          },
                          {
                            property: game.dislikedBy.length,
                            icon: HiThumbDown,
                            tooltip: "Dislikes",
                          },
                          {
                            property: game.visits,
                            icon: HiUsers,
                            tooltip: "Visits",
                          },
                        ].map((stat) => (
                          <Tooltip label={stat.tooltip} key={stat.tooltip}>
                            <div
                              style={{
                                display: "flex",
                                gap: 6,
                                alignItems: "center",
                              }}
                            >
                              <stat.icon
                                size={14}
                                color={
                                  colorScheme === "dark" ? "#909296" : "#868e96"
                                }
                              />
                              <Text size="sm" color="dimmed">
                                {String(abbreviateNumber(stat.property))}
                              </Text>
                            </div>
                          </Tooltip>
                        ))}
                      </div>
                    </Stack>
                  </Group>
                  <div>
                    <Popover width={300} zIndex={1200} shadow="md">
                      <Popover.Target>
                        <ActionIcon
                          color={
                            warnings.length <= 1
                              ? "green"
                              : warnings.length == 2
                              ? "yellow"
                              : "red"
                          }
                          variant="light"
                        >
                          {warnings.length <= 1 ? (
                            <HiCheckCircle />
                          ) : (
                            warnings.length >= 2 && <HiExclamationCircle />
                          )}
                        </ActionIcon>
                      </Popover.Target>

                      <Popover.Dropdown>
                        <Text color="dimmed" weight={600} mb={12}>
                          Game Health
                        </Text>
                        <Paper
                          sx={{
                            backgroundColor:
                              colorScheme === "dark"
                                ? theme.colors.dark[8]
                                : "#fff",
                          }}
                          p="md"
                          withBorder
                        >
                          <ScrollArea offsetScrollbars>
                            <Stack
                              spacing={8}
                              sx={{
                                maxHeight: "calc(60vh - 240px)",
                              }}
                            >
                              {warnings.map((warning) => (
                                <div className="flex gap-4" key={warning.title}>
                                  <div>
                                    {warning.severity == "low" ? (
                                      <HiExclamationCircle
                                        color={theme.colors.gray[5]}
                                        size={24}
                                      />
                                    ) : warning.severity == "medium" ? (
                                      <HiExclamationCircle
                                        color={theme.colors.yellow[5]}
                                        size={24}
                                      />
                                    ) : (
                                      <HiExclamationCircle
                                        color={theme.colors.red[5]}
                                        size={24}
                                      />
                                    )}
                                  </div>
                                  <div>
                                    <Text weight={600}>{warning.title}</Text>
                                    <Spoiler
                                      maxHeight={20}
                                      showLabel="See more"
                                      hideLabel="See less"
                                      sx={{
                                        fontSize: 14,
                                      }}
                                    >
                                      <Text color="dimmed" size="sm">
                                        {warning.description}
                                      </Text>
                                    </Spoiler>
                                  </div>
                                </div>
                              ))}
                              {warnings.length == 0 && (
                                <ModernEmptyState
                                  title="No issues found"
                                  body="Your game is in good shape!"
                                />
                              )}
                            </Stack>
                          </ScrollArea>
                        </Paper>
                      </Popover.Dropdown>
                    </Popover>
                  </div>
                </div>
                <div className="flex justify-between">
                  <Group spacing={6}>
                    <Link passHref href={`/game/${game.id}`}>
                      <Button
                        size="sm"
                        variant="default"
                        leftIcon={<HiExternalLink />}
                      >
                        View
                      </Button>
                    </Link>
                    <Menu shadow="md">
                      <Menu.Target>
                        <ActionIcon variant="default" size="lg">
                          <HiDotsVertical />
                        </ActionIcon>
                      </Menu.Target>

                      <Menu.Dropdown>
                        <Menu.Item
                          icon={<HiPencil />}
                          onClick={() => router.push(`/game/${game.id}/edit`)}
                        >
                          Edit
                        </Menu.Item>
                        <Menu.Item
                          icon={<HiServer />}
                          onClick={() =>
                            router.push(`/game/${game.id}/connection/add`)
                          }
                        >
                          Add Connection
                        </Menu.Item>
                        <Menu.Divider />
                        <Menu.Item color="red" icon={<HiXCircle />}>
                          Shutdown all connections
                        </Menu.Item>
                        <Menu.Item color="red" icon={<HiTrash />}>
                          Disable game
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Group>
                  <Button variant="default" leftIcon={<HiChartBar />}>
                    Analytics
                  </Button>
                </div>
              </div>
            </Paper>
          );
        })}
        <Link href="/game/create" passHref>
          <Paper
            withBorder
            radius="md"
            sx={{
              backgroundColor:
                colorScheme == "dark" ? theme.colors.dark[8] : "#fff",
            }}
            className="flex-1 opacity-50 cursor-pointer hover:opacity-100 transition-opacity duration-200 ease-in-out p-6 shadow-md py-12 h-fit"
          >
            <Text className="text-center" size="xl" weight={500}>
              Create a new game
            </Text>
            <Text color="dimmed" className="text-center" size="sm">
              Get started with a new game and build your library for others to
              enjoy.
            </Text>
          </Paper>
        </Link>
      </div>
    </InventTab>
  );
};

export default Games;
