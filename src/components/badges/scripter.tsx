import { FC } from "react";
import { HiKey } from "react-icons/hi";
import Badge, { BaseBadgeProps } from "./badge";

const ScripterBadge: FC<BaseBadgeProps> = ({ user }) => {
  return (
    <Badge
      title="Scripter"
      description={`${user.username} has accumulated 1,000+ place visits.`}
      icon={HiKey}
      color="red"
    />
  );
};

export default ScripterBadge;
