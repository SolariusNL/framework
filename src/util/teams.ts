import prisma from "./prisma";
import { nonCurrentUserSelect } from "./prisma-types";

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
      ...include,
    },
  });

  return team;
};

export { getTeam };
