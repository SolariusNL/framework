import { Paper, Text, useMantineTheme } from "@mantine/core";
import { HiOutlineSparkles } from "react-icons/hi";
import { User } from "../../util/prisma-types";
import Badge from "./Badge";

const PremiumBadge = ({ user }: { user: User }) => {
  const theme = useMantineTheme();
  return (
    <Badge
      title="Premium subscriber"
      description={`${user.username} is currently subscribed to Framework Premium.`}
      user={user}
      icon={<HiOutlineSparkles size={24} color={theme.colors.grape[7]} />}
    />
  );
};

export default PremiumBadge;
