import {
  ActionIcon,
  AspectRatio,
  Avatar,
  Badge,
  Card,
  CopyButton,
  createStyles,
  Group,
  Image,
  Text,
  Tooltip,
} from "@mantine/core";
import { motion } from "framer-motion";
import Link from "next/link";
import { HiCheck, HiOutlineBookmark, HiOutlineShare } from "react-icons/hi";
import { Game } from "../util/prisma-types";
import UserContext from "./UserContext";

interface GameCardProps {
  game: Game;
}

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
          sx={{
            backgroundColor:
              theme.colorScheme === "dark" ? theme.colors.dark[9] : "#FFF",
            overflow: "visible",
          }}
        >
          <Card.Section mb="sm">
            <AspectRatio
              ratio={1 / 1}
              mx="auto"
              sx={{
                borderRadius: theme.radius.md,
              }}
            >
              <Image
                src={game.iconUri}
                alt={game.name}
                withPlaceholder
                radius="md"
              />
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

              <Group spacing={0}>
                <ActionIcon>
                  <HiOutlineBookmark size={18} color={theme.colors.yellow[6]} />
                </ActionIcon>
                <CopyButton
                  value={
                    typeof window !== "undefined"
                      ? window.location.host
                      : "" + `/game/${game.id}`
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
      </motion.div>
    </Link>
  );
};

export default GameCard;
