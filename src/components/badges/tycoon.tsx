import { FC } from "react";
import { HiCurrencyDollar } from "react-icons/hi";
import Badge, { BaseBadgeProps } from "./badge";

const TycoonBadge: FC<BaseBadgeProps> = ({ user }) => {
  return (
    <Badge
      title="Tycoon"
      description={`${user.username} has amassed over 1,000,000T$ in their account.`}
      icon={HiCurrencyDollar}
      color="green"
    />
  );
};

export default TycoonBadge;
