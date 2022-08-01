import { User } from "../../util/prisma-types";
import InventTab from "./InventTab";

interface GameUpdatesProps {
  user: User;
}

const GameUpdates = ({ user }: GameUpdatesProps) => {
  return (
    <InventTab tabValue="updates" tabTitle="Game Updates" unavailable>
    
    </InventTab>
  );
};

export default GameUpdates;