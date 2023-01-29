import { Anchor, Text } from "@mantine/core";
import { GameUpdateLog } from "@prisma/client";
import { getCookie } from "cookies-next";
import Link from "next/link";
import React from "react";
import { Game } from "../../util/prisma-types";
import ShadedCard from "../ShadedCard";
import UpdateCard from "../UpdateCard";
import { Section } from "./FriendsWidget";

const UpdatesWidget: React.FC = () => {
  const [gameUpdates, setGameUpdates] = React.useState<
    Array<Game & { updateLogs: Array<GameUpdateLog> }>
  >([]);

  const getUpdates = async () => {
    await fetch("/api/games/updates/following", {
      headers: {
        Authorization: String(getCookie(".frameworksession")),
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setGameUpdates(res);
      });
  };

  React.useEffect(() => {
    getUpdates();
  }, []);

  return (
    <>
      <Section title="Updates" description="Updates from games you follow." />
      <ShadedCard>
        {gameUpdates.map((game) => (
          <div key={game.id}>
            <div className="flex items-center gap-2 mb-3">
              <Link href={`/game/${game.id}`}>
                <Anchor size="sm" color="dimmed">
                  {game.name}
                </Anchor>
              </Link>
            </div>
            <UpdateCard update={game.updateLogs[0]} light />
          </div>
        ))}
      </ShadedCard>
    </>
  );
};

export default UpdatesWidget;
