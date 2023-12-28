import { FC } from "react";
import { HiOutlineClock } from "react-icons/hi";
import Badge, { BaseBadgeProps } from "./badge";

const AlphaBadge: FC<BaseBadgeProps> = ({ user }) => {
  return (
    <Badge
      title="Alpha"
      description={`${user.username} has been a member of Framework after December 27, 2023 when it entered alpha.`}
      icon={HiOutlineClock}
      color="pink"
    />
  );
};

export default AlphaBadge;
