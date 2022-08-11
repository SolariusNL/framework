import { Prisma } from "@prisma/client";

export const nonCurrentUserSelect = {
  select: {
    id: true,
    username: true,
    avatarUri: true,
  },
};

const user = Prisma.validator<Prisma.UserArgs>()({
  include: {
    friends: true,
    friendsRelation: true,
    outboundFriendRequests: true,
    inboundFriendRequests: true,
    games: {
      include: {
        updates: true,
        author: nonCurrentUserSelect,
        likedBy: nonCurrentUserSelect,
        dislikedBy: nonCurrentUserSelect,
      },
    },
    nucleusKeys: true,
  },
});

const nonuser = Prisma.validator<Prisma.UserArgs>()({
  select: {
    id: true,
    username: true,
    avatarUri: true,
  },
});

export const userSelect: Prisma.UserSelect = {
  password: false,
  outboundFriendRequests: {
    select: {
      sender: nonCurrentUserSelect,
      receiver: nonCurrentUserSelect,
    },
  },
  inboundFriendRequests: {
    select: {
      sender: nonCurrentUserSelect,
      receiver: nonCurrentUserSelect,
    },
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
      author: nonCurrentUserSelect,
      likedBy: nonCurrentUserSelect,
      dislikedBy: nonCurrentUserSelect,
    },
  },
  role: true,
  nucleusKeys: true,
};

export const gameSelect: Prisma.GameSelect = {
  updates: true,
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
  connection: true,
  comments: {
    select: {
      text: true,
      user: nonCurrentUserSelect,
      createdAt: true,
    },
  },
};

const game = Prisma.validator<Prisma.GameArgs>()({
  include: {
    updates: true,
    likedBy: nonCurrentUserSelect,
    dislikedBy: nonCurrentUserSelect,
    author: nonCurrentUserSelect,
    connection: true,
    comments: {
      select: {
        text: true,
        user: nonCurrentUserSelect,
        createdAt: true,
      },
    },
  },
});

export type User = Prisma.UserGetPayload<typeof user>;
export type Game = Prisma.GameGetPayload<typeof game>;
export type NonUser = Prisma.UserGetPayload<typeof nonuser>;
