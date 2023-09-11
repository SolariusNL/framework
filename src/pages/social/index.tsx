import Framework from "@/components/framework";
import SocialPost from "@/components/social/post";
import authorizedRoute from "@/util/auth";
import { NonUser, User } from "@/util/prisma-types";
import { GetServerSideProps } from "next";
import { FC } from "react";

type SocialProps = {
  user: User;
};

const posts = [
  {
    author: {
      id: 3,
      username: "thebaristabarnyc",
      alias: "BaristaBar",
      avatarUri: "https://github.com/torvalds.png",
      verified: true,
    } as NonUser,
    createdAt: new Date(),
    contentMd: "**hello**, world! *test*",
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
