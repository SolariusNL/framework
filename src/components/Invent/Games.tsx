import {
  ActionIcon,
  Button,
  Grid,
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
  HiPencil,
  HiPencilAlt,
  HiPlus,
  HiThumbDown,
  HiThumbUp,
  HiTrash,
  HiUsers,
} from "react-icons/hi";
import { User } from "../../util/prisma-types";
import EmptyState from "../EmptyState";
import PlaceholderGameResource from "../PlaceholderGameResource";
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
        <Stack spacing={8}>
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
                    radius={8}
                    alt={game.name}
                    withPlaceholder
                  />
                  <Stack spacing={5}>
                    <Text weight={550} size="lg">
                      {game.name}
                    </Text>
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
                            {String(stat.property)}
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
                    color={colorScheme == "dark" ? "dark" : "blue"}
                  >
                    View
                  </Button>
                </Link>
                <Menu shadow="md">
                  <Menu.Target>
                    <ActionIcon>
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
