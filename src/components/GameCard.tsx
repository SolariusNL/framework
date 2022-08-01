import {
  ActionIcon,
  Avatar,
  Badge,
  Card,
  createStyles,
  Group,
  Image,
  Popover,
  Text,
  TextInput,
} from "@mantine/core";
import {
  HiOutlineBookmark,
  HiOutlineThumbDown,
  HiOutlineThumbUp,
  HiOutlineUsers,
  HiShare,
} from "react-icons/hi";
import abbreviate from "../util/abbreviate";
import { Game } from "../util/prisma-types";
import { getGenreText } from "../util/universe/genre";

interface GameCardProps {
  game: Game;
}

const useStyles = createStyles((theme) => ({
  card: {
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
  },

  footer: {
    padding: `${theme.spacing.xs}px ${theme.spacing.lg}px`,
    marginTop: theme.spacing.md,
    borderTop: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[2]
    }`,
  },
}));

const GameCard = ({ game }: GameCardProps) => {
  const { classes, theme } = useStyles();
  return (
    <Card shadow="md" withBorder p="lg" radius="md" className={classes.card}>
      <Card.Section mb="sm">
        <Image src={game.iconUri} alt={game.name} height={180} />
      </Card.Section>

      <Badge>{getGenreText(game.genre)}</Badge>

      <Text weight={700} mt="xs">
        {game.name}
      </Text>

      <Group mt="lg">
        <Avatar
          src={`https://avatars.dicebear.com/api/identicon/${game.author.id}.png`}
          radius={999}
        />
        <div>
          <Text weight={500}>{game.author.username}</Text>
          <Text size="xs" color="dimmed">
            {new Date(game.updatedAt).toLocaleDateString()}
          </Text>
        </div>
      </Group>

      <Card.Section className={classes.footer}>
        <Group position="apart">
          <Group spacing={14}>
            <Group spacing={3}>
              <HiOutlineThumbUp size={12} color={theme.colors.gray[6]} />
              <Text size="xs" color="dimmed">
                {abbreviate(game.likedBy.length)}
              </Text>
            </Group>

            <Group spacing={3}>
              <HiOutlineThumbDown size={12} color={theme.colors.gray[6]} />
              <Text size="xs" color="dimmed">
                {abbreviate(game.dislikedBy.length)}
              </Text>
            </Group>

            <Group spacing={3}>
              <HiOutlineUsers size={12} color={theme.colors.gray[6]} />
              <Text size="xs" color="dimmed">
                {abbreviate(game.visits)}
              </Text>
            </Group>
          </Group>

          <Group spacing={0}>
            <ActionIcon>
              <HiOutlineBookmark size={18} color={theme.colors.yellow[6]} />
            </ActionIcon>
            <Popover
              transition="pop-top-right"
              position="bottom-end"
              shadow={"md"}
            >
              <Popover.Target>
                <ActionIcon>
                  <HiShare size={18} color={theme.colors.blue[6]} />
                </ActionIcon>
              </Popover.Target>

              <Popover.Dropdown>
                <TextInput
                  value={`http${
                    process.env.NODE_ENV === "production" ? "s" : ""
                  }://${
                    process.env.NODE_ENV === "production"
                      ? "framework.soodam.rocks"
                      : "127.0.0.1:3000"
                  }/games/${game.id}`}
                  readOnly
                  sx={{
                    width: "20rem",
                  }}
                  onClick={(e: React.MouseEvent<HTMLInputElement>) => {
                    e.currentTarget.select();
                  }}
                />
              </Popover.Dropdown>
            </Popover>
          </Group>
        </Group>
      </Card.Section>
    </Card>
  );
};

export default GameCard;
