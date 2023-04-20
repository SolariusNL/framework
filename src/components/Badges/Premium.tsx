import { HiOutlineSparkles } from "react-icons/hi";
import { User } from "../../util/prisma-types";
import Badge from "./Badge";

const PremiumBadge = ({ user }: { user: User }) => {
  return (
    <Badge
      title="Premium"
      description={`${user.username} is currently a Framework Premium subscriber.`}
      user={user}
      icon={HiOutlineSparkles}
      color="grape"
    />
  );
};

export default PremiumBadge;
