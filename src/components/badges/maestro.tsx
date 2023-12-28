import { FC } from "react";
import { HiKey } from "react-icons/hi";
import Badge, { BaseBadgeProps } from "./badge";

const MaestroBadge: FC<BaseBadgeProps> = ({ user }) => {
  return (
    <Badge
      title="Maestro"
      description={`${user.username} has accumulated 10,000+ place visits.`}
      icon={HiKey}
      color="red"
    />
  );
};

export default MaestroBadge;
