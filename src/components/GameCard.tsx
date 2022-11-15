import {
  AspectRatio,
  Avatar,
  Badge,
  Card,
  createStyles,
  Group,
  Image,
  MantineColor,
  Text,
} from "@mantine/core";
import { motion } from "framer-motion";
import Link from "next/link";
import { Game } from "../util/prisma-types";
import PlaceholderGameResource from "./PlaceholderGameResource";
import UserContext from "./UserContext";

interface GameCardProps {
  game: Game;
}

export const gradientPairs: Array<[MantineColor, MantineColor]> = [
  ["red", "pink"],
  ["blue", "cyan"],
  ["teal", "lime"],
  ["violet", "purple"],
  ["orange", "yellow"],
  ["cyan", "blue"],
  ["lime", "teal"],
  ["pink", "red"],
  ["purple", "violet"],
];

const useStyles = createStyles((theme) => ({
  footer: {
    padding: `${theme.spacing.xs}px ${theme.spacing.lg}px`,
    marginTop: theme.spacing.md,
  },
}));

const GameCard = ({ game }: GameCardProps) => {
  const { classes, theme } = useStyles();

  return (
    <Link href={`/game/${game.id}`}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        style={{
          cursor: "pointer",
        }}
      >
        <Card
          shadow="sm"
          withBorder
          p="lg"
          radius="md"
          sx={(theme) => ({
            backgroundColor:
              theme.colorScheme === "dark" ? theme.colors.dark[9] : "#FFF",
            overflow: "visible",
          })}
        >
          <Card.Section mb="sm">
            <AspectRatio ratio={1 / 1}>
              {game.iconUri ? (
                <Image
                  src={game.iconUri}
                  alt={game.name}
                  withPlaceholder
                  sx={{
                    borderTopLeftRadius: theme.radius.md,
                    borderTopRightRadius: theme.radius.md,
                  }}
                />
              ) : (
                <PlaceholderGameResource game={game} noBottomRadius />
              )}
            </AspectRatio>
          </Card.Section>

          <Badge mb="md">{game.genre}</Badge>

          <Text weight={700} mb="xl" size="lg">
            {game.name}
          </Text>

          <Card.Section className={classes.footer}>
            <Group position="apart">
              <UserContext user={game.author}>
                <Avatar
                  src={
                    game.author.avatarUri ||
                    `https://avatars.dicebear.com/api/identicon/${game.author.id}.png`
                  }
                  radius="xl"
                  size="sm"
                />
              </UserContext>
            </Group>
          </Card.Section>
        </Card>
      </motion.div>
    </Link>
  );
};

export default GameCard;
