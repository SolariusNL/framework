import prisma from "./prisma";
import { nonCurrentUserSelect } from "./prisma-types";

const getTeam = async (slug: string) => {
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
    },
  });

  return team;
};

export { getTeam };
