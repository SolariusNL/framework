import Framework from "@/components/framework";
import SidebarTabNavigation from "@/layouts/SidebarTabNavigation";
import {
  GetSocialPostsResponse,
  SocialPost,
} from "@/pages/api/social/[[...params]]";
import authorizedRoute from "@/util/auth";
import fetchJson from "@/util/fetch";
import { User } from "@/util/prisma-types";
import { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import { FC, useEffect, useState } from "react";

const SocialPost = dynamic(() => import("@/components/social/post"), {
  ssr: false,
});

type SocialProps = {
  user: User;
};

const Social: FC<SocialProps> = ({ user }) => {
  const [posts, setPosts] = useState<SocialPost[]>([]);

  const fetchSocialPosts = async () => {
    await fetchJson<GetSocialPostsResponse>("/api/social", {
      method: "GET",
      auth: true,
    }).then((res) => setPosts(res.data?.posts!));
  };

  useEffect(() => {
    fetchSocialPosts();
  }, []);

  return (
    <Framework user={user} activeTab="social" noPadding>
      <SidebarTabNavigation>
        <SidebarTabNavigation.Sidebar>
          <code>Todo add filters</code>
        </SidebarTabNavigation.Sidebar>
        <SidebarTabNavigation.Content>
          <div className="w-full flex justify-center mt-12">
            <div className="max-w-xl w-full px-4">
              <div className="flex flex-col gap-2">
                {posts?.length > 0 &&
                  posts.map((p, i) => <SocialPost post={p} key={i} />)}
              </div>
            </div>
          </div>
        </SidebarTabNavigation.Content>
      </SidebarTabNavigation>
    </Framework>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  return authorizedRoute(ctx, false, false);
};

export default Social;
