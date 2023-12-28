import Badge, { BaseBadgeProps } from "@/components/badges/badge";
import { FC } from "react";
import { HiOutlineClock } from "react-icons/hi";

const PreAlphaBadge: FC<BaseBadgeProps> = ({ user }) => {
  return (
    <Badge
      title="Pre-Alpha"
      description={`${user.username} has been a member of Framework before December 27, 2023 when it entered alpha.`}
      icon={HiOutlineClock}
      color="pink"
    />
  );
};

export default PreAlphaBadge;
