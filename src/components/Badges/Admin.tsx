import { HiOutlineShieldCheck } from "react-icons/hi";
import { User } from "@/util/prisma-types";
import Badge from "./Badge";

const AdminBadge = ({ user }: { user: User }) => {
  return (
    <Badge
      title="Solarius"
      description={`${user.username} is a Framework staff member, and is trusted to help other users.`}
      user={user}
      icon={HiOutlineShieldCheck}
      color="indigo"
    />
  );
};

export default AdminBadge;
