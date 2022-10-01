import { Game } from "../../util/prisma-types";
import ModernEmptyState from "../ModernEmptyState";
import EditGameTab from "./EditGameTab";

interface FundingProps {
  game: Game;
}

const Funding = ({ game }: FundingProps) => {
  return (
    <EditGameTab value="funding">
      <ModernEmptyState
        title="Coming soon"
        body="This feature is coming soon."
      />
    </EditGameTab>
  );
};

export default Funding;
