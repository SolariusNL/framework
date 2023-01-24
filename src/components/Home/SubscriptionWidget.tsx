import { Avatar, Text } from "@mantine/core";
import { getCookie } from "cookies-next";
import Link from "next/link";
import { useEffect, useState } from "react";
import { HiThumbDown, HiThumbUp } from "react-icons/hi";
import getMediaUrl from "../../util/getMedia";
import { Game } from "../../util/prisma-types";
import ShadedButton from "../ShadedButton";
import { Section } from "./FriendsWidget";

const SubscriptionWidget: React.FC = () => {
  const [games, setGames] = useState<
    Array<
      Game & {
        _count: {
          likedBy: number;
          dislikedBy: number;
        };
      }
    >
  >([]);

  const fetchRecommendedGames = async () => {
    await fetch("/api/dashboard/recommended/games", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    })
      .then((res) => res.json())
      .then((data) => setGames(data));
  };

  useEffect(() => {
    fetchRecommendedGames();
  }, []);

  return (
    <>
      <Section title="Recommended games" description="Games you might like." />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {games.map((game, i) => (
          <Link href={`/games/${game.id}`} key={i}>
            <ShadedButton className="w-full flex flex-col">
              <Text size="lg" weight={500}>
                {game.name}
              </Text>
              <Text size="sm" color="dimmed" lineClamp={2} mb="md">
                {game.description.replace(/(<([^>]+)>)/gi, " ")}
              </Text>
              <div className="flex justify-between items-center w-full">
                <div className="flex gap-2 items-center">
                  {[
                    {
                      icon: <HiThumbUp size={14} className="text-gray-400" />,
                      text: game._count.likedBy,
                    },
                    {
                      icon: <HiThumbDown size={14} className="text-gray-400" />,
                      text: game._count.dislikedBy,
                    },
                  ].map((item, i) => (
                    <div className="flex items-center gap-1" key={i}>
                      {item.icon}
                      <Text size="sm" color="dimmed">
                        {item.text}
                      </Text>
                    </div>
                  ))}
                </div>
                <Avatar src={getMediaUrl(game.author.avatarUri)} size={20} />
              </div>
            </ShadedButton>
          </Link>
        ))}
      </div>
    </>
  );
};

export default SubscriptionWidget;
