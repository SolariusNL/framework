import AlphaBadge from "@/components/badges/alpha";
import { BaseBadgeProps } from "@/components/badges/badge";
import MaestroBadge from "@/components/badges/maestro";
import PreAlphaBadge from "@/components/badges/pre-alpha";
import PremiumBadge from "@/components/badges/premium";
import ScripterBadge from "@/components/badges/scripter";
import StaffBadge from "@/components/badges/staff";
import VeteranBadge from "@/components/badges/veteran";
import WandererBadge from "@/components/badges/wanderer";
import { NonUser } from "@/util/prisma-types";
import { Badge } from "@prisma/client";
import { FC } from "react";

type ProfileBadges = {
  user: NonUser;
};

const badgeComponents: Record<Badge, React.FC<BaseBadgeProps>> = {
  [Badge.PRE_ALPHA]: PreAlphaBadge,
  [Badge.ALPHA]: AlphaBadge,
  [Badge.STAFF]: StaffBadge,
  [Badge.PREMIUM]: PremiumBadge,
  [Badge.VETERAN]: VeteranBadge,
  [Badge.WANDERER]: WandererBadge,
  [Badge.SCRIPTER]: ScripterBadge,
  [Badge.MAESTRO]: MaestroBadge,
};

const ProfileBadges: FC<ProfileBadges> = ({ user }) => {
  const badgeList = user.badges.map((badge) => {
    const BadgeComponent = badgeComponents[badge];
    return <BadgeComponent user={user} key={badge} />;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">{badgeList}</div>
  );
};

export default ProfileBadges;
