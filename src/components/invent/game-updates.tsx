import GameCard from "@/components/game-card";
import InventTab from "@/components/invent/invent";
import ModernEmptyState from "@/components/modern-empty-state";
import ShadedCard from "@/components/shaded-card";
import { Game, User } from "@/util/prisma-types";
import { Text } from "@mantine/core";
import Link from "next/link";

interface GameUpdatesProps {
  user: User;
}

const GameUpdates = ({ user }: GameUpdatesProps) => {
  return (
    <InventTab
      tabValue="updates"
      tabTitle="Game Updates"
      tabSubtitle="Game updates are a way to keep your players up to date with the latest changes to your games."
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
              href="/game/[id]/edit/updates"
              as={`/game/${g.id}/edit/updates`}
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

export default GameUpdates;
