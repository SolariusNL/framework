import { Body, createHandler, Param, Post, Req, Res, UseMiddleware } from "@storyofams/next-api-decorators";
import type { NextApiRequest, NextApiResponse } from "next";
import Authorized, { Account } from "../../../util/api/authorized";
import prisma from "../../../util/prisma";
import type { User } from "../../../util/prisma-types";
import rateLimitedResource, { RateLimitMiddleware } from "../../../util/rateLimit";

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
  public async updateSnippet(
    @Account() user: User,
    @Body() body: UpdateSnippetBody,
    @Param("id") id: string,
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
  
  @Post("/create")
  @Authorized()
  @UseMiddleware(RateLimitMiddleware(5))
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