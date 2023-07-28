import InventTab from "@/components/invent/invent";
import { User } from "@/util/prisma-types";

interface GameUpdatesProps {
  user: User;
}

const GameUpdates = ({ user }: GameUpdatesProps) => {
  return (
    <InventTab
      tabValue="updates"
      tabTitle="Game Updates"
      unavailable
      tabSubtitle="Game updates are a way to keep your players up to date with the latest changes to your games."
    ></InventTab>
  );
};

export default GameUpdates;
