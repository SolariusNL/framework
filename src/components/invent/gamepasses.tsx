import InventTab from "@/components/invent/invent";
import ModernEmptyState from "@/components/modern-empty-state";
import { User } from "@/util/prisma-types";
import { Gamepass } from "@prisma/client";

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
      <ModernEmptyState
        title="Deprecated"
        body="This page is deprecated and will be removed in the future."
      />
    </InventTab>
  );
};

export default GamePasses;
