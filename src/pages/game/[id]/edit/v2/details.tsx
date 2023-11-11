import EditGame, {
  EditGameRoutes,
  EditableGamePageProps,
} from "@/layouts/edit-game-layout";
import { getEditGameSSP } from "@/util/edit-game";
import { FC } from "react";

const EditGameDetails: FC<EditableGamePageProps> = ({ game, user }) => {
  return (
    <EditGame game={game} user={user} activePage={EditGameRoutes.Details}>
      <p>Test</p>
    </EditGame>
  );
};

export const getServerSideProps = getEditGameSSP;

export default EditGameDetails;
