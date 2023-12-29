import { FC } from "react";
import { HiUserGroup } from "react-icons/hi";
import Badge, { BaseBadgeProps } from "./badge";

const MaestroBadge: FC<BaseBadgeProps> = ({ user }) => {
  return (
    <Badge
      title="Maestro"
      description={`${user.username} has accumulated 10,000+ place visits.`}
      icon={HiUserGroup}
      color="grape"
    />
  );
};

export default MaestroBadge;
