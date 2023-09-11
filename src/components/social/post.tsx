import ShadedButton from "@/components/shaded-button";
import UserContext from "@/components/user-context";
import Verified from "@/components/verified";
import clsx from "@/util/clsx";
import { Fw } from "@/util/fw";
import getMediaUrl from "@/util/get-media";
import { NonUser } from "@/util/prisma-types";
import { getRelativeTime } from "@/util/relative-time";
import { ActionIcon, Avatar, Text } from "@mantine/core";
import dynamic from "next/dynamic";
import Link from "next/link";
import { FC } from "react";
import { HiOutlineDotsVertical, HiOutlineFlag } from "react-icons/hi";

const RenderMarkdown = dynamic(() => import("../render-markdown"), {
  ssr: false,
});

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
    <ShadedButton
      sx={(theme) => ({
        padding: theme.spacing.xs,
        borderRadius: theme.radius.md,
        width: "100%",
        display: "flex",
        transition: "background-color 0.05s ease",
        "&:hover": {
          backgroundColor:
            theme.colorScheme === "dark"
              ? theme.colors.dark[9] + "10"
              : theme.colors.gray[1] + "75",
        },
      })}
    >
      <div className="flex justify-between gap-1 items-start w-full">
        <li className={clsx("flex items-start")}>
          <UserContext user={post.author}>
            <Avatar
              src={getMediaUrl(post.author.avatarUri)}
              alt=""
              className={clsx("mr-3 rounded-full")}
              size={38}
              color={Fw.Strings.color(post.author.username)}
            >
              {Fw.Strings.initials(post.author.username)}
            </Avatar>
          </UserContext>
        </li>
        <div className="flex flex-col gap-1 w-full font-medium">
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
                <a className="text-dimmed no-underline text-sm">
                  @{post.author.username}
                </a>
              </Link>
            </div>
          </div>
          {typeof window !== "undefined" && (
            <RenderMarkdown proseAddons="break-words font-normal">
              {post.contentMd}
            </RenderMarkdown>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            <Text size="sm" color="dimmed">
              {getRelativeTime(post.createdAt)}
            </Text>
          </div>
        </div>
        <div className="flex flex-col flex-shrink-0 items-center gap-2">
          <ActionIcon color="gray" size="lg" radius="xl" variant="light">
            <HiOutlineDotsVertical />
          </ActionIcon>
          <ActionIcon color="red" size="lg" radius="xl" variant="light">
            <HiOutlineFlag />
          </ActionIcon>
        </div>
      </div>
    </ShadedButton>
  );
};

export default SocialPost;
