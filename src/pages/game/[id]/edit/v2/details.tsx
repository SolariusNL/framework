import DescriptionGroup from "@/components/game-edit-groups/description";
import GeneralGroup from "@/components/game-edit-groups/general";
import PlatformsGroup from "@/components/game-edit-groups/platforms";
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
      <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4 mb-8">
        <StorageStat game={game} />
        <VisitsStat game={game} />
        <StorageStat game={game} />
      </div>
      <div className="grid md:grid-cols-4 sm:grid-cols-3 grid-cols-1 gap-6">
        <DescriptionGroup className="col-span-2" game={game} />
        <PlatformsGroup game={game} />
        <PlatformsGroup game={game} />
        <GeneralGroup game={game} />
      </div>
    </EditGame>
  );
};

export const getServerSideProps = getEditGameSSP;

export default EditGameDetails;
