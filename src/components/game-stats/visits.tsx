import { EditableGame } from "@/layouts/edit-game-layout";
import { FC } from "react";
import { HiUserGroup } from "react-icons/hi";
import GameStatCard from "./stat-card";

type VisitsStatProps = {
  game: EditableGame;
};

const VisitsStat: FC<VisitsStatProps> = ({ game }) => {
  return (
    <GameStatCard
      state="increased"
      title="Visits"
      formattedValue={`${game.visits} visits`}
      icon={<HiUserGroup size={24} />}
      tertiaryLabel="Total number of visits to your game"
    />
  );
};

export default VisitsStat;
