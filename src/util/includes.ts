import { nonCurrentUserSelect } from "./prisma-types";

const assetFrontendInclude = {
  _count: {
    select: {
      stargazers: true,
    },
  },
  author: {
    select: nonCurrentUserSelect.select,
  },
  rows: true,
};

export { assetFrontendInclude };
