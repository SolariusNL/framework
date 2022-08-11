import {
  ActionIcon,
  Alert,
  Avatar,
  Badge,
  Button,
  Divider,
  Grid,
  Group,
  Image,
  Progress,
  Table,
  Tabs,
  Text,
  Title,
  TypographyStylesProvider,
} from "@mantine/core";
import { GetServerSidePropsContext, NextPage } from "next";
import { useRouter } from "next/router";
import {
  HiChat,
  HiDotsVertical,
  HiFolder,
  HiInformationCircle,
  HiLockClosed,
  HiPlay,
  HiPlus,
  HiServer,
  HiThumbDown,
  HiThumbUp,
  HiViewList,
} from "react-icons/hi";
import Framework from "../../../components/Framework";
import GameComments from "../../../components/GameComments";
import ThumbnailCarousel from "../../../components/ImageCarousel";
import PlaceholderGameResource from "../../../components/PlaceholderGameResource";
import authorizedRoute from "../../../util/authorizedRoute";
import prisma from "../../../util/prisma";
import { Game, gameSelect, User } from "../../../util/prisma-types";
import useMediaQuery from "../../../util/useMediaQuery";

interface GameViewProps {
  game: Game;
  user: User;
}

const Game: NextPage<GameViewProps> = ({ game, user }) => {
  const mobile = useMediaQuery("768");
  const router = useRouter();

  const totalFeedback = game.likedBy.length + game.dislikedBy.length;
  const positive = (game.likedBy.length / totalFeedback) * 100;
  const negative = (game.dislikedBy.length / totalFeedback) * 100;

  return (
    <Framework user={user} activeTab="none">
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
                    <Image
                      src={image}
                      key={i}
                      alt={game.name}
                      height={mobile ? 200 : 320}
                    />
                  ))
                : [
                    <PlaceholderGameResource
                      height={mobile ? 200 : 320}
                      key="placeholder"
                    />,
                  ]
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

                <Tabs.Tab icon={<HiFolder />} value="updatelog">
                  Update Log
                </Tabs.Tab>
              </div>
            </Tabs.List>

            <Tabs.Panel value="info" pt="md">
              <Title order={3} mb={16}>
                Information
              </Title>
              <Title order={5} mb={10}>
                Description
              </Title>
              <TypographyStylesProvider>
                <div dangerouslySetInnerHTML={{ __html: game.description }} />
              </TypographyStylesProvider>
            </Tabs.Panel>

            <Tabs.Panel value="connection" pt="md">
              <Title order={3} mb={16}>
                Connection Information
              </Title>

              <Table highlightOnHover mb={10}>
                <thead>
                  <tr>
                    <th>IP Address</th>
                    <th>Port</th>
                    <th>Online</th>
                  </tr>
                </thead>

                <tbody>
                  {game.connection.map((connection, i) => (
                    <tr key={i}>
                      <td>{connection.ip}</td>
                      <td>{connection.port}</td>
                      <td>
                        {connection.online ? (
                          <Badge variant="dot" color="green">
                            Online
                          </Badge>
                        ) : (
                          <Badge variant="dot" color="red">
                            Offline
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {game.author.id == user.id && (
                <Button
                  variant="subtle"
                  size="xs"
                  leftIcon={<HiPlus />}
                  onClick={() => router.push(`/game/${game.id}/connection/add`)}
                >
                  Add server
                </Button>
              )}
            </Tabs.Panel>

            <Tabs.Panel value="servers" pt="md">
              <Title order={3}>Servers</Title>
            </Tabs.Panel>

            <Tabs.Panel value="updatelog" pt="md">
              <Title order={3}>Update Log</Title>
            </Tabs.Panel>
          </Tabs>

          <GameComments user={user} game={game} />
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
              <Avatar
                src={`https://avatars.dicebear.com/api/identicon/${game.authorId}.png`}
                alt={game.author.username}
                radius="xl"
                size={20}
                onClick={() => router.push(`/profile/${game.author.username}`)}
              />
              <Text weight={700}>{game.author.username}</Text>
            </Group>

            <Group>
              <Text color="dimmed">@{game.author.username}</Text>
              {game.author.id == user.id && (
                <ActionIcon
                  onClick={() => router.push(`/game/${game.id}/edit`)}
                  color="dark"
                >
                  <HiDotsVertical />
                </ActionIcon>
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
          >
            Play
          </Button>

          <Button
            leftIcon={<HiLockClosed />}
            fullWidth
            size="lg"
            mb="md"
            disabled={game.connection.length == 0}
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
          <Group grow>
            <Button
              color="green"
              leftIcon={<HiThumbUp />}
              size="sm"
              disabled={
                game.dislikedBy.find((u) => u.id == user.id) ? true : false
              }
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
            >
              Dislike{game.dislikedBy.find((u) => u.id == user.id) ? "d" : ""}
            </Button>
          </Group>
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
      game: JSON.parse(JSON.stringify(game)),
      user: auth?.props?.user,
    },
  };
}

export default Game;
