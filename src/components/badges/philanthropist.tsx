import { FC } from "react";
import { HiShoppingBag } from "react-icons/hi";
import Badge, { BaseBadgeProps } from "./badge";

const PhilanthropistBadge: FC<BaseBadgeProps> = ({ user }) => {
  return (
    <Badge
      title="Philanthropist"
      description={`${user.username} has donated 10+ times to other users in the community.`}
      icon={HiShoppingBag}
      color="teal"
    />
  );
};

export default PhilanthropistBadge;
