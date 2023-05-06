import { Loader, Stack } from "@mantine/core";
import { openModal } from "@mantine/modals";
import { GameUpdateLog } from "@prisma/client";
import { getCookie } from "cookies-next";
import React, { useState } from "react";
import { Game } from "../../util/prisma-types";
import GameCard from "../GameCard";
import ModernEmptyState from "../ModernEmptyState";
import ShadedCard from "../ShadedCard";
import UpdateCard from "../UpdateCard";
import { Section } from "./FriendsWidget";

const UpdatesWidget: React.FC = () => {
  const [gameUpdates, setGameUpdates] = React.useState<
    Array<Game & { updateLogs: Array<GameUpdateLog> }>
  >([]);
  const [loading, setLoading] = useState(true);

  const getUpdates = async () => {
    setLoading(true);
    await fetch("/api/games/updates/following", {
      headers: {
        Authorization: String(getCookie(".frameworksession")),
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setGameUpdates(res);
      })
      .finally(() => setLoading(false));
  };

  React.useEffect(() => {
    getUpdates();
  }, []);

  return (
    <>
      <Section title="Updates" description="Updates from games you follow." />
      <ShadedCard>
        <Stack spacing={24}>
          {loading ? (
            <ShadedCard className="w-full flex justify-center items-center">
              <Loader />
            </ShadedCard>
          ) : (
            <div className="grid md:grid-cols-4 sm:grid-cols-3 grid-cols-2 gap-4 gap-y-8">
              {gameUpdates.map((game) => (
                <GameCard
                  onClick={() => {
                    openModal({
                      title: `Updates for ${game.name}`,
                      children: <UpdateCard update={game.updateLogs[0]} />,
                    });
                  }}
                  game={game}
                  key={game.id}
                />
              ))}
              {gameUpdates.length === 0 && (
                <div className="w-full flex justify-center items-center">
                  <ModernEmptyState
                    title="No updates"
                    body="No updates to show."
                  />
                </div>
              )}
            </div>
          )}
        </Stack>
      </ShadedCard>
    </>
  );
};

export default UpdatesWidget;
