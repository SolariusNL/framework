import PlaceholderGameResource from "@/components/PlaceholderGameResource";
import ReportUser from "@/components/ReportUser";
import getMediaUrl from "@/util/get-media";
import { Game } from "@/util/prisma-types";
import { getRatingColor } from "@/util/universe/ratings";
import {
  AspectRatio,
  Avatar,
  Badge,
  Card,
  Image,
  MantineColor,
  Text,
  Title,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { randomId } from "@mantine/hooks";
import Link from "next/link";
import { useState } from "react";
import { HiThumbUp, HiUsers } from "react-icons/hi";

interface GameCardProps {
  game: Game;
  onClick?: () => void;
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

const GameCard = ({ game, onClick }: GameCardProps) => {
  const theme = useMantineTheme();
  const [reportOpen, setReportOpen] = useState(false);

  const CardItem = (
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
        "&:active": {
          transform: "scale(0.98)",
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
              className="w-full h-full object-cover rounded-md"
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
        <Tooltip
          label={game.team ? game.team.name : game.author.username}
          zIndex={10000}
        >
          <Avatar
            src={
              game.team
                ? getMediaUrl(game.team.iconUri)
                : getMediaUrl(game.author.avatarUri)
            }
            size={20}
            radius="xl"
          />
        </Tooltip>
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
  );

  return (
    <>
      <ReportUser
        user={game.author}
        opened={reportOpen}
        setOpened={setReportOpen}
      />
      {onClick ? (
        <div onClick={onClick}>{CardItem}</div>
      ) : (
        <Link href={`/game/${game.id}`} passHref>
          {CardItem}
        </Link>
      )}
    </>
  );
};

export default GameCard;
