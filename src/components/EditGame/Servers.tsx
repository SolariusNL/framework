import { Game } from "../../util/prisma-types";
import ModernEmptyState from "../ModernEmptyState";
import EditGameTab from "./EditGameTab";

interface ServersProps {
  game: Game;
}

const Servers = ({ game }: ServersProps) => {
  return (
    <EditGameTab value="servers">
      <ModernEmptyState
        title="Coming soon"
        body="This feature is coming soon."
      />
    </EditGameTab>
  );
};

export default Servers;
