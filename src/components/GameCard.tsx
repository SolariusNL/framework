import {
  AspectRatio,
  Avatar,
  Badge,
  Card,
  Image,
  MantineColor,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { randomId } from "@mantine/hooks";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { HiThumbUp, HiUsers } from "react-icons/hi";
import getMediaUrl from "../util/getMedia";
import { Game } from "../util/prisma-types";
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

const GameCard = ({ game }: GameCardProps) => {
  const theme = useMantineTheme();
  const [reportOpen, setReportOpen] = useState(false);

  return (
    <>
      <ReportUser
        user={game.author}
        opened={reportOpen}
        setOpened={setReportOpen}
      />
      <Link href={`/game/${game.id}`} passHref>
        <Card
          radius="md"
          sx={{
            backgroundColor: "transparent",
            cursor: "pointer",
            overflow: "visible",
            transition: "transform 0.1s",
            transform: "scale(1)",
            "&:hover": {
              transform: "scale(1.02)",
            },
          }}
          component="a"
          p={0}
        >
          <Card.Section mb="md">
            {game.iconUri ? (
              <AspectRatio ratio={1}>
                <Image
                  src={getMediaUrl(game.iconUri)}
                  alt={game.name}
                  radius={theme.radius.md}
                  withPlaceholder
                />
              </AspectRatio>
            ) : (
              <AspectRatio ratio={1}>
                <PlaceholderGameResource game={game} />
              </AspectRatio>
            )}
          </Card.Section>
          <div className="flex justify-between mb-4">
            <Title order={4}>{game.name}</Title>
            <UserContext user={game.author}>
              <Avatar
                src={getMediaUrl(game.author.avatarUri)}
                size={20}
                radius="xl"
              />
            </UserContext>
          </div>
          <div className="flex justify-around w-full">
            <div>
              <Badge color={game.rating ? getRatingColor(game.rating) : "red"}>
                {game.rating ? game.rating.type : "RP"}
              </Badge>
            </div>
            <div className="flex flex-col gap-2 text-right">
              {[
                [
                  HiThumbUp,
                  `${(
                    (game.likedBy.length /
                      (game.likedBy.length + game.dislikedBy.length)) *
                      100 || 100
                  ).toFixed(0)}%`,
                ],
                [HiUsers, `${game.playing}`],
              ].map(([Icon, value]) => (
                <div className="flex items-center justify-end" key={randomId()}>
                  <Icon size={16} color="#868e96" />
                  <Text size="sm" color="dimmed" ml={5}>
                    {String(value)}
                  </Text>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </Link>
    </>
  );
};

export default GameCard;
