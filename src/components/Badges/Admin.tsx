import { Paper, Text, useMantineTheme } from "@mantine/core";
import { HiOutlineShieldCheck } from "react-icons/hi";
import { User } from "../../util/prisma-types";
import Badge from "./Badge";

const AdminBadge = ({ user }: { user: User }) => {
  const theme = useMantineTheme();
  return (
    <Badge
      title="Framework staff"
      description={`${user.username} is a Framework staff member.`}
      user={user}
      icon={<HiOutlineShieldCheck size={24} color={theme.colors.indigo[4]} />}
    />
  );
};

export default AdminBadge;
