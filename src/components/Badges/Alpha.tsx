import { HiOutlineClock } from "react-icons/hi";
import { User } from "../../util/prisma-types";
import Badge from "./Badge";

const AlphaBadge = ({ user }: { user: User }) => {
  return (
    <Badge
      title="Alpha member"
      description={`${user.username} has been a member of Framework since its alpha period.`}
      user={user}
      icon={HiOutlineClock}
      color="pink"
    />
  );
};

export default AlphaBadge;
