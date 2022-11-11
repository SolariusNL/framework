import {
  AspectRatio,
  Avatar,
  Image,
  MantineColor,
  Paper,
  Text,
  useMantineColorScheme,
} from "@mantine/core";
import Link from "next/link";
import { HiThumbDown, HiThumbUp, HiUsers } from "react-icons/hi";
import { Game } from "../util/prisma-types";
import { motion } from "framer-motion";

interface GameCardProps {
  game: Game;
}

const GameCard = ({ game }: GameCardProps) => {
  const { colorScheme } = useMantineColorScheme();

  const gradientPairs: Array<[MantineColor, MantineColor]> = [
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

  return (
    <Link href="/game/[id]" as={`/game/${game.id}`} passHref>
      <motion.div whileHover={{ scale: 1.03 }}>
        <div className="overflow-hidden cursor-pointer">
          <div>
            <div className="relative">
              <AspectRatio ratio={16 / 9}>
                {game.gallery.length > 0 ? (
                  <Image
                    src={game.gallery[0]}
                    alt={game.name}
                    className="object-cover rounded-lg"
                    imageProps={{
                      style: {
                        filter: "brightness(0.8)",
                      },
                    }}
                  />
                ) : (
                  <Paper
                    sx={(theme) => ({
                      backgroundImage: theme.fn.gradient({
                        from: gradientPairs[game.id % gradientPairs.length][0],
                        to: gradientPairs[game.id % gradientPairs.length][1],
                      }),
                    })}
                    className="rounded-lg"
                  />
                )}
              </AspectRatio>
              <div className="absolute -bottom-12 left-4">
                {game.iconUri ? (
                  <Avatar
                    src={game.iconUri}
                    alt={game.name}
                    size="sm"
                    className="mr-2 w-24 h-24 shadow-lg"
                    radius="lg"
                  />
                ) : (
                  <Paper
                    sx={(theme) => ({
                      backgroundImage: theme.fn.gradient({
                        from: gradientPairs[
                          Math.floor(Math.random() * gradientPairs.length)
                        ][0],
                        to: gradientPairs[
                          Math.floor(Math.random() * gradientPairs.length)
                        ][1],
                      }),
                    })}
                    className="w-24 h-24 shadow-lg"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between ml-32 mt-3">
            <div>
              <div className="flex items-center">
                <Text size="lg" weight={700} className="mr-2 overflow-hidden">
                  {game.name}
                </Text>
              </div>
              <div className="flex items-center mt-2 justify-between">
                {[
                  { icon: HiThumbUp, value: game.likedBy.length },
                  { icon: HiThumbDown, value: game.dislikedBy.length },
                  { icon: HiUsers, value: game.visits },
                ].map((stat) => (
                  <div
                    key={stat.value}
                    className="flex items-center justify-center"
                  >
                    <div className="flex items-center">
                      <stat.icon
                        className="mr-2"
                        color={colorScheme === "dark" ? "#909296" : "#868e96"}
                      />
                      <Text size="sm" weight={500} color="dimmed">
                        {stat.value}
                      </Text>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default GameCard;
