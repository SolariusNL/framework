import {
  ActionIcon,
  Alert,
  AspectRatio,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Grid,
  Group,
  Image,
  Loader,
  Progress,
  Skeleton,
  Stack,
  Tabs,
  Text,
  Title,
  Tooltip,
  UnstyledButton,
} from "@mantine/core";
import { GetServerSidePropsContext, NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  HiChat,
  HiCurrencyDollar,
  HiDotsVertical,
  HiFolder,
  HiInformationCircle,
  HiLibrary,
  HiLockClosed,
  HiPlay,
  HiServer,
  HiThumbDown,
  HiThumbUp,
  HiViewList,
  HiXCircle,
} from "react-icons/hi";
import ReactNoSSR from "react-no-ssr";
import Framework from "../../../components/Framework";
import GameComments from "../../../components/GameComments";
import GameRating from "../../../components/GameRating";
import ThumbnailCarousel from "../../../components/ImageCarousel";
import Launching from "../../../components/Launching";
import PlaceholderGameResource from "../../../components/PlaceholderGameResource";
import UserContext from "../../../components/UserContext";
import ConnectionTab from "../../../components/ViewGame/Connection";
import FundsTab from "../../../components/ViewGame/Funds";
import InfoTab from "../../../components/ViewGame/Info";
import ServersTab from "../../../components/ViewGame/Servers";
import UpdateLogTab from "../../../components/ViewGame/UpdateLog";
import authorizedRoute from "../../../util/authorizedRoute";
import { getCookie } from "../../../util/cookies";
import prisma from "../../../util/prisma";
import { Game, gameSelect, User } from "../../../util/prisma-types";
import { getRatingTypeDescription } from "../../../util/universe/ratings";
import useMediaQuery from "../../../util/useMediaQuery";

interface GameViewProps {
  gameData: Game;
  user: User;
}

const Game: NextPage<GameViewProps> = ({ gameData, user }) => {
  const mobile = useMediaQuery("768");
  const router = useRouter();
  const [game, setGame] = useState(gameData);

  const totalFeedback = game.likedBy.length + game.dislikedBy.length;
  const positive = (game.likedBy.length / totalFeedback) * 100;
  const negative = (game.dislikedBy.length / totalFeedback) * 100;

  const [launchingOpen, setLaunchingOpen] = useState(false);
  const [similarGames, setSimilarGames] = useState<Game[] | null>(null);

  const getSimilarGames = async () => {
    await fetch(`/api/games/by/genre/${game.genre}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setSimilarGames(res);
      });
  };

  useEffect(() => {
    getSimilarGames();
  }, []);

  return (
    <Framework user={user} activeTab="none">
      <Launching opened={launchingOpen} setOpened={setLaunchingOpen} />

      {game.author.id == user.id && game.connection.length == 0 && (
        <Alert
          title="No servers"
          color="red"
          mb={16}
          icon={<HiServer size="28" />}
        >
          This game has no servers, meaning it cannot be played. You must add a
          server to play this game.
        </Alert>
      )}
      <Grid columns={24}>
        <Grid.Col span={mobile ? 24 : 16}>
          <Title mb={16}>{game.name}</Title>

          <ThumbnailCarousel
            slides={
              game.gallery.length > 0
                ? game.gallery.map((image, i) => (
                    <AspectRatio ratio={16 / 9} key={i}>
                      <Image src={image} key={i} alt={game.name} />
                    </AspectRatio>
                  ))
                : Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <AspectRatio ratio={16 / 9} key={i}>
                        <PlaceholderGameResource key={i} />
                      </AspectRatio>
                    ))
            }
          />

          <Divider mt={28} mb={28} />

          <Tabs variant="pills" defaultValue="info" mb={30}>
            <Tabs.List grow>
              <div
                style={{
                  ...(mobile
                    ? {
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                      }
                    : {
                        display: "flex",
                        flexDirection: "row",
                        flex: 1,
                      }),
                }}
              >
                <Tabs.Tab icon={<HiInformationCircle />} value="info">
                  Information
                </Tabs.Tab>

                <Tabs.Tab icon={<HiServer />} value="connection">
                  Connection Details
                </Tabs.Tab>

                <Tabs.Tab icon={<HiViewList />} value="servers">
                  Servers
                </Tabs.Tab>

                <Tabs.Tab icon={<HiCurrencyDollar />} value="funds">
                  Funds
                </Tabs.Tab>

                <Tabs.Tab icon={<HiFolder />} value="updatelog">
                  Update Log
                </Tabs.Tab>
              </div>
            </Tabs.List>

            {[InfoTab, ConnectionTab, ServersTab, FundsTab, UpdateLogTab].map(
              (Tab, i) => (
                <ReactNoSSR
                  key={i}
                  onSSR={
                    i == 0 ? (
                      <Box
                        sx={{
                          alignItems: "center",
                          display: "flex",
                          justifyContent: "center",
                          width: "100%",
                        }}
                      >
                        <Loader />
                      </Box>
                    ) : undefined
                  }
                >
                  <Tab game={game} key={i} />
                </ReactNoSSR>
              )
            )}
          </Tabs>

          <ReactNoSSR
            onSSR={
              <Stack spacing={12}>
                <Skeleton height={160} />
                {Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} height={100} />
                  ))}
              </Stack>
            }
          >
            <GameComments user={user} game={game} />
          </ReactNoSSR>
        </Grid.Col>
        <Grid.Col span={mobile ? 24 : 8} p={10}>
          <Group position="apart" pl={0} pr={0} p={10} mb="lg">
            <Group
              onClick={() => {
                router.push(`/profile/${game.author.username}`);
              }}
              sx={{
                cursor: "pointer",
              }}
            >
              <UserContext user={game.author}>
                <Avatar
                  src={
                    game.author.avatarUri ||
                    `https://avatars.dicebear.com/api/identicon/${game.authorId}.png`
                  }
                  alt={game.author.username}
                  radius="xl"
                  size={20}
                  onClick={() =>
                    router.push(`/profile/${game.author.username}`)
                  }
                />
              </UserContext>
              <Text weight={700}>{game.author.username}</Text>
            </Group>

            <Group>
              <Text color="dimmed">@{game.author.username}</Text>
              {game.author.id == user.id && (
                <Tooltip label="Edit game">
                  <ActionIcon
                    onClick={() => router.push(`/game/${game.id}/edit`)}
                    color="dark"
                  >
                    <HiDotsVertical />
                  </ActionIcon>
                </Tooltip>
              )}
            </Group>
          </Group>

          <Button
            color="green"
            leftIcon={<HiPlay />}
            fullWidth
            size="xl"
            mb="xs"
            disabled={game.connection.length == 0}
            onClick={() => {
              setLaunchingOpen(true);
            }}
          >
            Play
          </Button>

          <Button
            leftIcon={<HiLockClosed />}
            fullWidth
            size="lg"
            mb="md"
            disabled={game.connection.length == 0}
            onClick={() => {
              setLaunchingOpen(true);
            }}
          >
            Play in Private Server
          </Button>

          <Group position="apart" mb={6}>
            <Group spacing={4}>
              <HiThumbUp size={16} />
              <Text>{game.likedBy.length}</Text>
            </Group>
            <Group spacing={4}>
              <Text>{game.dislikedBy.length}</Text>
              <HiThumbDown size={16} />
            </Group>
          </Group>
          <Progress
            sections={[
              {
                value: positive,
                color: "green",
              },
              {
                value: negative,
                color: "red",
              },
            ]}
            mb="sm"
          />
          <Group grow mb={32}>
            <Button
              color="green"
              leftIcon={<HiThumbUp />}
              size="sm"
              disabled={
                game.dislikedBy.find((u) => u.id == user.id) ? true : false
              }
              onClick={() => {
                setGame({
                  ...game,
                  likedBy: game.likedBy.find((u) => u.id == user.id)
                    ? game.likedBy.filter((u) => u.id != user.id)
                    : [...game.likedBy, user],
                });

                fetch(`/api/games/${game.id}/like`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: String(getCookie(".frameworksession")),
                  },
                })
                  .then((res) => res.json())
                  .then((res) => {
                    if (!res.success) {
                      setGame(gameData);
                    }
                  })
                  .catch((err) => {
                    setGame(gameData);
                  });
              }}
            >
              Like{game.likedBy.find((u) => u.id == user.id) ? "d" : ""}
            </Button>
            <Button
              color="red"
              leftIcon={<HiThumbDown />}
              size="sm"
              disabled={
                game.likedBy.find((u) => u.id == user.id) ? true : false
              }
              onClick={() => {
                setGame({
                  ...game,
                  dislikedBy: game.dislikedBy.find((u) => u.id == user.id)
                    ? game.dislikedBy.filter((u) => u.id != user.id)
                    : [...game.dislikedBy, user],
                });

                fetch(`/api/games/${game.id}/dislike`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: String(getCookie(".frameworksession")),
                  },
                })
                  .then((res) => res.json())
                  .then((res) => {
                    if (!res.success) {
                      setGame(gameData);
                    }
                  })
                  .catch((err) => {
                    setGame(gameData);
                  });
              }}
            >
              Dislike{game.dislikedBy.find((u) => u.id == user.id) ? "d" : ""}
            </Button>
          </Group>

          <ReactNoSSR onSSR={<Skeleton height={350} />}>
            <Title order={4} mb={16}>
              More like this
            </Title>

            <Stack spacing={12} mb={16}>
              {similarGames != null &&
                similarGames.map((game: Game, i) => (
                  <Link href={`/game/${game.id}`} key={i}>
                    <UnstyledButton
                      sx={(theme) => ({
                        padding: theme.spacing.xs,
                        borderRadius: theme.radius.md,
                        color:
                          theme.colorScheme === "dark"
                            ? theme.colors.dark[0]
                            : theme.black,

                        "&:hover": {
                          backgroundColor:
                            theme.colorScheme === "dark"
                              ? theme.colors.dark[6]
                              : theme.colors.gray[0],
                        },

                        width: "100%",
                      })}
                    >
                      <Group spacing={12}>
                        <Image
                          src={game.iconUri}
                          alt={game.name}
                          width={50}
                          height={50}
                          radius={8}
                          withPlaceholder
                        />
                        <Stack spacing={4}>
                          <Text weight={700}>{game.name}</Text>
                          <Group spacing={6}>
                            <UserContext user={game.author}>
                              <Image
                                src={game.author.avatarUri}
                                width={20}
                                height={20}
                                radius="xl"
                                withPlaceholder
                              />
                            </UserContext>
                            <Text color="dimmed">@{game.author.username}</Text>
                          </Group>
                        </Stack>
                      </Group>
                    </UnstyledButton>
                  </Link>
                ))}
            </Stack>

            {game.rating && <GameRating game={game} />}
          </ReactNoSSR>
        </Grid.Col>
      </Grid>
    </Framework>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const auth = await authorizedRoute(context);
  if (auth.redirect) {
    return auth;
  }

  const { id } = context.query;
  const game = await prisma.game.findFirst({
    where: { id: Number(id) },
    select: gameSelect,
  });

  return {
    props: {
      gameData: JSON.parse(JSON.stringify(game)),
      user: auth?.props?.user,
    },
  };
}

export default Game;
