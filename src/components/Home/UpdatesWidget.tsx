import GameCard from "@/components/GameCard";
import { Section } from "@/components/Home/FriendsWidget";
import LoadingIndicator from "@/components/LoadingIndicator";
import ModernEmptyState from "@/components/ModernEmptyState";
import ShadedCard from "@/components/ShadedCard";
import UpdateCard from "@/components/UpdateCard";
import { Game } from "@/util/prisma-types";
import { Button, Stack } from "@mantine/core";
import { openModal } from "@mantine/modals";
import { GameUpdateLog } from "@prisma/client";
import { getCookie } from "cookies-next";
import Link from "next/link";
import React, { useState } from "react";

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
              <LoadingIndicator />
            </ShadedCard>
          ) : (
            <div className="grid md:grid-cols-4 sm:grid-cols-3 grid-cols-2 gap-4 gap-y-8">
              {gameUpdates.map((game) => (
                <GameCard
                  onClick={() => {
                    openModal({
                      title: `Updates for ${game.name}`,
                      children: (
                        <>
                          <UpdateCard update={game.updateLogs[0]} />
                          <div className="flex justify-end mt-4">
                            <Link href="/game/[id]" as={`/game/${game.id}`}>
                              <Button variant="light" radius="xl">
                                View game
                              </Button>
                            </Link>
                          </div>
                        </>
                      ),
                    });
                  }}
                  game={game}
                  key={game.id}
                />
              ))}
              {gameUpdates.length === 0 && (
                <div className="w-full flex justify-center items-center col-span-full">
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
