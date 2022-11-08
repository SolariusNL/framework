import {
  AspectRatio,
  Avatar,
  Image,
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
  return (
    <Link href={`/game/${game.id}`}>
      <motion.div whileHover={{ scale: 1.03 }}>
        <div className="overflow-hidden cursor-pointer">
          <div>
            <div className="relative">
              <AspectRatio ratio={16 / 9}>
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
              </AspectRatio>
              <div className="absolute -bottom-12 left-4">
                <Avatar
                  src={game.iconUri}
                  alt={game.name}
                  size="sm"
                  className="mr-2 w-24 h-24 shadow-lg"
                  radius="md"
                />
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
