import { FC } from "react";
import FrameworkLogo from "../framework-logo";
import Badge, { BaseBadgeProps } from "./badge";

const PremiumBadge: FC<BaseBadgeProps> = ({ user }) => {
  return (
    <Badge
      title="Premium"
      description={`${user.username} is a Framework Premium subscriber.`}
      icon={<FrameworkLogo square className="w-[24px] h-[24px]" />}
      color="grape"
    />
  );
};

export default PremiumBadge;
