import {
  ActionIcon,
  Badge,
  Button,
  Group,
  Image,
  Menu,
  Paper,
  Stack,
  Text,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  HiExternalLink,
  HiPencil,
  HiPencilAlt,
  HiPlus,
  HiServer,
  HiThumbDown,
  HiThumbUp,
  HiTrash,
  HiUsers,
  HiXCircle,
} from "react-icons/hi";
import abbreviateNumber from "../../util/abbreviate";
import { User } from "../../util/prisma-types";
import Copy from "../Copy";
import EmptyState from "../EmptyState";
import InventTab from "./InventTab";

interface GamesProps {
  user: User;
}

const Games = ({ user }: GamesProps) => {
  const router = useRouter();
  const { colorScheme } = useMantineColorScheme();

  return (
    <InventTab
      tabValue="games"
      tabTitle="Games"
      actions={
        <>
          <Button
            leftIcon={<HiPlus />}
            variant="outline"
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

      <Paper withBorder shadow="md" p={12} radius="md" mb={30}>
        <Stack spacing={12}>
          {user.games.length == 0 && (
            <EmptyState
              title="No games"
              body="You don't have any games on your account."
            />
          )}
          {user.games.map((game) => (
            <Group position="apart" key={game.id}>
              <Group>
                <Group>
                  <Image
                    src={game.iconUri}
                    width={48}
                    height={48}
                    alt={game.name}
                    withPlaceholder
                  />
                  <Stack spacing={5}>
                    <Group>
                      <Text weight={550} size="lg">
                        {game.name}
                      </Text>
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
                        { property: game.likedBy.length, icon: HiThumbUp },
                        { property: game.dislikedBy.length, icon: HiThumbDown },
                        { property: game.visits, icon: HiUsers },
                      ].map((stat) => (
                        <div
                          style={{
                            display: "flex",
                            gap: 6,
                            alignItems: "center",
                          }}
                          key={stat.property}
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
                      ))}
                    </div>
                  </Stack>
                </Group>
              </Group>

              <Group>
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
                      <HiPencilAlt />
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
            </Group>
          ))}
        </Stack>
      </Paper>
    </InventTab>
  );
};

export default Games;
