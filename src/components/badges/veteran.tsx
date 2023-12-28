import { FC } from "react";
import { HiCalendar } from "react-icons/hi";
import Badge, { BaseBadgeProps } from "./badge";

const VeteranBadge: FC<BaseBadgeProps> = ({ user }) => {
  return (
    <Badge
      title="Veteran"
      description={`${user.username} has been a Framework member for over a year.`}
      icon={HiCalendar}
      color="red"
    />
  );
};

export default VeteranBadge;
