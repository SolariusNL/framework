import { FC } from "react";
import { HiOutlineUserGroup } from "react-icons/hi";
import Badge, { BaseBadgeProps } from "./badge";

const ScripterBadge: FC<BaseBadgeProps> = ({ user }) => {
  return (
    <Badge
      title="Scripter"
      description={`${user.username} has accumulated 1,000+ place visits.`}
      icon={HiOutlineUserGroup}
      color="violet"
    />
  );
};

export default ScripterBadge;
