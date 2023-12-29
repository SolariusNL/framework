import Badge, { BaseBadgeProps } from "@/components/badges/badge";
import Rocket from "@/icons/Rocket";
import { useMantineTheme } from "@mantine/core";
import { FC } from "react";

const PreAlphaBadge: FC<BaseBadgeProps> = ({ user }) => {
  const { colors } = useMantineTheme();
  return (
    <Badge
      title="Pre-Alpha"
      description={`${user.username} has been a member of Framework before December 27, 2023 when it entered alpha.`}
      icon={
        <Rocket
          className="w-[24px] h-[24px] p-[2px]"
          color={colors.indigo[5]}
        />
      }
      color="pink"
    />
  );
};

export default PreAlphaBadge;
