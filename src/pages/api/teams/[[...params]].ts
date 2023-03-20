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
  createHandler,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@storyofams/next-api-decorators";
import sanitize from "sanitize-html";
import { z } from "zod";
import { parse } from "../../../components/RenderMarkdown";
import getTimezones from "../../../data/timezones";
import Authorized, { Account } from "../../../util/api/authorized";
import { Teams } from "../../../util/audit-log";
import createNotification from "../../../util/notifications";
import prisma from "../../../util/prisma";
import type { User } from "../../../util/prisma-types";
import { nonCurrentUserSelect } from "../../../util/prisma-types";
import { RateLimitMiddleware } from "../../../util/rate-limit";
import { slugify } from "../../../util/slug";
import type { FilterType, SortType } from "../../teams/discover";
import { tags } from "../../teams/t/[slug]/issue/create";
import type { IssueFilter, IssueSort } from "../../teams/t/[slug]/issues";

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

    await Teams.createAuditLog(
      TeamAuditLogType.UPDATE_TEAM_DETAILS,
      [
        { key: "Location", value: location! },
        { key: "Timezone", value: timezone! },
        { key: "Website", value: website! },
        { key: "Email", value: email! },
        {
          key: "Access",
          value: access === TeamAccess.OPEN ? "Open" : "Private",
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

    // await Teams.createAuditLog(
    //   TeamAuditLogType.REMOVE_USER,
    //   [
    //     { key: "User", value: userToRemove.username },
    //     { key: "User ID", value: String(userToRemove.id) },
    //   ],
    //   `The user ${userToRemove.username} was removed from the team`,
    //   user.id,
    //   team.id
    // );
    // @TODO: Audit log

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
    @Query("search") search: string = ""
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
      },
    });

    return {
      issues,
      pages: Math.ceil(count / 10),
    };
  }
}

export default createHandler(TeamsRouter);
