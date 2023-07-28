import { User } from "@/util/prisma-types";
import { HiOutlineClock } from "react-icons/hi";
import Badge from "./badge";

const AlphaBadge = ({ user }: { user: User }) => {
  return (
    <Badge
      title="Alpha"
      description={`${user.username} has been a member of Framework since its alpha period.`}
      user={user}
      icon={HiOutlineClock}
      color="pink"
    />
  );
};

export default AlphaBadge;
