import { Game } from "../../util/prisma-types";
import ViewGameTab from "./ViewGameTab";

interface UpdateLogTabProps {
  game: Game;
}

const UpdateLogTab = ({ game }: UpdateLogTabProps) => {
  return (
    <ViewGameTab value="updatelog" title="Update Log">
      <></>
    </ViewGameTab>
  );
};

export default UpdateLogTab;
