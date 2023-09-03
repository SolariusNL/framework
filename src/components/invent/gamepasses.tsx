import GameCard from "@/components/game-card";
import InventTab from "@/components/invent/invent";
import ModernEmptyState from "@/components/modern-empty-state";
import ShadedCard from "@/components/shaded-card";
import { Game, User } from "@/util/prisma-types";
import { Text } from "@mantine/core";
import { Gamepass } from "@prisma/client";
import Link from "next/link";

interface GamePassesProps {
  user: User;
}

type GamepassWithOwners = Gamepass & {
  owners: Array<{ id: number }>;
};

const GamePasses = ({ user }: GamePassesProps) => {
  return (
    <InventTab
      tabValue="gamepasses"
      tabTitle="Game Passes"
      tabSubtitle="Game passes are a way to sell additional content for your games, for example, access to limited-time items or exclusive features."
    >
      <Text size="sm" color="dimmed" mb="sm">
        Choose a game to manage its game passes.
      </Text>
      <div className="grid md:grid-cols-4 sm:grid-cols-3 grid-cols-2 gap-4 gap-y-8">
        {user.games.length === 0 ? (
          <ShadedCard className="col-span-full">
            <ModernEmptyState
              title="No games"
              body="You don't have any games yet. Create one to get started."
            />
          </ShadedCard>
        ) : (
          user.games.map((g, i) => (
            <Link
              href="/game/[id]/edit/store"
              as={`/game/${g.id}/edit/store`}
              key={i}
            >
              <GameCard game={g as Game} />
            </Link>
          ))
        )}
      </div>
    </InventTab>
  );
};

export default GamePasses;
