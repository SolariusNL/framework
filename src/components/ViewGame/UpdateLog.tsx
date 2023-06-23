import { Game } from "../../util/prisma-types";
import ModernEmptyState from "../ModernEmptyState";
import UpdateCard from "../UpdateCard";
import ViewGameTab from "./ViewGameTab";

interface UpdateLogTabProps {
  game: Game;
}

const UpdateLogTab = ({ game }: UpdateLogTabProps) => {
  return (
    <ViewGameTab value="updatelog" title="Update Log">
      {game.updateLogs.length > 0 ? (
        <UpdateCard update={game.updateLogs[0]} />
      ) : (
        <ModernEmptyState
          title="No updates yet"
          body="Updates will appear here when they are posted."
        />
      )}
    </ViewGameTab>
  );
};

export default UpdateLogTab;
