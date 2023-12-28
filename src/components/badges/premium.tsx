import { FC } from "react";
import { HiOutlineSparkles } from "react-icons/hi";
import Badge, { BaseBadgeProps } from "./badge";

const PremiumBadge: FC<BaseBadgeProps> = ({ user }) => {
  return (
    <Badge
      title="Premium"
      description={`${user.username} is a Framework Premium subscriber.`}
      icon={HiOutlineSparkles}
      color="grape"
    />
  );
};

export default PremiumBadge;
