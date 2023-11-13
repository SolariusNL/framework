import StorageStat from "@/components/game-stats/storage";
import VisitsStat from "@/components/game-stats/visits";
import EditGame, {
  EditGameRoutes,
  EditableGamePageProps,
} from "@/layouts/edit-game-layout";
import { getEditGameSSP } from "@/util/edit-game";
import { FC } from "react";

const EditGameDetails: FC<EditableGamePageProps> = ({ game, user }) => {
  return (
    <EditGame game={game} user={user} activePage={EditGameRoutes.Details}>
      <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
        <StorageStat game={game} />
        <VisitsStat game={game} />
      </div>
    </EditGame>
  );
};

export const getServerSideProps = getEditGameSSP;

export default EditGameDetails;
