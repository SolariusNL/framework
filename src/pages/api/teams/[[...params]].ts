import { NotificationType, TeamAccess } from "@prisma/client";
import {
  BadRequestException,
  Body,
  createHandler,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@storyofams/next-api-decorators";
import sanitize from "sanitize-html";
import { z } from "zod";
import { parse } from "../../../components/RenderMarkdown";
import getTimezones from "../../../data/timezones";
import Authorized, { Account } from "../../../util/api/authorized";
import createNotification from "../../../util/notifications";
import prisma from "../../../util/prisma";
import type { User } from "../../../util/prisma-types";
import { nonCurrentUserSelect } from "../../../util/prisma-types";
import { RateLimitMiddleware } from "../../../util/rate-limit";
import { slugify } from "../../../util/slug";

const teamSanitization = {
  allowedTags: [
    "b",
    "i",
    "u",
    "s",
    "a",
    "p",
    "br",
    "ul",
    "ol",
    "li",
    "h2",
    "h3",
    "h4",
    "strong",
    "table",
    "tr",
    "th",
    "td",
  ],
  allowedAttributes: {
    a: ["href"],
  },
};

class TeamsRouter {
  @Post("/new")
  @Authorized()
  @RateLimitMiddleware(5)()
  public async newTeam(@Account() user: User, @Body() body: unknown) {
    const schema = z.object({
      name: z.string().min(3).max(50),
      description: z.string().min(3).max(2048),
      location: z.optional(z.string().max(50)),
      timezone: z.optional(
        z.string().refine((tz) => {
          const timezones = getTimezones();
          return timezones.some((t) => t.value === tz);
        })
      ),
      website: z.optional(z.string().url().max(2048)),
      email: z.optional(z.string().email().max(100)),
    });

    const { name, description, location, timezone, website, email } =
      schema.parse(body);

    const exists = await prisma.team.findFirst({
      where: {
        name,
      },
    });

    if (exists) {
      throw new BadRequestException("Team already exists");
    }

    const team = await prisma.team.create({
      data: {
        name,
        description: sanitize(parse(description), teamSanitization),
        descriptionMarkdown: description,
        location,
        timezone,
        website,
        email,
        owner: {
          connect: {
            id: user.id,
          },
        },
        slug: slugify(name),
      },
    });

    return {
      success: true,
      team,
    };
  }

  @Get("/")
  @Authorized()
  public async getTeams(@Account() user: User) {
    const myTeams = await prisma.team.findMany({
      where: {
        OR: [
          {
            ownerId: user.id,
          },
          {
            members: {
              some: {
                id: user.id,
              },
            },
          },
        ],
      },
      include: {
        _count: {
          select: {
            members: true,
            games: true,
          },
        },
        owner: {
          select: nonCurrentUserSelect.select,
        },
      },
    });

    return myTeams;
  }

  @Get("/:id/members/:p")
  @Authorized()
  public async getTeamMembers(
    @Account() user: User,
    @Param("id") id: string,
    @Param("p") p: string
  ) {
    const team = await prisma.team.findFirst({
      where: {
        id,
      },
      include: {
        members: {
          select: nonCurrentUserSelect.select,
          take: 8,
          skip: 8 * (Number(p) - 1),
        },
      },
    });

    const count = await prisma.user.count({
      where: {
        apartOf: {
          some: {
            id,
          },
        },
      },
    });

    return {
      members: team?.members || [],
      pages: Math.ceil(count / 8),
    };
  }

  @Patch("/:id")
  @Authorized()
  public async updateTeam(
    @Account() user: User,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    const schema = z.object({
      description: z.string().min(3).max(2048),
      location: z.optional(z.string().max(50)),
      timezone: z.optional(
        z.string().refine((tz) => {
          const timezones = getTimezones();
          return timezones.some((t) => t.value === tz);
        })
      ),
      website: z.optional(z.string().url().max(2048)),
      email: z.optional(z.string().email().max(100)),
      access: z.optional(
        z
          .enum(["OPEN", "PRIVATE"])
          .refine((a) => a === "OPEN" || a === "PRIVATE")
      ),
    });

    const { description, location, timezone, website, email, access } =
      schema.parse(body);

    const exists = await prisma.team.findFirst({
      where: {
        id,
        ownerId: user.id,
      },
    });

    if (!exists) {
      throw new BadRequestException("Team does not exist");
    }

    const team = await prisma.team.update({
      where: {
        id,
      },
      data: {
        description: sanitize(parse(description), teamSanitization),
        descriptionMarkdown: description,
        location,
        timezone,
        website,
        email,
        access,
      },
    });

    return {
      success: true,
      team,
    };
  }

  @Post("/:id/join")
  @Authorized()
  public async joinTeam(@Account() user: User, @Param("id") id: string) {
    const team = await prisma.team.findFirst({
      where: {
        id,
      },
      include: {
        members: { select: { id: true } },
        owner: true,
        invited: { select: { id: true } },
      },
    });

    if (!team) {
      throw new BadRequestException("Team does not exist");
    }

    if (team.ownerId === user.id) {
      throw new BadRequestException("You are the owner of this team");
    }

    if (
      team.access === TeamAccess.PRIVATE &&
      !team.invited.some((i) => i.id === user.id) &&
      !team.members.some((m) => m.id === user.id)
    ) {
      throw new BadRequestException(
        "This team is private and you have not been invited"
      );
    }

    if (team.members.some((m) => m.id === user.id)) {
      await prisma.team.update({
        where: {
          id,
        },
        data: {
          members: {
            disconnect: {
              id: user.id,
            },
          },
        },
      });

      return {
        success: true,
        message: "You have left the team",
      };
    }

    if (team.invited.some((i) => i.id === user.id)) {
      await prisma.team.update({
        where: {
          id,
        },
        data: {
          invited: {
            disconnect: {
              id: user.id,
            },
          },
        },
      });

      await createNotification(
        team.ownerId,
        NotificationType.INFO,
        `@${user.username} has joined your team ${team.name} using your invite.`,
        "Invite accepted"
      );
    }

    await prisma.team.update({
      where: {
        id,
      },
      data: {
        members: {
          connect: {
            id: user.id,
          },
        },
      },
    });
  }

  @Get("/:id/ismember")
  @Authorized()
  public async isMember(@Account() user: User, @Param("id") id: string) {
    const team = await prisma.team.findFirst({
      where: {
        id,
      },
      include: {
        members: { select: { id: true } },
        owner: true,
      },
    });

    if (!team) {
      throw new BadRequestException("Team does not exist");
    }

    if (team.ownerId === user.id) {
      return {
        isMember: true,
      };
    }

    if (team.members.some((m) => m.id === user.id)) {
      return {
        isMember: true,
      };
    }

    return {
      isMember: false,
    };
  }

  @Get("/:id/isinvited")
  @Authorized()
  public async isInvited(@Account() user: User, @Param("id") id: string) {
    const team = await prisma.team.findFirst({
      where: {
        id,
      },
      include: {
        invited: { select: { id: true } },
        owner: true,
      },
    });

    if (!team) {
      throw new BadRequestException("Team does not exist");
    }

    if (team.ownerId === user.id) {
      return {
        isInvited: true,
      };
    }

    if (team.invited.some((m) => m.id === user.id)) {
      return {
        isInvited: true,
      };
    }

    return {
      isInvited: false,
    };
  }

  @Post("/:id/invite/:userId")
  @Authorized()
  public async inviteUser(
    @Account() user: User,
    @Param("id") id: string,
    @Param("userId") userId: number
  ) {
    const team = await prisma.team.findFirst({
      where: {
        id,
      },
      include: {
        invited: { select: { id: true } },
        owner: true,
      },
    });

    if (!team) {
      throw new BadRequestException("Team does not exist");
    }

    if (team.ownerId !== user.id) {
      throw new BadRequestException("You are not the owner of this team");
    }

    if (team.invited.some((m) => m.id === userId)) {
      throw new BadRequestException("User is already invited");
    }

    await prisma.team.update({
      where: {
        id,
      },
      data: {
        invited: {
          connect: {
            id: Number(userId),
          },
        },
      },
    });

    return {
      success: true,
    };
  }

  @Delete("/:id/invite/:userId")
  @Authorized()
  public async uninviteUser(
    @Account() user: User,
    @Param("id") id: string,
    @Param("userId") userId: number
  ) {
    const team = await prisma.team.findFirst({
      where: {
        id,
      },
      include: {
        invited: { select: { id: true } },
        owner: true,
      },
    });

    if (!team) {
      throw new BadRequestException("Team does not exist");
    }

    if (team.ownerId !== user.id) {
      throw new BadRequestException("You are not the owner of this team");
    }

    await prisma.team.update({
      where: {
        id,
      },
      data: {
        invited: {
          disconnect: {
            id: Number(userId),
          },
        },
      },
    });

    return {
      success: true,
    };
  }

  @Get("/:id/invited")
  @Authorized()
  public async getInvited(@Account() user: User, @Param("id") id: string) {
    const team = await prisma.team.findFirst({
      where: {
        id,
      },
      include: {
        invited: {
          select: {
            avatarUri: true,
            username: true,
            id: true,
          },
        },
      },
    });

    if (!team) {
      throw new BadRequestException("Team does not exist");
    }

    if (team.ownerId !== user.id) {
      throw new BadRequestException("You are not the owner of this team");
    }

    return team.invited;
  }
}

export default createHandler(TeamsRouter);
