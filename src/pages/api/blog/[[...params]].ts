import { AdminPermission } from "@prisma/client";
import { Body, createHandler, Post } from "@storyofams/next-api-decorators";
import { parse } from "../../../components/RenderMarkdown";
import Authorized, { Account } from "../../../util/api/authorized";
import prisma from "../../../util/prisma";
import type { User } from "../../../util/prisma-types";
import { blogPostSelect } from "../../../util/prisma-types";

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

    const article = await prisma.blogPost.create({
      data: {
        title: body.title,
        content: parse(body.content),
        createdAt: new Date(),
        author: {
          connect: {
            id: Number(account.id),
          },
        },
        subtitle: parse(body.subtitle),
        slug: body.title.toLowerCase().replace(/ /g, "-"),
      },
      select: blogPostSelect,
    });

    return article;
  }

  @Post("/newsletter/subscribe")
  @Authorized()
  public async subscribeToNewsletter(
    @Body()
    body: {
      email: string;
    },
    @Account() account: User
  ) {
    if (account.newsletterSubscribed) {
      await prisma.user.update({
        where: {
          id: Number(account.id),
        },
        data: {
          newsletterSubscribed: false,
        },
      });

      return {
        success: true,
        subscribed: false,
      };
    } else {
      if (!body.email)
        return {
          success: false,
          error: "No email provided",
        };
      if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(body.email))
        return {
          success: false,
          error: "Invalid email",
        };

      await prisma.user.update({
        where: {
          id: Number(account.id),
        },
        data: {
          newsletterSubscribed: true,
          newsletterEmail: body.email,
        },
      });

      return {
        success: true,
        subscribed: true,
      };
    }
  }
}

export default createHandler(BlogRouter);
