import { parse } from "@/components/render-markdown";
import getTimezones from "@/data/timezones";
import type { FilterType, SortType } from "@/pages/teams/discover";
import { tags } from "@/pages/teams/t/[slug]/issue/create";
import type { IssueFilter, IssueSort } from "@/pages/teams/t/[slug]/issues";
import type { AuditLogType } from "@/pages/teams/t/[slug]/settings/audit-log";
import IResponseBase from "@/types/api/IResponseBase";
import Authorized, { Account } from "@/util/api/authorized";
import { Teams } from "@/util/audit-log";
import createNotification from "@/util/notifications";
import prisma from "@/util/prisma";
import type { User } from "@/util/prisma-types";
import { nonCurrentUserSelect } from "@/util/prisma-types";
import { RateLimitMiddleware } from "@/util/rate-limit";
import { slugify } from "@/util/slug";
import {
  NotificationType,
  Prisma,
  TeamAccess,
  TeamAuditLogType,
  TeamIssueEnvironmentType,
  TeamIssueStatus,
} from "@prisma/client";
import {
  BadRequestException,
  Body,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  createHandler,
} from "@solariusnl/next-api-decorators";
import sanitize from "sanitize-html";
import { z } from "zod";

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
    "pre",
    "code",
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
          take: p === "1" ? 9 : 8,
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
      displayFunds: z.optional(z.boolean()),
    });

    const {
      description,
      location,
      timezone,
      website,
      email,
      access,
      displayFunds,
    } = schema.parse(body);

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
        displayFunds,
      },
    });

    await Teams.createAuditLog(
      TeamAuditLogType.UPDATE_TEAM_DETAILS,
      [
        { key: "Location", value: team.location! || "Unprovided" },
        { key: "Timezone", value: team.timezone! || "Unprovided" },
        { key: "Website", value: team.website! || "Unprovided" },
        { key: "Email", value: team.email! || "Unprovided" },
        {
          key: "Access",
          value: team.access === TeamAccess.OPEN ? "Open" : "Private",
        },
        {
          key: "Display Funds",
          value: team.displayFunds ? "Yes" : "No",
        },
      ],
      "Team updated, new values:",
      user.id,
      team.id
    );

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
        banned: { select: { id: true } },
      },
    });

    if (!team) {
      throw new BadRequestException("Team does not exist");
    }

    if (team.ownerId === user.id) {
      throw new BadRequestException("You are the owner of this team");
    }

    if (team.banned.some((b) => b.id === user.id)) {
      throw new BadRequestException(
        "You have been banned from this team therefore you cannot join"
      );
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
          staff: {
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

    await Teams.createAuditLog(
      TeamAuditLogType.UPDATE_INVITED_USERS,
      [{ key: "New user", value: `User invited with ID ${userId}` }],
      "A new user was invited to the team",
      user.id,
      team.id
    );

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

    await Teams.createAuditLog(
      TeamAuditLogType.UPDATE_INVITED_USERS,
      [{ key: "Removed user", value: `User invite revoked with ID ${userId}` }],
      "Invite status for a user was revoked",
      user.id,
      team.id
    );

    return {
      success: true,
    };
  }

  @Post("/:id/staff/:userId")
  @Authorized()
  public async inviteStaff(
    @Account() user: User,
    @Param("id") id: string,
    @Param("userId") userId: number
  ) {
    const team = await prisma.team.findFirst({
      where: {
        id,
      },
      include: {
        staff: { select: { id: true } },
        owner: true,
      },
    });

    if (!team) {
      throw new BadRequestException("Team does not exist");
    }

    if (team.ownerId !== user.id) {
      throw new BadRequestException("You are not the owner of this team");
    }

    if (team.staff.some((m) => m.id === userId)) {
      throw new BadRequestException("User is already staff");
    }

    await prisma.team.update({
      where: {
        id,
      },
      data: {
        staff: {
          connect: {
            id: Number(userId),
          },
        },
      },
    });

    await Teams.createAuditLog(
      TeamAuditLogType.UPDATE_INVITED_USERS,
      [{ key: "New staff", value: `Staff invited with ID ${userId}` }],
      "A new staff member was invited to the team",
      user.id,
      team.id
    );

    return {
      success: true,
    };
  }

  @Delete("/:id/staff/:userId")
  @Authorized()
  public async removeStaff(
    @Account() user: User,
    @Param("id") id: string,
    @Param("userId") userId: number
  ) {
    const team = await prisma.team.findFirst({
      where: {
        id,
      },
      include: {
        staff: { select: { id: true } },
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
        staff: {
          disconnect: {
            id: Number(userId),
          },
        },
      },
    });

    await Teams.createAuditLog(
      TeamAuditLogType.UPDATE_INVITED_USERS,
      [
        {
          key: "Removed staff",
          value: `Staff role revoked for user with ID ${userId}`,
        },
      ],
      "Staff role for a user was revoked",
      user.id,
      team.id
    );

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
        staff: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!team) {
      throw new BadRequestException("Team does not exist");
    }

    if (team.ownerId !== user.id) {
      if (!team.staff.some((s) => s.id === user.id)) {
        throw new BadRequestException("You are not the owner of this team");
      }
    }

    return team.invited;
  }

  @Get("/:id/staff")
  @Authorized()
  public async getStaff(@Account() user: User, @Param("id") id: string) {
    const team = await prisma.team.findFirst({
      where: {
        id,
      },
      include: {
        staff: {
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
      if (!team.staff.some((s) => s.id === user.id)) {
        throw new BadRequestException("You are not the owner of this team");
      }
    }

    return team.staff;
  }

  @Get("/:tid/audit/:page")
  @Authorized()
  public async getAuditLog(
    @Account() user: User,
    @Query("type") type: AuditLogType = "ALL",
    @Param("page") page: number,
    @Param("tid") teamId: string
  ) {
    const query: Prisma.TeamAuditLogFindManyArgs = {
      where: {
        team: {
          id: teamId,
          OR: [
            {
              ownerId: user.id,
            },
            {
              staff: {
                some: {
                  id: user.id,
                },
              },
            },
          ],
        },
        ...(type === "ALL" ? {} : { type }),
      },
    };

    const audits = await prisma.teamAuditLog.findMany({
      where: query.where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            alias: true,
            avatarUri: true,
            verified: true,
          },
        },
        rows: true,
      },
      skip: (page - 1) * 8,
      take: 8,
      orderBy: {
        createdAt: "desc",
      },
    });

    const count = await prisma.teamAuditLog.count({
      where: query.where,
    });

    return {
      audits,
      pages: Math.ceil(count / 8),
    };
  }

  @Get("/discover/:page")
  @Authorized()
  public async discover(
    @Query("q") q: string,
    @Query("sort") sort: SortType,
    @Query("filter") filter: FilterType,
    @Param("page") page: number
  ) {
    const query: Prisma.TeamFindManyArgs = {
      where: {
        name: {
          contains: q,
          mode: "insensitive",
        },
        access: filter === "ALL" ? undefined : filter,
      },
      orderBy: {
        ...(sort === "CREATED" ? { createdAt: "desc" } : {}),
        ...(sort === "MEMBERS" ? { members: { _count: "desc" } } : {}),
        ...(sort === "NAME" ? { name: "asc" } : {}),
        ...(sort === "GAMES" ? { games: { _count: "desc" } } : {}),
      },
    };

    const teams = await prisma.team
      .findMany({
        where: query.where,
        orderBy: query.orderBy as Prisma.TeamOrderByWithRelationInput,
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
        skip: page > 0 ? (page - 1) * 10 : 0,
        take: 10,
      })
      .catch((e) => {
        console.log(e);
        return [];
      });
    const count = await prisma.team.count({
      where: query.where,
    });

    return {
      teams,
      pages: Math.ceil(count / 10),
    };
  }

  @Post("/:id/transfer/:gameId")
  @Authorized()
  public async transferGame(
    @Account() user: User,
    @Param("id") id: string,
    @Param("gameId") gameId: number
  ) {
    const team = await prisma.team.findFirst({
      where: {
        id,
      },
      include: {
        owner: true,
        games: true,
      },
    });

    if (!team) {
      throw new BadRequestException("Team does not exist");
    }

    if (team.ownerId !== user.id) {
      throw new BadRequestException("You are not the owner of this team");
    }

    const game = await prisma.game.findFirst({
      where: {
        id: Number(gameId),
        authorId: Number(user.id),
      },
    });

    if (!game) {
      throw new BadRequestException(
        "Game does not exist or you are not the author"
      );
    }

    if (team.games.some((g) => g.id === game.id)) {
      await prisma.game.update({
        where: {
          id: game.id,
        },
        data: {
          teamId: null,
        },
      });
      return {
        success: true,
      };
    } else {
      await prisma.game.update({
        where: {
          id: game.id,
        },
        data: {
          teamId: team.id,
        },
      });
      return {
        success: true,
      };
    }
  }

  @Post("/:id/issue/:gameId/new")
  @Authorized()
  @RateLimitMiddleware(10)()
  public async createIssueForGame(
    @Account() user: User,
    @Param("id") id: string,
    @Param("gameId") gameId: number,
    @Body() body: unknown
  ) {
    const schema = z.object({
      title: z.string().min(1).max(100),
      description: z.string().min(1).max(5000),
      game: z.number(),
      tags: z.array(z.string().min(1).max(25)).max(5),
      environment: z.nativeEnum(TeamIssueEnvironmentType),
      assignee: z.number(),
    });

    const values = schema.safeParse(body);

    if (values.success) {
      const team = await prisma.team.findFirst({
        where: {
          id,
        },
        include: {
          games: true,
        },
      });

      if (!team) {
        throw new BadRequestException("Team does not exist");
      }

      const game = await prisma.game.findFirst({
        where: {
          id: Number(gameId),
        },
      });

      if (!game) {
        throw new BadRequestException("Game does not exist");
      }

      if (!team.games.some((g) => g.id === game.id)) {
        throw new BadRequestException("Game is not part of this team");
      }

      const issue = await prisma.teamIssue.create({
        data: {
          title: values.data.title,
          contentMd: values.data.description,
          content: sanitize(parse(values.data.description), teamSanitization),
          environment: values.data.environment,
          assigneeId: values.data.assignee,
          authorId: user.id,
          gameId: game.id,
          teamId: team.id,
          tags: values.data.tags,
          status: TeamIssueStatus.OPEN,
        },
      });

      return {
        issue,
      };
    } else {
      throw new BadRequestException("Invalid form");
    }
  }

  @Post("/:id/issue/:issueId/edit")
  @Authorized()
  @RateLimitMiddleware(10)()
  public async updateIssue(
    @Account() user: User,
    @Param("id") id: string,
    @Param("issueId") issueId: string,
    @Body() body: unknown
  ) {
    type Updatable =
      | "title"
      | "contentMd"
      | "tags"
      | "assigneeId"
      | "environment"
      | "status";

    const processes: Record<Updatable, (value: unknown) => unknown> = {
      title: (value: unknown) => {
        if (typeof value !== "string") {
          throw new BadRequestException("Invalid title");
        }
        if (value.length < 1 || value.length > 100) {
          throw new BadRequestException("Invalid title - invalid length");
        }
        return value;
      },
      contentMd: (value: unknown) => {
        if (typeof value !== "string") {
          throw new BadRequestException("Invalid content");
        }
        if (value.length < 1 || value.length > 5000) {
          throw new BadRequestException("Invalid content - invalid length");
        }
        return value;
      },
      tags: (value: unknown) => {
        if (!Array.isArray(value)) {
          throw new BadRequestException("Invalid tags");
        }
        if (value.length > 5) {
          throw new BadRequestException("Invalid tags - too many");
        }
        for (const tag of value) {
          if (typeof tag !== "string") {
            throw new BadRequestException("Invalid tags");
          }
          if (tag.length < 1 || tag.length > 25) {
            throw new BadRequestException("Invalid tags - invalid length");
          }
          if (!tags.map((t) => t.label).includes(tag)) {
            throw new BadRequestException("Invalid tags");
          }
        }
        return value;
      },
      assigneeId: (value: unknown) => {
        if (typeof value !== "number") {
          throw new BadRequestException("Invalid assignee");
        }
        const user = prisma.user.findFirst({
          where: {
            id: value,
          },
        });
        if (!user) {
          throw new BadRequestException("Invalid assignee");
        }
        return value;
      },
      environment: (value: unknown) => {
        if (typeof value !== "string") {
          throw new BadRequestException("Invalid environment");
        }
        if (
          !Object.values(TeamIssueEnvironmentType).includes(
            value as TeamIssueEnvironmentType
          )
        ) {
          throw new BadRequestException("Invalid environment");
        }
        return value;
      },
      status: (value: unknown) => {
        if (typeof value !== "string") {
          throw new BadRequestException("Invalid status");
        }
        if (
          !Object.values(TeamIssueStatus).includes(value as TeamIssueStatus)
        ) {
          throw new BadRequestException("Invalid status");
        }
        return value;
      },
    };

    let data: Partial<
      Prisma.TeamIssueUpdateInput & {
        assigneeId: number;
      }
    > = {};

    for (const [key, value] of Object.entries(
      body as Record<Updatable, unknown>
    ) as [Updatable, unknown][]) {
      if (key in processes) {
        (data as Record<Updatable, unknown>)[key] = processes[key](value);
      }
    }

    const issue = await prisma.teamIssue.findFirst({
      where: {
        id: issueId,
        OR: [
          {
            authorId: user.id,
          },
          {
            team: {
              ownerId: user.id,
            },
          },
        ],
      },
    });

    if (!issue) {
      throw new BadRequestException("Issue does not exist");
    }

    const updated = await prisma.teamIssue.update({
      where: {
        id: issueId,
      },
      data: {
        ...(Object.fromEntries(
          Object.entries(data).filter(
            ([key]) => !["content", "contentMd"].includes(key)
          )
        ) as Prisma.TeamIssueUpdateInput),
        ...(data.contentMd
          ? {
              content: sanitize(
                parse(String(data.contentMd)),
                teamSanitization
              ),
              contentMd: data.contentMd,
            }
          : {}),
      },
    });

    return {
      issue: updated,
    };
  }

  @Patch("/:id/shout")
  @Authorized()
  @RateLimitMiddleware(10)()
  public async shout(
    @Account() user: User,
    @Param("id") id: string,
    @Body() body: unknown
  ) {
    const schema = z.object({
      content: z.string().min(1).max(256),
    });

    const values = schema.safeParse(body);

    if (values.success) {
      const team = await prisma.team.findFirst({
        where: {
          id,
          OR: [
            {
              ownerId: user.id,
            },
            {
              staff: {
                some: {
                  id: user.id,
                },
              },
            },
          ],
        },
      });

      if (!team) {
        throw new BadRequestException("Team does not exist");
      }

      await prisma.team.update({
        where: {
          id,
        },
        data: {
          shoutMd: values.data.content,
          shout: sanitize(parse(values.data.content), {
            allowedTags: ["b", "i", "u", "a", "p", "br", "strong"],
            allowedAttributes: {
              a: ["href"],
            },
          }),
          shoutUpdatedAt: new Date(),
        },
      });

      await Teams.createAuditLog(
        TeamAuditLogType.UPDATE_SHOUT,
        [{ key: "Shout details", value: values.data.content }],
        "The team shout was updated",
        user.id,
        team.id
      );

      return {
        success: true,
      };
    }

    throw new BadRequestException("Invalid body");
  }

  @Delete("/:id/users/:userId")
  @Authorized()
  public async removeUser(
    @Account() user: User,
    @Param("id") id: string,
    @Param("userId") userId: number
  ) {
    const team = await prisma.team.findFirst({
      where: {
        id: String(id),
        OR: [
          {
            ownerId: Number(user.id),
          },
          {
            AND: [
              {
                staff: {
                  some: {
                    id: Number(user.id),
                  },
                },
              },
              {
                staff: {
                  none: {
                    id: Number(userId),
                  },
                },
              },
              {
                ownerId: {
                  not: Number(userId),
                },
              },
            ],
          },
        ],
      },
    });

    if (!team) {
      throw new BadRequestException("Team does not exist");
    }

    const userToRemove = await prisma.user.findFirst({
      where: {
        id: Number(userId),
      },
    });

    if (!userToRemove) {
      throw new BadRequestException("User does not exist");
    }

    await prisma.team.update({
      where: {
        id,
      },
      data: {
        staff: {
          disconnect: {
            id: Number(userId),
          },
        },
        members: {
          disconnect: {
            id: Number(userId),
          },
        },
      },
    });

    await createNotification(
      userToRemove.id,
      NotificationType.ALERT,
      `You have been removed from the team ${team.name}.`,
      "Team removal"
    );

    await Teams.createAuditLog(
      TeamAuditLogType.REMOVE_USER,
      [
        { key: "User", value: userToRemove.username },
        { key: "User ID", value: String(userToRemove.id) },
      ],
      `The user ${userToRemove.username} was removed from the team`,
      user.id,
      team.id
    );

    return {
      success: true,
    };
  }

  @Post("/:id/users/:userId/ban")
  @Authorized()
  public async banUser(
    @Account() user: User,
    @Param("id") id: string,
    @Param("userId") userId: number
  ) {
    const team = await prisma.team.findFirst({
      where: {
        id: String(id),
        OR: [
          {
            ownerId: Number(user.id),
          },
          {
            AND: [
              {
                staff: {
                  some: {
                    id: Number(user.id),
                  },
                },
              },
              {
                staff: {
                  none: {
                    id: Number(userId),
                  },
                },
              },
              {
                ownerId: {
                  not: Number(userId),
                },
              },
            ],
          },
        ],
      },
    });

    if (!team) {
      throw new BadRequestException("Team does not exist");
    }

    const userToBan = await prisma.user.findFirst({
      where: {
        id: Number(userId),
      },
    });

    if (!userToBan) {
      throw new BadRequestException("User does not exist");
    }

    await prisma.team.update({
      where: {
        id,
      },
      data: {
        staff: {
          disconnect: {
            id: Number(userId),
          },
        },
        members: {
          disconnect: {
            id: Number(userId),
          },
        },
        banned: {
          connect: {
            id: Number(userId),
          },
        },
      },
    });

    await createNotification(
      userToBan.id,
      NotificationType.ALERT,
      `You have been banned from the team ${team.name}.`,
      "Team ban"
    );

    return {
      success: true,
    };
  }

  @Get("/:id/issues")
  @Authorized()
  public async getIssues(
    @Param("id") id: string,
    @Query("filter") filter: IssueFilter = "all",
    @Query("sort") sort: IssueSort = "title",
    @Query("page") page: number = 1,
    @Query("search") search: string = "",
    @Query("tags") tags: string = "[]"
  ) {
    const parsedTags = JSON.parse(tags || "[]");

    const team = await prisma.team.findFirst({
      where: {
        id,
      },
      include: {
        games: true,
      },
    });

    if (!team) {
      throw new BadRequestException("Team does not exist");
    }

    const issues = await prisma.teamIssue.findMany({
      where: {
        teamId: team.id,
        status:
          filter === "all" ? undefined : filter === "open" ? "OPEN" : "CLOSED",
        title:
          search.length > 0
            ? {
                contains: search,
                mode: "insensitive",
              }
            : undefined,
        tags:
          parsedTags.length > 0
            ? {
                hasSome: parsedTags,
              }
            : undefined,
      },
      orderBy: {
        ...(sort === "title" ? { title: "asc" } : {}),
        ...(sort === "date" ? { createdAt: "desc" } : {}),
      },
      include: {
        game: {
          select: {
            id: true,
            name: true,
            iconUri: true,
          },
        },
        assignee: {
          select: {
            id: true,
            username: true,
            avatarUri: true,
          },
        },
        author: {
          select: {
            id: true,
            username: true,
            avatarUri: true,
          },
        },
      },
      skip: page > 0 ? (page - 1) * 10 : 0,
      take: 10,
    });

    const count = await prisma.teamIssue.count({
      where: {
        teamId: team.id,
        status:
          filter === "all" ? undefined : filter === "open" ? "OPEN" : "CLOSED",
        title:
          search.length > 0
            ? {
                contains: search,
                mode: "insensitive",
              }
            : undefined,
        tags:
          parsedTags.length > 0
            ? {
                hasSome: parsedTags,
              }
            : undefined,
      },
    });

    return {
      issues,
      pages: Math.ceil(count / 10),
    };
  }

  @Get("/:id/giveaways")
  @Authorized()
  public async getTeamGiveaways(@Param("id") id: string) {
    const team = await prisma.team.findFirst({
      where: {
        id,
      },
      include: {
        games: true,
      },
    });

    if (!team) {
      throw new BadRequestException("Team does not exist");
    }

    const giveaways = await prisma.teamGiveaway.findMany({
      where: {
        ended: false,
      },
      include: {
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });

    return <IResponseBase>{
      success: true,
      data: {
        giveaways,
      },
    };
  }

  @Post("/:id/giveaways/new")
  @Authorized()
  public async createTeamGiveaway(
    @Param("id") id: string,
    @Account() user: User,
    @Body() body: unknown
  ) {
    const team = await prisma.team.findFirst({
      where: {
        id: String(id),
        OR: [
          {
            ownerId: Number(user.id),
          },
          {
            staff: {
              some: {
                id: Number(user.id),
              },
            },
          },
        ],
      },
    });

    if (!team) throw new BadRequestException("Team not found");

    const schema = z.object({
      name: z.string().max(32),
      description: z.string().max(500),
      tickets: z.number().max(2500).min(25),
      ends: z
        .string()
        .datetime()
        .refine((d) => {
          return new Date(d) > new Date();
        }, "End date must be in the future"),
    });

    const parsed = schema.safeParse(body);

    if (parsed.success) {
      if (team.funds < parsed.data.tickets)
        throw new BadRequestException("Not enough funds");

      const created = await prisma.teamGiveaway.create({
        data: {
          name: parsed.data.name,
          description: parsed.data.description,
          endsAt: parsed.data.ends,
          tickets: parsed.data.tickets,
          team: {
            connect: {
              id: team.id,
            },
          },
        },
      });
      await prisma.team.update({
        where: {
          id: team.id,
        },
        data: {
          funds: {
            decrement: parsed.data.tickets,
          },
        },
      });

      await Teams.createAuditLog(
        TeamAuditLogType.GIVEAWAY_CREATED,
        [
          { key: "Name", value: parsed.data.name },
          { key: "Description", value: parsed.data.description },
          { key: "Tickets", value: `T$${parsed.data.tickets}` },
          {
            key: "Ends at",
            value: new Date(parsed.data.ends).toLocaleString(),
          },
        ],
        "A new giveaway was created",
        user.id,
        team.id
      );

      return <IResponseBase>{
        success: true,
        data: {
          giveaway: created,
        },
      };
    } else {
      throw new BadRequestException("Invalid data: " + parsed.error);
    }
  }

  @Get("/:id/giveaways/:gid/participating")
  @Authorized()
  public async getGiveawayParticipationStatus(
    @Account() account: User,
    @Param("id") id: string,
    @Param("gid") giveawayId: string
  ) {
    const team = await prisma.team.findFirst({
      where: {
        id,
      },
      include: {
        games: true,
      },
    });

    if (!team) {
      throw new BadRequestException("Team does not exist");
    }

    const giveaway = await prisma.teamGiveaway.findFirst({
      where: {
        id: giveawayId,
        ended: false,
      },
    });

    if (!giveaway) {
      throw new BadRequestException("Giveaway doesn't exist");
    }

    const participating = await prisma.user.findFirst({
      where: {
        joinedGiveaways: {
          some: {
            ended: false,
            id: giveaway.id,
          },
        },
      },
    });

    return <IResponseBase>{
      success: true,
      data: {
        participating: participating,
      },
    };
  }

  @Patch("/:id/giveaways/:gid/join")
  @Authorized()
  public async toggleGiveawayParticipationStatus(
    @Param("id") id: string,
    @Account() user: User,
    @Param("gid") giveawayId: string
  ) {
    const team = await prisma.team.findFirst({
      where: {
        id,
      },
      include: {
        games: true,
      },
    });

    if (!team) {
      throw new BadRequestException("Team does not exist");
    }

    const giveaway = await prisma.teamGiveaway.findFirst({
      where: {
        id: giveawayId,
        ended: false,
      },
    });

    if (!giveaway) {
      throw new BadRequestException("Giveaway doesn't exist");
    }

    const participating = await prisma.user.findFirst({
      where: {
        id: user.id,
        joinedGiveaways: {
          some: {
            id: giveaway.id,
          },
        },
      },
    });

    await prisma.teamGiveaway.update({
      where: {
        id: giveawayId,
      },
      data: {
        participants: {
          ...(participating
            ? {
                disconnect: {
                  id: user.id,
                },
              }
            : {
                connect: {
                  id: user.id,
                },
              }),
        },
      },
    });

    return <IResponseBase>{
      success: true,
    };
  }

  @Post("/:id/funds/add/:amount")
  @Authorized()
  public async addFunds(
    @Param("id") id: string,
    @Param("amount") amount: string,
    @Account() user: User
  ) {
    const team = await prisma.team.findFirst({
      where: {
        id,
        ownerId: user.id,
      },
    });

    if (!team) {
      throw new BadRequestException("Team does not exist");
    }

    const parsed = Number(amount);

    if (isNaN(parsed)) {
      throw new BadRequestException("Invalid amount");
    }

    if (user.tickets < parsed) {
      throw new BadRequestException("You don't have enough funds");
    }

    await prisma.team.update({
      where: {
        id,
      },
      data: {
        funds: {
          increment: parsed,
        },
      },
    });
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        tickets: {
          decrement: parsed,
        },
      },
    });

    await Teams.createAuditLog(
      TeamAuditLogType.FUNDS_ADDED,
      [{ key: "Amount", value: `T$${parsed}` }],
      "Funds were added to the team",
      user.id,
      team.id
    );

    return <IResponseBase>{
      success: true,
    };
  }
}

export default createHandler(TeamsRouter);
