import { HiKey } from "react-icons/hi";
import { User } from "@/util/prisma-types";
import Badge from "./Badge";

const TOTPBadge = ({ user }: { user: User }) => {
  return (
    <Badge
      title="TOTP enabled"
      description={`${user.username} has enabled TOTP two-factor authentication.`}
      user={user}
      icon={HiKey}
      color="red"
    />
  );
};

export default TOTPBadge;
