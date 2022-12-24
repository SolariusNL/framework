import { AdminPermission } from "@prisma/client";
import { Body, createHandler, Post } from "@storyofams/next-api-decorators";
import Authorized, { Account } from "../../../util/api/authorized";
import prisma from "../../../util/prisma";
import { blogPostSelect } from "../../../util/prisma-types";
import type { User } from "../../../util/prisma-types";

class BlogRouter {
  @Post("/create")
  @Authorized()
  public async createArticle(
    @Body()
    body: {
      title: string;
      content: string;
      featured: boolean;
      subtitle: string;
    },
    @Account() account: User
  ) {
    if (!account.adminPermissions.includes(AdminPermission.WRITE_BLOG_POST)) {
      return {
        success: false,
        error: "You do not have permission to do this",
      };
    }

    const featuredArticles = await prisma.blogPost.findMany({
      where: {
        featured: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 3,
    });

    if (featuredArticles.length === 3 && body.featured) {
      await prisma.blogPost.update({
        where: {
          id: featuredArticles[2].id,
        },
        data: {
          featured: false,
        },
      });
    }

    const article = await prisma.blogPost.create({
      data: {
        title: body.title,
        content: body.content,
        createdAt: new Date(),
        author: {
          connect: {
            id: Number(account.id),
          },
        },
        featured: body.featured,
        subtitle: body.subtitle,
        slug: body.title.toLowerCase().replace(/ /g, "-"),
      },
      select: blogPostSelect,
    });

    return article;
  }
}

export default createHandler(BlogRouter);
