import Solarius from "@/icons/Solarius";
import { FC } from "react";
import Badge, { BaseBadgeProps } from "./badge";

const StaffBadge: FC<BaseBadgeProps> = ({ user }) => {
  return (
    <Badge
      title="Solarius"
      description={`${user.username} is a Solarius employee and is a trusted member of the community.`}
      icon={<Solarius className="w-[24px] h-[24px] p-[2px] />" />}
      color="indigo"
    />
  );
};

export default StaffBadge;
