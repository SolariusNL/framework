import DataGrid from "@/components/data-grid";
import Framework from "@/components/framework";
import GameComments from "@/components/game-comments";
import GameRating from "@/components/game-rating";
import ThumbnailCarousel from "@/components/image-carousel";
import InlineError from "@/components/inline-error";
import Launching from "@/components/launching";
import PlaceholderGameResource from "@/components/placeholder-game-resource";
import ReportUser from "@/components/report-user";
import ShadedButton from "@/components/shaded-button";
import ShadedCard from "@/components/shaded-card";
import TabNav from "@/components/tab-nav";
import UserContext from "@/components/user-context";
import Verified from "@/components/verified";
import ConnectionTab from "@/components/view-game/connection";
import FundsTab from "@/components/view-game/funds";
import InfoTab from "@/components/view-game/info";
import Store from "@/components/view-game/store";
import UpdateLogTab from "@/components/view-game/update-log";
import Votes from "@/components/view-game/votes";
import IResponseBase from "@/types/api/IResponseBase";
import authorizedRoute from "@/util/auth";
import { getIpcRenderer } from "@/util/electron";
import fetchJson from "@/util/fetch";
import { Fw } from "@/util/fw";
import getMediaUrl from "@/util/get-media";
import useMediaQuery from "@/util/media-query";
import prisma from "@/util/prisma";
import { Game, NonUser, User, gameSelect } from "@/util/prisma-types";
import { getGenreText } from "@/util/universe/genre";
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
  HiCake,
  HiCheckCircle,
  HiCode,
  HiCurrencyDollar,
  HiDotsVertical,
  HiFlag,
  HiFolder,
  HiInformationCircle,
  HiOutlineClock,
  HiPencil,
  HiPlay,
  HiPlus,
  HiServer,
  HiShoppingBag,
  HiSparkles,
  HiUsers,
  HiViewGrid,
  HiViewList,
} from "react-icons/hi";
import ReactNoSSR from "react-no-ssr";

type GameWithGamepass = Game & {
  gamepasses: Gamepass[];
};

interface GameViewProps {
  gameData: GameWithGamepass;
  user: User;
}

const Game: NextPage<GameViewProps> = ({ gameData, user }) => {
  const [game, setGame] = useState(gameData);
  const [launchingOpen, setLaunchingOpen] = useState(false);
  const [similarGames, setSimilarGames] = useState<Game[] | null>(null);
  const [report, setReport] = useState(false);
  const [following, setFollowing] = useState<boolean | null>(null);
  const mobile = useMediaQuery("768");
  const router = useRouter();

  const getSimilarGames = async () => {
    await fetchJson<
      IResponseBase<{
        games: Game[];
      }>
    >(`/api/games/by/genre/${game.genre}?exclude=${game.id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => {
      setSimilarGames(res.data?.games!);
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

        <Grid columns={24} gutter="xl" mb="xl">
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
          </Grid.Col>
          <Grid.Col span={mobile ? 24 : 8} p={10}>
            <div className="flex flex-col justify-between h-full">
              <div>
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
                              {game.team
                                ? game.team.name
                                : game.author.username}
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

                <Button.Group mt="lg" mb="sm">
                  <Button
                    color="green"
                    leftIcon={<HiPlay />}
                    fullWidth
                    size="xl"
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

                  <Tooltip label="Play in a private server">
                    <Button
                      leftIcon={<HiSparkles />}
                      size="xl"
                      className="px-5"
                      classNames={{
                        icon: "mr-0",
                      }}
                      disabled={game.connection.length == 0}
                      onClick={() => {
                        if (isElectron()) {
                          getIpcRenderer().send("join-game");
                        } else {
                          setLaunchingOpen(true);
                        }
                      }}
                    />
                  </Tooltip>
                </Button.Group>
              </div>

              <div>
                <Button
                  leftIcon={<HiPlus />}
                  fullWidth
                  size="lg"
                  mb="xl"
                  onClick={async () => await followGame()}
                >
                  {following === null
                    ? "..."
                    : following
                    ? "Unfollow"
                    : "Follow"}
                </Button>
                <ReactNoSSR>
                  <Votes
                    game={game}
                    setGame={
                      setGame as React.Dispatch<React.SetStateAction<Game>>
                    }
                  />
                </ReactNoSSR>
              </div>
            </div>
          </Grid.Col>
        </Grid>

        <TabNav defaultValue="info" mb={0}>
          <TabNav.List grow mb="md">
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
              <TabNav.Tab
                icon={<HiInformationCircle />}
                value="info"
                className="transition-all"
              >
                About
              </TabNav.Tab>

              <TabNav.Tab
                icon={<HiServer />}
                value="connection"
                className="transition-all"
              >
                Servers
              </TabNav.Tab>

              <TabNav.Tab
                icon={<HiCurrencyDollar />}
                value="funds"
                className="transition-all"
              >
                Funds
              </TabNav.Tab>

              <TabNav.Tab
                icon={<HiShoppingBag />}
                value="store"
                className="transition-all"
              >
                Store
              </TabNav.Tab>

              <TabNav.Tab
                icon={<HiFolder />}
                value="updatelog"
                className="transition-all"
              >
                Updates
              </TabNav.Tab>
            </div>
          </TabNav.List>

          <div className="grid md:grid-cols-3 grid-cols-1 gap-3">
            <div className="col-span-2">
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
              <ShadedCard className="mt-8 mb-8">
                <DataGrid
                  items={[
                    {
                      icon: <HiViewList />,
                      value: getGenreText(game.genre),
                      tooltip: "Genre",
                    },
                    {
                      icon: <HiUsers />,
                      value: game.maxPlayersPerSession,
                      tooltip: "Max players",
                    },
                    {
                      icon: <HiServer />,
                      value: game.playing,
                      tooltip: "Playing",
                    },
                    {
                      icon: <HiViewGrid />,
                      value: game.visits,
                      tooltip: "Visits",
                    },
                    {
                      icon: <HiShoppingBag />,
                      value: game.paywall ? "Paid access" : "Free access",
                      tooltip: "Paywall",
                    },
                    {
                      icon: <HiCode />,
                      value: (
                        <Badge>
                          {game.updateLogs[0] ? game.updateLogs[0].tag : "N/A"}
                        </Badge>
                      ),
                      tooltip: "Latest version",
                    },
                    {
                      icon: <HiCake />,
                      value: new Date(game.createdAt).toLocaleDateString(),
                      tooltip: "Created at",
                    },
                    {
                      icon: <HiOutlineClock />,
                      value: new Date(game.updatedAt).toLocaleDateString(),
                      tooltip: "Updated at",
                    },
                  ]}
                  className="mt-0"
                />
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
            </div>
            <Stack spacing="xl" className="w-full">
              <ShadedCard className="col-span-1 h-fit w-full">
                <Title order={4} mb={16}>
                  More like this
                </Title>

                <Stack spacing={12}>
                  {similarGames !== null && similarGames.length > 0
                    ? similarGames.map((game: Game, i) => (
                        <Link href={`/game/${game.id}`} key={i}>
                          <ShadedButton light>
                            <Group spacing={12}>
                              <Avatar
                                src={getMediaUrl(game.iconUri)}
                                className="w-12 h-12 rounded-md"
                                radius="md"
                                color={Fw.Strings.color(game.name)}
                                placeholder="..."
                              >
                                {Fw.Strings.initials(game.name)}
                              </Avatar>
                              <Stack spacing={4}>
                                <Text weight={700}>{game.name}</Text>
                                <Group spacing={6}>
                                  <UserContext user={game.author}>
                                    <Avatar
                                      src={getMediaUrl(game.author.avatarUri)}
                                      radius={999}
                                      size={22}
                                      color={Fw.Strings.color(
                                        game.author.username
                                      )}
                                    >
                                      {Fw.Strings.initials(
                                        game.author.username
                                      )}
                                    </Avatar>
                                  </UserContext>
                                  <Text color="dimmed">
                                    @{game.author.username}
                                  </Text>
                                </Group>
                              </Stack>
                            </Group>
                          </ShadedButton>
                        </Link>
                      ))
                    : Array(3)
                        .fill(0)
                        .map((_, i) => (
                          <Skeleton
                            height={48}
                            key={i}
                            className="rounded-md"
                          />
                        ))}
                </Stack>
              </ShadedCard>
              <GameRating game={game} />
            </Stack>
          </div>
        </TabNav>
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
