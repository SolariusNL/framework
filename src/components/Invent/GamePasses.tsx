import { User } from "../../util/prisma-types";
import InventTab from "./InventTab";

interface GamePassesProps {
  user: User;
}

const GamePasses = ({ user }: GamePassesProps) => {
  return (
    <InventTab tabValue="gamepasses" tabTitle="Game Passes" unavailable>
    
    </InventTab>
  );
};

export default GamePasses;