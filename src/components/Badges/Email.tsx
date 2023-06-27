import { useMantineTheme } from "@mantine/core";
import { HiCheck, HiOutlineSparkles } from "react-icons/hi";
import { User } from "@/util/prisma-types";
import Badge from "./Badge";

const EmailBadge = ({ user }: { user: User }) => {
  const theme = useMantineTheme();
  return (
    <Badge
      title="Email verified"
      description={`${user.username} has verified their email address.`}
      user={user}
      icon={HiCheck}
      color="orange"
    />
  );
};

export default EmailBadge;
