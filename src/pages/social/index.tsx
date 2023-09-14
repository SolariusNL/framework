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
      id: 1,
      username: "Framework",
      alias: "Framework",
      avatarUri: "/avatars/Framework.webp",
      verified: true,
      _count: {
        followers: 0,
        following: 0,
      },
    } as NonUser,
    createdAt: new Date(Date.now() - 128 * 60 * 60 * 1000),
    contentMd: `
🎉 **Coming Soon: Framework Social** 🌟

Get ready for the ultimate social experience on **Framework**! 😃

🌐 **Explore, Connect, Enjoy!**
Framework Social is your all-in-one on-site social platform. No more bouncing around the web. Here, you can:
- 🗨️ **Chat**: Connect with fellow Framework users.
- 🎮 **Game**: Discover cool games.
- 📣 **Advertise**: Promote your projects and ideas.

Stay tuned for the launch on [Framework](https://framework.solarius.me) and take your community to the next level! 🚀 #ComingSoon`,
    _count: {
      hearts: 13,
      shares: 5,
    },
  },
];

const Social: FC<SocialProps> = ({ user }) => {
  return (
    <Framework user={user} activeTab="social" noPadding>
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
