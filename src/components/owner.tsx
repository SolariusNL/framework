import Verified from "@/components/verified";
import clsx from "@/util/clsx";
import getMediaUrl from "@/util/get-media";
import { NonUser, User } from "@/util/prisma-types";
import { Avatar } from "@mantine/core";
import Link from "next/link";
import UserContext from "./user-context";

type OwnerProps = {
  user: Pick<User, "username" | "alias" | "avatarUri" | "verified"> & {
    _count?: {
      followers: number;
      following: number;
    };
  };
  size?: number;
  overrideHref?: string;
  inline?: boolean;
} & React.HTMLAttributes<HTMLLIElement>;

const Owner: React.FC<OwnerProps> = ({
  user,
  size,
  overrideHref,
  inline,
  ...props
}) => {
  const item = (
    <li
      key={user.username}
      className={clsx(
        "flex items-center font-medium whitespace-nowrap",
        props.className
      )}
    >
      <Avatar
        src={getMediaUrl(user.avatarUri)}
        alt=""
        className={clsx("mr-3 rounded-full")}
        size={size ?? 38}
      />
      <div
        className={clsx(
          "text-sm leading-4",
          inline && "flex items-center gap-2 text-base"
        )}
      >
        <div className={clsx(
          "flex items-center gap-1",
          inline && "flex-row-reverse"
        )}>
          {user.verified && <Verified className="w-[16px] h-[16px]" />}
          <div className="text-slate-900 dark:text-slate-200">
            {user.alias ? user.alias : user.username}
          </div>
        </div>
        <div className={clsx(!inline && "mt-1")}>
          <Link
            href={overrideHref ? overrideHref : `/profile/${user.username}`}
            passHref
          >
            <a className="text-sky-500 hover:text-sky-600 dark:text-sky-400 no-underline">
              @{user.username}
            </a>
          </Link>
        </div>
      </div>
    </li>
  );

  return user._count ? (
    <UserContext user={user as NonUser}>
      <>{item}</>
    </UserContext>
  ) : (
    <>{item}</>
  );
};

export default Owner;
