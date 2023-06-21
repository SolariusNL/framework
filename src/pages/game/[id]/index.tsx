import {
  ActionIcon,
  AspectRatio,
  Avatar,
  Badge,
  Box,
  Button,
  Grid,
  Group,
  Image,
  Loader,
  Menu,
  Skeleton,
  Stack,
  Tabs,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { Gamepass } from "@prisma/client";
import { getCookie } from "cookies-next";
import isElectron from "is-electron";
import { GetServerSidePropsContext, NextPage } from "next";
import { NextSeo } from "next-seo";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  HiCheckCircle,
  HiCurrencyDollar,
  HiDotsVertical,
  HiFlag,
  HiFolder,
  HiInformationCircle,
  HiLockClosed,
  HiPencil,
  HiPlay,
  HiPlus,
  HiServer,
  HiShoppingBag,
} from "react-icons/hi";
import ReactNoSSR from "react-no-ssr";
import Framework from "../../../components/Framework";
import GameComments from "../../../components/GameComments";
import GameRating from "../../../components/GameRating";
import ThumbnailCarousel from "../../../components/ImageCarousel";
import InlineError from "../../../components/InlineError";
import Launching from "../../../components/Launching";
import PlaceholderGameResource from "../../../components/PlaceholderGameResource";
import ReportUser from "../../../components/ReportUser";
import ShadedButton from "../../../components/ShadedButton";
import ShadedCard from "../../../components/ShadedCard";
import UserContext from "../../../components/UserContext";
import Verified from "../../../components/Verified";
import ConnectionTab from "../../../components/ViewGame/Connection";
import FundsTab from "../../../components/ViewGame/Funds";
import InfoTab from "../../../components/ViewGame/Info";
import Store from "../../../components/ViewGame/Store";
import UpdateLogTab from "../../../components/ViewGame/UpdateLog";
import Votes from "../../../components/ViewGame/Votes";
import authorizedRoute from "../../../util/auth";
import { getIpcRenderer } from "../../../util/electron";
import { Fw } from "../../../util/fw";
import getMediaUrl from "../../../util/get-media";
import useMediaQuery from "../../../util/media-query";
import prisma from "../../../util/prisma";
import { Game, NonUser, User, gameSelect } from "../../../util/prisma-types";

type GameWithGamepass = Game & {
  gamepasses: Gamepass[];
};

interface GameViewProps {
  gameData: GameWithGamepass;
  user: User;
}

const Game: NextPage<GameViewProps> = ({ gameData, user }) => {
  const mobile = useMediaQuery("768");
  const router = useRouter();

  const [game, setGame] = useState(gameData);
  const [launchingOpen, setLaunchingOpen] = useState(false);
  const [similarGames, setSimilarGames] = useState<Game[] | null>(null);
  const [report, setReport] = useState(false);
  const [following, setFollowing] = useState<boolean | null>(null);

  const getSimilarGames = async () => {
    await fetch(`/api/games/by/genre/${game.genre}?exclude=${game.id}`, {
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

  const queryFollowing = async () => {
    await fetch(`/api/games/following/${game.id}/status`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setFollowing(res.following);
      });
  };

  const followGame = async () => {
    setFollowing(!following);

    await fetch(`/api/games/following/${game.id}/follow`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    }).finally(() =>
      showNotification({
        title: (following ? "Unfollowed" : "Followed") + " game",
        message: `You have ${following ? "unfollowed" : "followed"} ${
          game.name
        }.`,
        icon: <HiCheckCircle />,
      })
    );
  };

  const ServerError = (
    <InlineError
      title="No active servers"
      variant="error"
      className="mb-4 mt-4"
    >
      This game has no active servers. Please try again later, or reach out to
      the game author.
    </InlineError>
  );

  useEffect(() => {
    getSimilarGames();
    queryFollowing();
  }, []);

  return (
    <>
      <ReportUser
        user={game.author as NonUser}
        game={game.id}
        opened={report}
        setOpened={setReport}
      />
      <NextSeo
        title={String(game.name)}
        description={String(game.description.replace(/(<([^>]+)>)/gi, ""))}
        openGraph={{
          title: `${game.name} on Framework`,
          description: String(game.description),
          ...(game.gallery.length > 0
            ? {
                images: [
                  ...game.gallery.map((image) => ({
                    url: image,
                    width: 800,
                    height: 600,
                    alt: `${game.name} on Framework`,
                  })),
                ],
              }
            : {}),
        }}
      />
      <Framework user={user} activeTab="none">
        <Launching opened={launchingOpen} setOpened={setLaunchingOpen} />

        <Grid columns={24} gutter="xl">
          <Grid.Col span={mobile ? 24 : 16}>
            <Title mb={32}>{game.name}</Title>

            <ThumbnailCarousel
              slides={
                game.gallery.length > 0
                  ? game.gallery.map((image, i) => (
                      <AspectRatio ratio={16 / 9} key={i}>
                        <Image
                          src={getMediaUrl(image)}
                          key={i}
                          alt={game.name}
                          radius="md"
                        />
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

            <ShadedCard mb={32} mt={32}>
              <Tabs variant="pills" defaultValue="info">
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
                      Servers
                    </Tabs.Tab>

                    <Tabs.Tab icon={<HiCurrencyDollar />} value="funds">
                      Funds
                    </Tabs.Tab>

                    <Tabs.Tab icon={<HiShoppingBag />} value="store">
                      Store
                    </Tabs.Tab>

                    <Tabs.Tab icon={<HiFolder />} value="updatelog">
                      Update Log
                    </Tabs.Tab>
                  </div>
                </Tabs.List>

                {[InfoTab, ConnectionTab, FundsTab, Store, UpdateLogTab].map(
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
                      <Tab game={game as any} />
                    </ReactNoSSR>
                  )
                )}
              </Tabs>
            </ShadedCard>

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
            <Group position="apart" pl={0} pr={0} p={10}>
              <Link
                href={
                  game.team
                    ? `/teams/t/${game.team.slug}`
                    : `/profile/${game.author.username}`
                }
              >
                <Group
                  sx={{
                    cursor: "pointer",
                  }}
                >
                  {game.team ? (
                    <Avatar
                      src={getMediaUrl(game.team.iconUri)}
                      alt={game.team.name}
                      radius="xl"
                      size={48}
                    />
                  ) : (
                    <UserContext user={game.author}>
                      <Avatar
                        src={
                          getMediaUrl(game.author.avatarUri) ||
                          `https://avatars.dicebear.com/api/identicon/${game.authorId}.png`
                        }
                        alt={game.author.username}
                        radius="xl"
                        size={48}
                      />
                    </UserContext>
                  )}
                  <Stack spacing={3}>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        {!game.team && game.author.verified && <Verified />}
                        <Text weight={700}>
                          {game.team ? game.team.name : game.author.username}
                        </Text>
                      </div>
                      {game.team && (
                        <Badge radius="md" size="sm">
                          Team
                        </Badge>
                      )}
                    </div>
                    <Text color="dimmed" size="sm">
                      {game.team ? "Managed by this team" : "Game author"}
                    </Text>
                  </Stack>
                </Group>
              </Link>

              <Group>
                <Tooltip label="Edit game">
                  <Menu width={160} shadow="sm">
                    <Menu.Target>
                      <ActionIcon color="dark">
                        <HiDotsVertical />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Label>{game.name}</Menu.Label>
                      <Menu.Item
                        disabled={game.author.id !== user.id}
                        onClick={() => {
                          router.push(`/game/${game.id}/edit/details`);
                        }}
                        icon={<HiPencil />}
                      >
                        Edit
                      </Menu.Item>
                      <Menu.Item
                        disabled={game.author.id === user.id}
                        onClick={() => {
                          setReport(true);
                        }}
                        icon={<HiFlag />}
                        color="red"
                      >
                        Report
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Tooltip>
              </Group>
            </Group>

            {game.connection.length === 0 && ServerError}
            {game.connection.length > 0 &&
              !Fw.Arrays.first(game.connection).online &&
              ServerError}

            <Button
              mt="lg"
              color="green"
              leftIcon={<HiPlay />}
              fullWidth
              size="xl"
              mb="xs"
              disabled={game.connection.length == 0}
              onClick={() => {
                if (isElectron()) {
                  getIpcRenderer().send("join-game");
                } else {
                  setLaunchingOpen(true);
                }
              }}
            >
              Play
            </Button>

            <Button
              leftIcon={<HiLockClosed />}
              fullWidth
              size="lg"
              mb={"xs"}
              disabled={game.connection.length == 0}
              onClick={() => {
                if (isElectron()) {
                  getIpcRenderer().send("join-game");
                } else {
                  setLaunchingOpen(true);
                }
              }}
            >
              Play in Private Server
            </Button>

            <Button
              leftIcon={<HiPlus />}
              fullWidth
              size="lg"
              mb={32}
              onClick={async () => await followGame()}
            >
              {following === null ? "..." : following ? "Unfollow" : "Follow"}
            </Button>

            <ReactNoSSR>
              <Votes
                game={game}
                setGame={setGame as React.Dispatch<React.SetStateAction<Game>>}
              />
            </ReactNoSSR>

            <ReactNoSSR onSSR={<Skeleton height={350} />}>
              <ShadedCard mb={32}>
                <Title order={4} mb={16}>
                  More like this
                </Title>

                <Stack spacing={12}>
                  {similarGames != null &&
                    similarGames.map((game: Game, i) => (
                      <Link href={`/game/${game.id}`} key={i}>
                        <ShadedButton>
                          <Group spacing={12}>
                            <Image
                              src={getMediaUrl(game.iconUri)}
                              withPlaceholder
                              className="rounded-md"
                              width={48}
                              height={48}
                              radius="md"
                            />
                            <Stack spacing={4}>
                              <Text weight={700}>{game.name}</Text>
                              <Group spacing={6}>
                                <UserContext user={game.author}>
                                  <Image
                                    src={
                                      game.author.avatarUri
                                        ? getMediaUrl(game.author.avatarUri)
                                        : `https://avatars.dicebear.com/api/identicon/${game.authorId}.png`
                                    }
                                    width={20}
                                    height={20}
                                    radius={999}
                                    withPlaceholder
                                  />
                                </UserContext>
                                <Text color="dimmed">
                                  @{game.author.username}
                                </Text>
                              </Group>
                            </Stack>
                          </Group>
                        </ShadedButton>
                      </Link>
                    ))}
                </Stack>
              </ShadedCard>

              {game.rating && <GameRating game={game} />}
            </ReactNoSSR>
          </Grid.Col>
        </Grid>
      </Framework>
    </>
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
    select: {
      ...gameSelect,
      gamepasses: {
        include: {
          owners: {
            select: { id: true },
          },
        },
      },
      privateAccess: { select: { id: true } },
      private: true,
      authorId: true,
    },
  });

  if (game?.private && game.authorId !== auth?.props?.user?.id) {
    if (!game.privateAccess.find((user) => user.id === auth?.props?.user?.id)) {
      return {
        redirect: {
          destination: "/",
          permanent: false,
        },
      };
    }
  }

  return {
    props: {
      gameData: JSON.parse(JSON.stringify(game)),
      user: auth?.props?.user,
    },
  };
}

export default Game;
