import { FC } from "react";
import { HiOutlineShieldCheck } from "react-icons/hi";
import Badge, { BaseBadgeProps } from "./badge";

const StaffBadge: FC<BaseBadgeProps> = ({ user }) => {
  return (
    <Badge
      title="Solarius"
      description={`${user.username} is a Solarius employee and is a trusted member of the community.`}
      icon={HiOutlineShieldCheck}
      color="indigo"
    />
  );
};

export default StaffBadge;
