import {
  AspectRatio,
  Avatar,
  Badge,
  Button,
  Card,
  createStyles,
  Group,
  Image,
  MantineColor,
  Text,
} from "@mantine/core";
import { randomId } from "@mantine/hooks";
import Link from "next/link";
import { useState } from "react";
import {
  HiArrowRight,
  HiFlag,
  HiThumbDown,
  HiThumbUp,
  HiUserGroup,
} from "react-icons/hi";
import getMediaUrl from "../util/getMedia";
import { Game } from "../util/prisma-types";
import { getGenreText } from "../util/universe/genre";
import { getRatingColor } from "../util/universe/ratings";
import PlaceholderGameResource from "./PlaceholderGameResource";
import ReportUser from "./ReportUser";
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
  const [reportOpen, setReportOpen] = useState(false);

  return (
    <>
      <ReportUser
        user={game.author}
        opened={reportOpen}
        setOpened={setReportOpen}
      />
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
        <Card.Section mb="sm" p="md">
          <Group grow className="align-top items-start">
            {game.iconUri ? (
              <Image
                src={getMediaUrl(game.iconUri)}
                alt={game.name}
                radius={theme.radius.md}
                withPlaceholder
              />
            ) : (
              <AspectRatio ratio={1}>
                <PlaceholderGameResource game={game} />
              </AspectRatio>
            )}
            <div>
              <div className="flex gap-2 items-center justify-center mb-4">
                <UserContext user={game.author}>
                  <Avatar
                    src={getMediaUrl(game.author.avatarUri)}
                    alt={game.author.username}
                    className="rounded-full"
                    size="sm"
                  />
                </UserContext>
                <Text weight={600} size="sm" color="dimmed">
                  {game.author.username}
                </Text>
              </div>
              <div className="justify-center flex items-center">
                <Badge
                  size="lg"
                  color={game.rating ? getRatingColor(game.rating) : "red"}
                >
                  {game.rating ? game.rating.type : "RP"}
                </Badge>
              </div>
            </div>
          </Group>
        </Card.Section>

        <Badge mb="md">{getGenreText(game.genre)}</Badge>

        <Text weight={700} mb="xl" size="lg">
          {game.name}
        </Text>

        <Card.Section
          className={
            classes.footer + " flex justify-between items-center gap-2"
          }
        >
          <Link href={`/game/${game.id}`} passHref>
            <Button leftIcon={<HiArrowRight />} fullWidth>
              View
            </Button>
          </Link>
          <Button
            color="red"
            className="py-0 px-3"
            onClick={() => setReportOpen(true)}
          >
            <HiFlag />
          </Button>
        </Card.Section>

        <Card.Section
          className={classes.footer + " flex justify-around"}
          withBorder
        >
          {[
            { icon: HiThumbUp, value: game.likedBy.length },
            { icon: HiThumbDown, value: game.dislikedBy.length },
            { icon: HiUserGroup, value: game.visits },
          ].map((item) => (
            <div className="flex items-center gap-2" key={randomId()}>
              <item.icon color={theme.colors.gray[6]} />
              <Text size="sm" weight={600} color="dimmed">
                {item.value}
              </Text>
            </div>
          ))}
        </Card.Section>
      </Card>
    </>
  );
};

export default GameCard;
