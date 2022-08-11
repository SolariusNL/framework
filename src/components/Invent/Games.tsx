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
} from "@mantine/core";
import { useRouter } from "next/router";
import { HiPencil, HiPencilAlt, HiPlus, HiTrash } from "react-icons/hi";
import { User } from "../../util/prisma-types";
import EmptyState from "../EmptyState";
import PlaceholderGameResource from "../PlaceholderGameResource";
import InventTab from "./InventTab";

interface GamesProps {
  user: User;
}

const Games = ({ user }: GamesProps) => {
  const router = useRouter();
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
        <Grid grow>
          {user.games.length == 0 && (
            <EmptyState
              title="No games"
              body="You don't have any games on your account."
            />
          )}
          {user.games.map((game) => (
            <Grid.Col span={12} key={game.id}>
              <Group position="apart">
                <Group>
                  <Group>
                    {game.iconUri ? (
                      <Image
                        src={game.iconUri}
                        width={48}
                        height={48}
                        radius={8}
                        alt={game.name}
                      />
                    ) : (
                      <PlaceholderGameResource
                        height={48}
                        width={48}
                        radius={8}
                      />
                    )}
                    <Stack spacing={5}>
                      <Text weight={550} size="lg">
                        {game.name}
                      </Text>
                      <Text color="dimmed">@{user.username}</Text>
                    </Stack>
                  </Group>
                </Group>

                <Group>
                  <Group>
                    <Stack spacing={4} align="center">
                      <Text size="sm">Last updated</Text>
                      <Text weight={700} size="md">
                        {new Date(game.updatedAt).toLocaleDateString()}
                      </Text>
                    </Stack>

                    <Stack spacing={4} align="center">
                      <Text size="sm">Updates received</Text>
                      <Text weight={700} size="md">
                        {game.updates.length}
                      </Text>
                    </Stack>
                  </Group>
                  <Menu shadow="md">
                    <Menu.Target>
                      <ActionIcon
                        onClick={() => router.push(`/game/${game.id}/edit`)}
                      >
                        <HiPencilAlt />
                      </ActionIcon>
                    </Menu.Target>

                    <Menu.Dropdown>
                      <Menu.Item icon={<HiPencil />}>Edit</Menu.Item>
                      <Menu.Item color="red" icon={<HiTrash />}>
                        Disable game
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>
              </Group>
            </Grid.Col>
          ))}
        </Grid>
      </Paper>
    </InventTab>
  );
};

export default Games;
