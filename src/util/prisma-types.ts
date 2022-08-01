import { Prisma } from "@prisma/client";

const user = Prisma.validator<Prisma.UserArgs>()({
  include: {
    friends: true,
    friendsRelation: true,
    outboundFriendRequests: true,
    inboundFriendRequests: true,
    games: {
      include: {
        updates: true
      }
    },
  }
});

export const nonCurrentUserSelect = {
  select: {
    id: true,
    username: true,
  }
};

export const userSelect: Prisma.UserSelect = {
  password: false,
  outboundFriendRequests: {
    select: {
      sender: nonCurrentUserSelect,
      receiver: nonCurrentUserSelect
    }
  },
  inboundFriendRequests: {
    select: {
      sender: nonCurrentUserSelect,
      receiver: nonCurrentUserSelect
    }
  },
  friends: nonCurrentUserSelect,
  friendsRelation: nonCurrentUserSelect,
  username: true,
  id: true,
  email: true,
  createdAt: true,
  updatedAt: true,
  premium: true,
  tickets: true,
  games: {
    include: {
      updates: true,
    }
  },
};

export const gameSelect: Prisma.GameSelect = {
  updates: true,
  connectData: true,
  gallery: true,
  id: true,
  author: nonCurrentUserSelect,
  name: true,
  genre: true,
  description: true,
  maxPlayersPerSession: true,
  createdAt: true,
  updatedAt: true,
  iconUri: true,
  visits: true,
  likedBy: nonCurrentUserSelect,
  dislikedBy: nonCurrentUserSelect,
};

const game = Prisma.validator<Prisma.GameArgs>()({
  include: {
    updates: true,
    likedBy: nonCurrentUserSelect,
    dislikedBy: nonCurrentUserSelect,
    author: nonCurrentUserSelect,
  }
});

export type User = Prisma.UserGetPayload<typeof user>;
export type Game = Prisma.GameGetPayload<typeof game>;