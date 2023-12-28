import { FC } from "react";
import { HiKey } from "react-icons/hi";
import Badge, { BaseBadgeProps } from "./badge";

const WandererBadge: FC<BaseBadgeProps> = ({ user }) => {
  return (
    <Badge
      title="Wanderer"
      description={`${user.username} has accumulated 100+ place visits.`}
      icon={HiKey}
      color="red"
    />
  );
};

export default WandererBadge;
