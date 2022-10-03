import { Game } from "../../util/prisma-types";
import ViewGameTab from "./ViewGameTab";

interface ServersTab {
  game: Game;
}

const ServersTab = ({ game }: ServersTab) => {
  return (
    <ViewGameTab value="servers" title="Servers">
      <></>
    </ViewGameTab>
  );
};

export default ServersTab;
