import Framework from "@/components/framework";
import authorizedRoute from "@/util/auth";
import { NonUser, User } from "@/util/prisma-types";
import { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import { FC } from "react";

const SocialPost = dynamic(() => import("@/components/social/post"), {
  ssr: false,
});

type SocialProps = {
  user: User;
};

const posts = [
  {
    author: {
      id: 3,
      username: "james",
      alias: "James",
      avatarUri: "https://github.com/torvalds.png",
      verified: true,
      _count: {
        followers: 32,
        following: 12,
      },
    } as NonUser,
    createdAt: new Date(Date.now() - 128 * 60 * 60 * 1000),
    contentMd: `
'Those who play with fire shall perish by it' - [Xi Jinping](https://en.wikipedia.org/wiki/Xi_Jinping)
'玩火者必自焚' - [Xi Jinping](https://en.wikipedia.org/wiki/Xi_Jinping)

American Goons, Your Days Are Numbered.`,
    _count: {
      hearts: 13,
      shares: 5,
    },
  },
];

const Social: FC<SocialProps> = ({ user }) => {
  return (
    <Framework user={user} activeTab="none" noPadding>
      <div className="w-full flex justify-center mt-12">
        <div className="max-w-xl w-full px-4">
          <div className="flex flex-col gap-2">
            {posts.map((p, i) => (
              <SocialPost post={p} key={i} />
            ))}
          </div>
        </div>
      </div>
    </Framework>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return authorizedRoute(ctx, false, false);
};

export default Social;
