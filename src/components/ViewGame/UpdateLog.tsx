import { Game } from "../../util/prisma-types";
import UpdateCard from "../UpdateCard";
import ViewGameTab from "./ViewGameTab";

interface UpdateLogTabProps {
  game: Game;
}

const UpdateLogTab = ({ game }: UpdateLogTabProps) => {
  return (
    <ViewGameTab value="updatelog" title="Update Log">
      {game.updateLogs.length > 0 ? (
        <UpdateCard update={game.updateLogs[0]} light />
      ) : null}
    </ViewGameTab>
  );
};

export default UpdateLogTab;
