import InventTab from "@/components/invent/invent";
import ModernEmptyState from "@/components/modern-empty-state";
import shutdownNucleus from "@/util/fetch/shutdownNucleus";
import { Fw } from "@/util/fw";
import getMediaUrl from "@/util/get-media";
import { User } from "@/util/prisma-types";
import {
  ActionIcon,
  Avatar,
  Button,
  Group,
  Menu,
  Stack,
  Text,
  Title,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { openConfirmModal, openModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { getCookie } from "cookies-next";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  HiBookOpen,
  HiCheckCircle,
  HiDotsVertical,
  HiExclamation,
  HiExclamationCircle,
  HiExternalLink,
  HiInformationCircle,
  HiOutlineChartBar,
  HiOutlineThumbDown,
  HiOutlineThumbUp,
  HiPencil,
  HiPlus,
  HiServer,
  HiTrash,
  HiUsers,
  HiXCircle,
} from "react-icons/hi";
import DataGrid from "../data-grid";
import ShadedButton from "../shaded-button";

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
      tabSubtitle="Manage your games on Framework"
      actions={
        <>
          <Button
            leftIcon={<HiPlus />}
            variant="default"
            onClick={() => router.push("/game/create")}
            disabled={!user.emailVerified}
          >
            Create a Game
          </Button>
          {!user.emailVerified && (
            <Text size="sm" color="dimmed">
              Your email must be verified to create games on Framework.
            </Text>
          )}
        </>
      }
    >
      <Title order={4} mb={10}>
        Your games
      </Title>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {user.games.length == 0 && (
          <div className="col-span-1 flex items-center justify-center">
            <ModernEmptyState
              title="No games"
              body="You don't have any games on your account."
            />
          </div>
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
            <ShadedButton
              onClick={() => router.push(`/game/${game.id}`)}
              key={game.id}
            >
              <div className="h-full w-full">
                <div className="flex justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <Avatar
                      color={Fw.Strings.color(game.name)}
                      src={getMediaUrl(game.iconUri)}
                      size={64}
                    >
                      {Fw.Strings.initials(game.name)}
                    </Avatar>
                    <div className="flex flex-col">
                      <Text weight={500} size="xl">
                        {game.name}
                      </Text>
                      <Text size="sm" color="dimmed">
                        @{game.team ? game.team.name : user.username}
                      </Text>
                    </div>
                  </div>
                  <ActionIcon
                    color={
                      warnings.length <= 1
                        ? "green"
                        : warnings.length == 2
                        ? "yellow"
                        : "red"
                    }
                    variant="light"
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation();
                      openModal({
                        title: "Health",
                        children: (
                          <>
                            <Stack spacing={8}>
                              {warnings.map((warning) => (
                                <div className="flex gap-4" key={warning.title}>
                                  <div>
                                    {warning.severity == "low" ? (
                                      <HiInformationCircle
                                        color={theme.colors.gray[5]}
                                        size={24}
                                      />
                                    ) : warning.severity == "medium" ? (
                                      <HiExclamation
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
                                    <Text color="dimmed" size="sm">
                                      {warning.description}
                                    </Text>
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
                          </>
                        ),
                      });
                    }}
                  >
                    {warnings.length <= 1 ? (
                      <HiCheckCircle />
                    ) : (
                      warnings.length >= 2 && <HiExclamationCircle />
                    )}
                  </ActionIcon>
                </div>
                <DataGrid
                  className="my-4"
                  mdCols={3}
                  smCols={2}
                  defaultCols={2}
                  items={[
                    {
                      tooltip: "Likes",
                      value: Fw.Nums.beautify(game.likedBy.length),
                      icon: <HiOutlineThumbUp />,
                    },
                    {
                      tooltip: "Dislikes",
                      value: Fw.Nums.beautify(game.dislikedBy.length),
                      icon: <HiOutlineThumbDown />,
                    },
                    {
                      tooltip: "Visits",
                      value: Fw.Nums.beautify(game.visits),
                      icon: <HiOutlineChartBar />,
                    },
                  ]}
                />
                <div className="flex justify-end">
                  <Group spacing={6}>
                    <Link passHref href={`/game/${game.id}`}>
                      <Button
                        size="sm"
                        variant="light"
                        leftIcon={<HiExternalLink />}
                        radius="xl"
                      >
                        View
                      </Button>
                    </Link>
                    <Menu shadow="md" withArrow>
                      <Menu.Target>
                        <ActionIcon
                          variant="light"
                          size="lg"
                          radius="xl"
                          onClick={(
                            e: React.MouseEvent<HTMLButtonElement, MouseEvent>
                          ) => {
                            e.stopPropagation();
                          }}
                        >
                          <HiDotsVertical />
                        </ActionIcon>
                      </Menu.Target>

                      <Menu.Dropdown
                        onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                          e.stopPropagation();
                        }}
                      >
                        <Menu.Item
                          icon={<HiPencil />}
                          onClick={() =>
                            router.push(`/game/${game.id}/edit/details`)
                          }
                        >
                          Edit
                        </Menu.Item>
                        <Menu.Item
                          icon={<HiBookOpen />}
                          onClick={() =>
                            router.push(`/game/${game.id}/legality`)
                          }
                        >
                          Legality questionnaire
                        </Menu.Item>
                        <Menu.Item
                          icon={<HiServer />}
                          onClick={() =>
                            router.push(
                              "/developer/servers/?" +
                                new URLSearchParams({
                                  page: "CreateServer",
                                }).toString()
                            )
                          }
                          disabled={game.connection.length > 0}
                        >
                          Add connection
                        </Menu.Item>
                        {!game.teamId && (
                          <Menu.Item
                            icon={<HiUsers />}
                            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600"
                            onClick={() =>
                              router.push(`/game/${game.id}/team/transfer`)
                            }
                          >
                            Add to team
                          </Menu.Item>
                        )}
                        <Menu.Divider />
                        <Menu.Item
                          color="red"
                          icon={<HiXCircle />}
                          onClick={async () => {
                            await shutdownNucleus(game.id);
                          }}
                        >
                          Shutdown all servers
                        </Menu.Item>
                        {game.teamId && (
                          <Menu.Item
                            color="red"
                            icon={<HiXCircle />}
                            onClick={() => {
                              openConfirmModal({
                                title: "Remove from team",
                                children: (
                                  <Text size="sm" color="dimmed">
                                    Are you sure you want to remove this game
                                    from your team, {game.team!.name}? This
                                    action cannot be undone.
                                  </Text>
                                ),
                                labels: {
                                  confirm: "Remove",
                                  cancel: "Cancel",
                                },
                                confirmProps: { color: "red" },
                                onConfirm: async () => {
                                  await fetch(
                                    `/api/teams/${game.team!.id}/transfer/${
                                      game.id
                                    }`,
                                    {
                                      method: "POST",
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
                                        router
                                          .replace(router.asPath)
                                          .then(() => {
                                            showNotification({
                                              title: "Success",
                                              message:
                                                "Game has been removed from team.",
                                              icon: <HiCheckCircle />,
                                            });
                                          });
                                      }
                                    });
                                },
                              });
                            }}
                          >
                            Remove from team
                          </Menu.Item>
                        )}
                        <Menu.Item color="red" icon={<HiTrash />}>
                          Disable game
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Group>
                </div>
              </div>
            </ShadedButton>
          );
        })}
        {user.emailVerified && (
          <Link href="/game/create" passHref>
            <ShadedButton className="flex flex-col items-center justify-center text-center opacity-50 duration-75 transition-opacity hover:opacity-100">
              <Text className="text-center" size="xl" weight={500}>
                Create a new game
              </Text>
              <Text color="dimmed" className="text-center" size="sm">
                Get started with a new game and build your library for others to
                enjoy.
              </Text>
            </ShadedButton>
          </Link>
        )}
      </div>
    </InventTab>
  );
};

export default Games;
