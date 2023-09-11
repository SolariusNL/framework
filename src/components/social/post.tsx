import ShadedButton from "@/components/shaded-button";
import clsx from "@/util/clsx";
import getMediaUrl from "@/util/get-media";
import { NonUser } from "@/util/prisma-types";
import { ActionIcon, Avatar } from "@mantine/core";
import Link from "next/link";
import { FC } from "react";
import { HiOutlineDotsVertical, HiOutlineFlag } from "react-icons/hi";
import Verified from "../verified";

type SocialPostProps = {
  post: SocialPost;
};
type SocialPost = {
  author: NonUser;
  createdAt: Date;
  contentMd: string;
  _count: {
    hearts: number;
    shares: number;
  };
};

const SocialPost: FC<SocialPostProps> = ({ post }) => {
  return (
    <ShadedButton>
      <div className="flex w-full justify-between gap-4 items-start">
        <li className={clsx("flex items-start font-medium whitespace-nowrap")}>
          <Avatar
            src={getMediaUrl(post.author.avatarUri)}
            alt=""
            className={clsx("mr-3 rounded-full")}
            size={38}
          />
          <div className={clsx("leading-4 flex items-center gap-2 text-base")}>
            <div className={clsx("flex items-center gap-1 flex-row-reverse")}>
              {post.author.verified && (
                <Verified className="w-[16px] h-[16px]" />
              )}
              <div className="text-slate-900 dark:text-slate-200">
                {post.author.alias ? post.author.alias : post.author.username}
              </div>
            </div>
            <div>
              <Link href={`/profile/${post.author.username}`} passHref>
                <a className="text-dimmed no-underline">
                  @{post.author.username}
                </a>
              </Link>
            </div>
          </div>
        </li>
        <div className="flex items-center gap-2">
          <ActionIcon color="red" size="lg" radius="xl" variant="light">
            <HiOutlineFlag />
          </ActionIcon>
          <ActionIcon color="gray" size="lg" radius="xl" variant="light">
            <HiOutlineDotsVertical />
          </ActionIcon>
        </div>
      </div>
    </ShadedButton>
  );
};

export default SocialPost;
