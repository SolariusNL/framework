import { Prisma } from "@prisma/client";

export const nonCurrentUserSelect = {
  select: {
    id: true,
    username: true,
    avatarUri: true,
    avatar: true,
    country: true,
    bio: true,
    busy: true,
    premium: true,
    banned: true,
    followers: { select: { id: true } },
    following: { select: { id: true } },
    lastSeen: true,
    timeZone: true,
    role: true,
    alias: true,
    previousUsernames: true,
    statusPosts: {
      take: 5,
    },
  },
};

const user = Prisma.validator<Prisma.UserArgs>()({
  include: {
    games: {
      include: {
        updates: true,
        author: nonCurrentUserSelect,
        likedBy: nonCurrentUserSelect,
        dislikedBy: nonCurrentUserSelect,
      },
    },
    nucleusKeys: true,
    avatar: true,
    snippets: {
      select: {
        name: true,
        description: true,
        id: true,
      },
    },
    emailVerificationInstances: true,
    receivedMessages: true,
    sentMessages: true,
    following: nonCurrentUserSelect,
    followers: nonCurrentUserSelect,
    notifications: true,
    secrets: true,
    premiumSubscription: true,
    statusPosts: true,
    profileLinks: true,
  },
});

const nonuser = Prisma.validator<Prisma.UserArgs>()({
  select: {
    id: true,
    username: true,
    avatarUri: true,
    avatar: true,
    country: true,
    bio: true,
    busy: true,
    premium: true,
    banned: true,
    followers: { select: { id: true } },
    following: { select: { id: true } },
    lastSeen: true,
    timeZone: true,
    role: true,
    alias: true,
    previousUsernames: true,
    statusPosts: true,
  },
});

export const userSelect: Prisma.UserSelect = {
  password: false,
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
  avatarUri: true,
  avatar: true,
  country: true,
  snippets: {
    select: {
      name: true,
      description: true,
      id: true,
    },
  },
  bio: true,
  busy: true,
  banned: true,
  banReason: true,
  emailVerificationInstances: true,
  emailVerified: true,
  receivedMessages: true,
  sentMessages: true,
  following: nonCurrentUserSelect,
  followers: nonCurrentUserSelect,
  notifications: true,
  notificationPreferences: true,
  lastRandomPrize: true,
  warning: true,
  warningViewed: true,
  secrets: true,
  lastSeen: true,
  enrolledInPreview: true,
  timeZone: true,
  premiumSubscription: true,
  alias: true,
  previousUsernames: true,
  emailRequiredLogin: true,
  lastUsernameChange: true,
  statusPosts: {
    take: 5,
  },
  profileLinks: true,
  hiddenHomeWidgets: true,
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
      id: true,
    },
  },
  playing: true,
  funds: {
    include: {
      donors: nonCurrentUserSelect,
    },
  },
  rating: {
    include: {
      scores: true,
    },
  },
};

export const snippetSelect: Prisma.CodeSnippetSelect = {
  id: true,
  user: nonCurrentUserSelect,
  createdAt: true,
  code: true,
  name: true,
  description: true,
};

const snippet = Prisma.validator<Prisma.CodeSnippetArgs>()({
  include: {
    user: nonuser,
  },
});

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
        id: true,
      },
    },
    funds: {
      include: {
        donors: nonCurrentUserSelect,
      },
    },
    rating: {
      include: {
        scores: true,
      },
    },
  },
});

export const nucleusKeySelect: Prisma.NucleusKeySelect = {
  connection: {
    select: {
      game: true,
    },
  },
  user: true,
  key: true,
  id: true,
};

const nucleusKey = Prisma.validator<Prisma.NucleusKeyArgs>()({
  select: {
    connection: {
      select: {
        game: true,
      },
    },
    user: true,
    key: true,
    id: true,
  },
});

const reportType = Prisma.validator<Prisma.UserReportArgs>()({
  include: {
    user: nonCurrentUserSelect,
    author: nonCurrentUserSelect,
  },
});

export const messageSelect: Prisma.MessageSelect = {
  id: true,
  title: true,
  message: true,
  createdAt: true,
  sender: nonCurrentUserSelect,
  senderId: true,
  recipient: nonCurrentUserSelect,
  recipientId: true,
  system: true,
  important: true,
  archived: true,
  read: true,
};

const message = Prisma.validator<Prisma.MessageArgs>()({
  include: {
    sender: nonCurrentUserSelect,
    recipient: nonCurrentUserSelect,
  },
});

export type Report = Prisma.UserReportGetPayload<typeof reportType>;
export type User = Prisma.UserGetPayload<typeof user>;
export type Game = Prisma.GameGetPayload<typeof game>;
export type NonUser = Prisma.UserGetPayload<typeof nonuser>;
export type NucleusKey = Prisma.NucleusKeyGetPayload<typeof nucleusKey>;
export type Snippet = Prisma.CodeSnippetGetPayload<typeof snippet>;
export type Message = Prisma.MessageGetPayload<typeof message>;
