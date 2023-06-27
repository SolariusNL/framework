import Verified from "@/components/Verified";
import clsx from "@/util/clsx";
import getMediaUrl from "@/util/get-media";
import { User } from "@/util/prisma-types";
import { Avatar } from "@mantine/core";
import Link from "next/link";

type OwnerProps = {
  user: Pick<User, "username" | "alias" | "avatarUri" | "verified">;
  size?: number;
  overrideHref?: string;
} & React.HTMLAttributes<HTMLLIElement>;

const Owner: React.FC<OwnerProps> = ({
  user,
  size,
  overrideHref,
  ...props
}) => {
  return (
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
      <div className="text-sm leading-4">
        <div className="flex items-center gap-1">
          {user.verified && <Verified className="w-[16px] h-[16px]" />}
          <div className="text-slate-900 dark:text-slate-200">
            {user.alias ? user.alias : user.username}
          </div>
        </div>
        <div className="mt-1">
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
};

export default Owner;
