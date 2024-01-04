import IResponseBase from "@/types/api/IResponseBase";
import Authorized from "@/util/api/authorized";
import prisma from "@/util/prisma";
import { NonUser, nonCurrentUserSelect } from "@/util/prisma-types";
import { SocialPost as SocialPostEx } from "@prisma/client";
import { Body, Get, createHandler } from "@solariusnl/next-api-decorators";
import { z } from "zod";

const getSocialPostsBodySchema = z.object({
  page: z.number().min(1).default(1),
});
export type SocialPost = SocialPostEx & {
  author: NonUser;
  _count: {
    hearts: number;
    shares: number;
    replies: number;
  };
};
export type GetSocialPostsResponse = IResponseBase<{
  posts: SocialPost[];
}>;

class SocialRouter {
  @Get()
  @Authorized()
  public async getSocialPosts(@Body() body: unknown) {
    const { page } = getSocialPostsBodySchema.parse(body);
    const posts = await prisma.socialPost.findMany({
      orderBy: {
        createdAt: "desc",
      },
      where: {
        isReply: false,
      },
      skip: (page - 1) * 10,
      take: 10,
      include: {
        author: nonCurrentUserSelect,
        _count: {
          select: {
            hearts: true,
            shares: true,
            replies: true,
          },
        },
      },
    });
    return <GetSocialPostsResponse>{
      success: true,
      data: {
        posts,
      },
    };
  }
}

export default createHandler(SocialRouter);
