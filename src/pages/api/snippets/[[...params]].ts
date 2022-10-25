import {
  Body,
  createHandler,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
} from "@storyofams/next-api-decorators";
import type { NextApiRequest, NextApiResponse } from "next";
import Authorized, { Account } from "../../../util/api/authorized";
import prisma from "../../../util/prisma";
import type { User } from "../../../util/prisma-types";
import { snippetSelect } from "../../../util/prisma-types";
import rateLimitedResource, {
  RateLimitMiddleware,
} from "../../../util/rateLimit";

interface SnippetCreateBody {
  name: string;
  description: string;
}

interface UpdateSnippetBody {
  code: string;
}

class SnippetsRouter {
  @Post("/:id/update")
  @Authorized()
  @RateLimitMiddleware(20)()
  public async updateSnippet(
    @Account() user: User,
    @Body() body: UpdateSnippetBody,
    @Param("id") id: string
  ) {
    const { code } = body;

    if (!code) {
      return {
        success: false,
        message: "Missing code",
      };
    }

    const snippet = await prisma.codeSnippet.findFirst({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!snippet) {
      return {
        success: false,
        message: "Snippet not found",
      };
    }

    if (code.length > 10000) {
      return {
        success: false,
        message: "Code too long",
      };
    }

    await prisma.codeSnippet.update({
      where: {
        id,
      },
      data: {
        code,
      },
    });

    return {
      success: true,
      id: snippet.id,
    };
  }

  @Get()
  @RateLimitMiddleware(150)()
  @Authorized()
  public async getSnippets(@Query("page") page: number) {
    if (!page) {
      page = 0;
    }

    const snippets = await prisma.codeSnippet.findMany({
      take: 25,
      skip: Number(page) * 25,
      select: snippetSelect,
    });

    return {
      success: true,
      snippets,
    };
  }

  @Get("/search")
  @RateLimitMiddleware(500)()
  @Authorized()
  public async searchSnippets(@Query("q") query: string) {
    if (!query) {
      return {
        success: false,
        message: "Missing query",
      };
    }

    if (query.length > 100) {
      return {
        success: false,
        message: "Query too long",
      };
    }

    const snippets = await prisma.codeSnippet.findMany({
      where: {
        name: {
          contains: query,
          mode: "insensitive",
        },
      },
      take: 25,
      select: snippetSelect,
    });

    return {
      success: true,
      snippets,
    };
  }

  @Post("/create")
  @Authorized()
  @RateLimitMiddleware(5)()
  public async createSnippet(
    @Account() user: User,
    @Body() body: SnippetCreateBody,
    @Req() request: NextApiRequest,
    @Res() response: NextApiResponse
  ) {
    if (rateLimitedResource(request, response, 5) == 0) {
      return {
        success: false,
        message: "Too many requests",
      };
    }

    const { name, description } = body;

    if (!name || !description) {
      return {
        success: false,
        message: "Missing name or description",
      };
    }

    if (
      name.length > 50 ||
      description.length > 500 ||
      name.length < 4 ||
      description.length < 10
    ) {
      return {
        success: false,
        message: "Title or description too long or too short",
      };
    }

    const snippet = await prisma.codeSnippet.create({
      data: {
        name,
        description,
        code: "// Write your code here",
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    return {
      success: true,
      id: snippet.id,
    };
  }
}

export default createHandler(SnippetsRouter);
