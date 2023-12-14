import DataGrid from "@/components/data-grid";
import Framework from "@/components/framework";
import GameRating from "@/components/game-rating";
import ThumbnailCarousel from "@/components/image-carousel";
import InlineError from "@/components/inline-error";
import Launching from "@/components/launching";
import LoadingIndicator from "@/components/loading-indicator";
import Owner from "@/components/owner";
import PlaceholderGameResource from "@/components/placeholder-game-resource";
import ShadedButton from "@/components/shaded-button";
import ShadedCard from "@/components/shaded-card";
import UserContext from "@/components/user-context";
import Votes from "@/components/view-game/votes";
import useReportAbuse from "@/stores/useReportAbuse";
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
  Button,
  Divider,
  Grid,
  Group,
  Image,
  Menu,
  SegmentedControl,
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
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {
  HiCheckCircle,
  HiDotsVertical,
  HiFlag,
  HiOutlineCake,
  HiOutlineClock,
  HiOutlineCode,
  HiOutlineServer,
  HiOutlineShoppingBag,
  HiOutlineUsers,
  HiOutlineViewGrid,
  HiOutlineViewList,
  HiPencil,
  HiPlay,
  HiPlus,
  HiSparkles,
} from "react-icons/hi";
import ReactNoSSR from "react-no-ssr";

const SSRLoader = (
  <div className="flex justify-center items-center py-8">
    <LoadingIndicator />
  </div>
);
const InfoTab = dynamic(() => import("@/components/view-game/info"), {
  ssr: false,
  loading: () => SSRLoader,
});
const ConnectionTab = dynamic(
  () => import("@/components/view-game/connection"),
  {
    ssr: false,
    loading: () => SSRLoader,
  }
);
const FundsTab = dynamic(() => import("@/components/view-game/funds"), {
  ssr: false,
  loading: () => SSRLoader,
});
const Store = dynamic(() => import("@/components/view-game/store"), {
  ssr: false,
  loading: () => SSRLoader,
});
const UpdateLogTab = dynamic(
  () => import("@/components/view-game/update-log"),
  {
    ssr: false,
    loading: () => SSRLoader,
  }
);
const GameComments = dynamic(() => import("@/components/game-comments"), {
  ssr: false,
  loading: () => SSRLoader,
});

type GameWithGamepass = Game & {
  gamepasses: Gamepass[];
};
type GameViewProps = {
  gameData: GameWithGamepass;
  user: User;
};

type Tab = "info" | "connection" | "funds" | "store" | "updatelog";

const Game: NextPage<GameViewProps> = ({ gameData, user }) => {
  const [game, setGame] = useState(gameData);
  const [launchingOpen, setLaunchingOpen] = useState(false);
  const [similarGames, setSimilarGames] = useState<Game[] | null>(null);
  const { setOpened: setReportOpened } = useReportAbuse();
  const [following, setFollowing] = useState<boolean | null>(null);
  const [activeTab, setActiveTab] = useState<
    "info" | "connection" | "funds" | "store" | "updatelog"
  >("info" as Tab);
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
            <div className="flex flex-col h-full">
              <div>
                <Group position="apart" pl={0} pr={0} p={10}>
                  <Link
                    href={
                      game.team
                        ? `/teams/t/${game.team.slug}`
                        : `/profile/${game.author.username}`
                    }
                  >
                    <Owner
                      user={
                        game.team
                          ? ({
                              username: game.team.name,
                              avatarUri: game.team.iconUri,
                              alias: game.team.name,
                            } as NonUser)
                          : game.author
                      }
                      {...(game.team
                        ? {
                            overrideHref: `/teams/t/${game.team.slug}`,
                          }
                        : {})}
                    />
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
                              setReportOpened(true, game.author);
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

                {game.underReview ? (
                  <InlineError variant="warning" title="Under review" className="mt-8">
                    This game is under review by Solarius staff.
                  </InlineError>
                ) : (
                  <>
                    {game.connection.length === 0 && ServerError}
                    {game.connection.length > 0 &&
                      !Fw.Arrays.first(game.connection).online &&
                      ServerError}

                    <Button.Group mt="lg" mb="sm">
                      <Button
                        color="green"
                        radius="xl"
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
                          radius="xl"
                          color="blue"
                        />
                      </Tooltip>
                    </Button.Group>
                  </>
                )}
              </div>

              {!game.underReview && (
                <>
                  <div>
                    <Button
                      leftIcon={<HiPlus />}
                      fullWidth
                      size="lg"
                      mb="xl"
                      onClick={async () => await followGame()}
                      radius="xl"
                      variant="light"
                    >
                      {following === null
                        ? "..."
                        : following
                        ? "Unfollow"
                        : "Follow"}
                    </Button>
                  </div>
                  <div className="mt-auto">
                    <ReactNoSSR>
                      <Votes
                        game={game}
                        setGame={
                          setGame as React.Dispatch<React.SetStateAction<Game>>
                        }
                      />
                    </ReactNoSSR>
                  </div>
                </>
              )}
            </div>
          </Grid.Col>
        </Grid>

        <SegmentedControl
          data={[
            {
              label: "About",
              value: "info",
            },
            {
              label: "Servers",
              value: "connection",
            },
            {
              label: "Funds",
              value: "funds",
            },
            {
              label: "Store",
              value: "store",
            },
            {
              label: "Updates",
              value: "updatelog",
            },
          ]}
          value={activeTab}
          fullWidth
          onChange={(v) => setActiveTab(v as Tab)}
        />
        <div className="md:grid flex flex-col md:grid-cols-6 gap-4 mt-4">
          <div className="col-span-4">
            {activeTab === "info" && <InfoTab game={game} />}
            {activeTab === "connection" && <ConnectionTab game={game} />}
            {activeTab === "funds" && <FundsTab game={game} />}
            {activeTab === "store" && <Store game={game} />}
            {activeTab === "updatelog" && <UpdateLogTab game={game} />}
            <ShadedCard className="mt-8">
              <DataGrid
                items={[
                  {
                    icon: <HiOutlineViewList />,
                    value: getGenreText(game.genre),
                    tooltip: "Genre",
                  },
                  {
                    icon: <HiOutlineUsers />,
                    value: game.maxPlayersPerSession,
                    tooltip: "Max players",
                  },
                  {
                    icon: <HiOutlineServer />,
                    value: game.playing,
                    tooltip: "Playing",
                  },
                  {
                    icon: <HiOutlineViewGrid />,
                    value: game.visits,
                    tooltip: "Visits",
                  },
                  {
                    icon: <HiOutlineShoppingBag />,
                    value: game.paywall ? "Paid access" : "Free access",
                    tooltip: "Paywall",
                  },
                  {
                    icon: <HiOutlineCode />,
                    value: (
                      <Badge>
                        {game.updateLogs[0] ? game.updateLogs[0].tag : "N/A"}
                      </Badge>
                    ),
                    tooltip: "Latest version",
                  },
                  {
                    icon: <HiOutlineCake />,
                    value: new Date(game.createdAt).toLocaleDateString(),
                    tooltip: "Created at",
                  },
                  {
                    icon: <HiOutlineClock />,
                    value: new Date(game.updatedAt).toLocaleDateString(),
                    tooltip: "Updated at",
                  },
                ]}
                className="!mt-0"
              />
            </ShadedCard>
            <div className="flex items-center gap-4 mt-8 mb-3">
              <Title order={3}>Comments</Title>
              <Divider className="flex-grow" />
            </div>
            <GameComments game={game} user={user} />
          </div>
          <div className="col-span-2 flex flex-col gap-4">
            {similarGames && similarGames.length > 0 && (
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
            )}
            <GameRating game={game} />
          </div>
        </div>
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
