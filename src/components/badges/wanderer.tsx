import { FC } from "react";
import { HiUsers } from "react-icons/hi";
import Badge, { BaseBadgeProps } from "./badge";

const WandererBadge: FC<BaseBadgeProps> = ({ user }) => {
  return (
    <Badge
      title="Wanderer"
      description={`${user.username} has accumulated 100+ place visits.`}
      icon={HiUsers}
      color="pink"
    />
  );
};

export default WandererBadge;
