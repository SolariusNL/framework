import { TeamType } from "@/pages/teams";
import cast from "@/util/cast";
import { Fw } from "@/util/fw";
import prisma from "@/util/prisma";
import { nonCurrentUserSelect } from "@/util/prisma-types";
import { TeamIssueStatus } from "@prisma/client";

const getTeam = async (slug: string, include?: Record<string, any>) => {
  const team = await prisma.team.findFirst({
    where: {
      slug: String(slug),
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
      staff: {
        select: {
          id: true,
          username: true,
          avatarUri: true,
        },
      },
      banned: {
        select: {
          id: true,
        },
      },
      ...include,
    },
  });
  const openIssues = await prisma.teamIssue.count({
    where: {
      teamId: team?.id,
      status: TeamIssueStatus.OPEN,
    },
  });

  return {
    ...cast<
      TeamType & {
        staff: { username: string; id: number }[];
      }
    >(
      Fw.Objects.applyConditional(cast<Record<string, any>>(team), {
        displayFunds: {
          false: {
            pop: ["funds"],
          },
        },
      })
    ),
    _count: {
      ...team?._count,
      issues: openIssues,
    },
  };
};

export { getTeam };
