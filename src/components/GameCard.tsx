import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Card,
  CopyButton,
  createStyles,
  Group,
  Image,
  Text,
  Tooltip,
} from "@mantine/core";
import { useRouter } from "next/router";
import {
  HiCheck,
  HiChevronRight,
  HiOutlineBookmark,
  HiOutlineShare,
  HiOutlineThumbDown,
  HiOutlineThumbUp,
  HiOutlineUsers,
} from "react-icons/hi";
import abbreviate from "../util/abbreviate";
import { Game } from "../util/prisma-types";
import { getGenreText } from "../util/universe/genre";
import PlaceholderGameResource from "./PlaceholderGameResource";
import UserContext from "./UserContext";

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
  const router = useRouter();

  return (
    <Card shadow="md" withBorder p="lg" radius="md" className={classes.card}>
      <Card.Section mb="sm">
        {game.iconUri ? (
          <Image src={game.iconUri} alt={game.name} height={180} />
        ) : (
          <PlaceholderGameResource height={180} />
        )}
      </Card.Section>

      <Badge>{getGenreText(game.genre)}</Badge>

      <Text weight={700} mt="xs">
        {game.name}
      </Text>

      <Group mt="lg" mb="md">
        <UserContext user={game.author}>
          <Avatar
            src={
              game.author.avatarUri ||
              `https://avatars.dicebear.com/api/identicon/${game.author.id}.png`
            }
            radius={999}
          />
        </UserContext>
        <div>
          <Text weight={500}>{game.author.username}</Text>
          <Text size="xs" color="dimmed">
            {new Date(game.updatedAt).toLocaleDateString()}
          </Text>
        </div>
      </Group>

      <Button
        mb="sm"
        onClick={() => router.push(`/game/${game.id}`)}
        leftIcon={<HiChevronRight />}
        fullWidth
      >
        View
      </Button>

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
                {abbreviate(game.playing)}
              </Text>
            </Group>
          </Group>

          <Group spacing={0}>
            <ActionIcon>
              <HiOutlineBookmark size={18} color={theme.colors.yellow[6]} />
            </ActionIcon>
            <CopyButton
              value={
                process.env.NODE_ENV === "development"
                  ? `http://${process.env.NEXT_PUBLIC_HOST || "localhost"}:${
                      process.env.NEXT_PUBLIC_PORT || "3000"
                    }/game/${game.id}`
                  : `https://framework.soodam.rocks/game/${game.id}/`
              }
              timeout={2000}
            >
              {({ copied, copy }) => (
                <Tooltip
                  label={copied ? "Copied" : "Copy"}
                  withArrow
                  position="right"
                >
                  <ActionIcon
                    color={copied ? "teal" : theme.colors.blue[6]}
                    onClick={copy}
                  >
                    {copied ? (
                      <HiCheck size={16} />
                    ) : (
                      <HiOutlineShare size={16} />
                    )}
                  </ActionIcon>
                </Tooltip>
              )}
            </CopyButton>
          </Group>
        </Group>
      </Card.Section>
    </Card>
  );
};

export default GameCard;
