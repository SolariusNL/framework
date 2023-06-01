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
} from "../../../util/rate-limit";

interface SnippetCreateBody {
  name: string;
  description: string;
  language: "typescript" | "javascript" | "csharp";
}

interface UpdateSnippetBody {
  code: string;
  name: string;
  description: string;
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
    const { code, name, description } = body;

    if (!name || !description || !code) {
      return {
        success: false,
        message: "Missing name, description or code",
      };
    }

    if (
      name.length > 30 ||
      description.length > 512 ||
      name.length < 1 ||
      description.length < 1 ||
      code.length < 1 ||
      code.length > 10000
    ) {
      return {
        success: false,
        message: "Title, description or code too long",
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

    await prisma.codeSnippet.update({
      where: {
        id,
      },
      data: {
        code,
        name,
        description,
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

    const { name, description, language } = body;

    if (!name || !description || !language) {
      return {
        success: false,
        message: "Missing name or description",
      };
    }

    if (!["typescript", "javascript", "csharp"].includes(language)) {
      return {
        success: false,
        message: "Invalid language",
      };
    }

    if (
      name.length > 30 ||
      description.length > 512 ||
      name.length < 1 ||
      description.length < 1
    ) {
      return {
        success: false,
        message: "Title or description too long or too short",
      };
    }

    const code = {
      typescript: "// Write your code here",
      javascript: "// Write your code here",
      csharp: `using System;

namespace HelloWorld
{
  class Program
  {
    static void Main(string[] args)
    {
      Console.WriteLine("Hello World!");    
    }
  }
}`,
    };

    const snippet = await prisma.codeSnippet.create({
      data: {
        name,
        description,
        code: code[language],
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
