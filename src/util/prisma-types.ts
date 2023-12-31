import { Prisma } from "@prisma/client";

export const nonCurrentUserSelect = {
  select: {
    id: true,
    username: true,
    alias: true,
    avatarUri: true,
    country: true,
    avatar: true,
    bio: true,
    verified: true,
    busy: true,
    premium: true,
    banned: true,
    lastSeen: true,
    badges: true,
    timeZone: true,
    role: true,
    previousUsernames: true,
    statusPosts: {
      take: 5,
    },
    playing: {
      select: {
        id: true,
        name: true,
      },
    },
    ai: true,
    _count: {
      select: {
        followers: true,
        following: true,
      },
    },
  },
};

const user = Prisma.validator<Prisma.UserArgs>()({
  include: {
    games: {
      include: {
        updates: true,
        author: nonCurrentUserSelect,
        likedBy: {
          select: {
            id: true,
          },
        },
        dislikedBy: {
          select: {
            id: true,
          },
        },
        connection: {
          select: {
            id: true,
          },
        },
        team: true,
      },
    },
    nucleusKeys: true,
    avatar: true,
    snippets: {
      select: {
        name: true,
        description: true,
        id: true,
        language: true,
      },
    },
    emailVerificationInstances: true,
    notifications: true,
    secrets: true,
    premiumSubscription: true,
    statusPosts: true,
    profileLinks: true,
    playing: {
      select: {
        id: true,
        name: true,
      },
    },
    _count: {
      select: {
        followers: true,
        following: true,
      },
    },
    employee: {
      include: {
        assessmentHistory: true,
      },
    },
    referral: {
      select: {
        code: true,
        _count: {
          select: {
            usedBy: true,
          },
        },
      },
    },
    usedReferral: {
      select: {
        code: true,
      },
    },
    loginQR: true,
  },
});

const nonuser = Prisma.validator<Prisma.UserArgs>()({
  select: {
    id: true,
    username: true,
    avatarUri: true,
    avatar: true,
    country: true,
    verified: true,
    bio: true,
    busy: true,
    premium: true,
    banned: true,
    lastSeen: true,
    timeZone: true,
    badges: true,
    role: true,
    alias: true,
    previousUsernames: true,
    statusPosts: true,
    ai: true,
    playing: {
      select: {
        id: true,
        name: true,
      },
    },
    _count: {
      select: {
        followers: true,
        following: true,
      },
    },
  },
});

export const userSelect: Prisma.UserSelect = {
  password: false,
  username: true,
  id: true,
  lastDailyBits: true,
  email: true,
  createdAt: true,
  updatedAt: true,
  premium: true,
  locked: true,
  tickets: true,
  bits: true,
  verified: true,
  gettingStartedDismissed: true,
  games: {
    include: {
      updates: true,
      author: nonCurrentUserSelect,
      likedBy: nonCurrentUserSelect,
      dislikedBy: nonCurrentUserSelect,
      connection: {
        select: {
          id: true,
        },
      },
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
  banExpires: true,
  emailVerified: true,
  notifications: {
    where: {
      seen: false,
    },
  },
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
  playing: {
    select: {
      id: true,
      name: true,
    },
  },
  privacyPreferences: true,
  _count: {
    select: {
      followers: true,
      following: true,
    },
  },
  emailResetRequired: true,
  passwordResetRequired: true,
  adminPermissions: true,
  otpVerified: true,
  otpEnabled: true,
  employee: {
    include: {
      assessmentHistory: true,
    },
  },
  referral: {
    select: {
      code: true,
      _count: {
        select: {
          usedBy: true,
        },
      },
    },
  },
  usedReferral: {
    select: {
      code: true,
    },
  },
  loginQR: true,
  quickLoginEnabled: true,
  newsletterSubscribed: true,
  lastSurvey: true,
  robloxTransfer: true,
  signals: true,
  lastBadgeSync: true,
};

const article = Prisma.validator<Prisma.AdminArticleArgs>()({
  include: {
    author: nonCurrentUserSelect,
    viewers: {
      select: {
        id: true,
        avatarUri: true,
        username: true,
      },
    },
  },
});

const blogpost = Prisma.validator<Prisma.BlogPostArgs>()({
  include: {
    author: nonCurrentUserSelect,
  },
});

export const articleSelect: Prisma.AdminArticleSelect = {
  id: true,
  title: true,
  content: true,
  createdAt: true,
  updatedAt: true,
  author: nonCurrentUserSelect,
  tags: true,
  viewers: {
    select: {
      id: true,
      avatarUri: true,
      username: true,
    },
  },
};

export const blogPostSelect: Prisma.BlogPostSelect = {
  id: true,
  title: true,
  subtitle: true,
  content: true,
  createdAt: true,
  updatedAt: true,
  tags: true,
  featured: true,
  author: nonCurrentUserSelect,
  views: true,
  slug: true,
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
  underReview: true,
  visits: true,
  usedStorageBytes: true,
  likedBy: { select: { id: true } },
  dislikedBy: { select: { id: true } },
  connection: true,
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
  copyrightMetadata: true,
  private: true,
  privateAccess: {
    select: {
      id: true,
      username: true,
      avatarUri: true,
    },
  },
  paywall: true,
  paywallPrice: true,
  updateLogs: {
    orderBy: {
      createdAt: "desc",
    },
    take: 1,
  },
  team: true,
  teamId: true,
  supportedPlatforms: true,
  soyoruEnabled: true,
  voiceEnabled: true,
  chatFilterEnabled: true,
  restartOnUpdate: true,
  enforceLatestVersion: true,
  attemptLiveUpdates: true,
  requiredAccountAge: true,
  hasParentalControls: true,
  contentWarnings: true,
  feedbackEnabled: true,
};

export const snippetSelect: Prisma.CodeSnippetSelect = {
  id: true,
  user: nonCurrentUserSelect,
  createdAt: true,
  code: true,
  name: true,
  description: true,
  language: true,
};

const snippet = Prisma.validator<Prisma.CodeSnippetArgs>()({
  include: {
    user: nonuser,
  },
});

export const chatMessageSelect: Prisma.ChatMessageSelect = {
  id: true,
  author: {
    select: {
      id: true,
      username: true,
      avatarUri: true,
      ai: true,
    },
  },
  conversation: {
    select: {
      id: true,
      name: true,
      participants: {
        select: {
          id: true,
        },
      },
    },
  },
  content: true,
  createdAt: true,
  authorId: true,
  seenBy: {
    select: {
      id: true,
    },
  },
  conversationId: true,
};

const chatMessage = Prisma.validator<Prisma.ChatMessageArgs>()({
  include: {
    author: {
      select: {
        id: true,
        username: true,
        avatarUri: true,
        alias: true,
        ai: true,
      },
    },
    conversation: {
      select: {
        id: true,
        name: true,
      },
    },
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
    copyrightMetadata: true,
    privateAccess: {
      select: {
        id: true,
        username: true,
        avatarUri: true,
      },
    },
    updateLogs: {
      orderBy: {
        createdAt: "desc",
      },
      take: 1,
    },
    team: true,
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
export type Article = Prisma.AdminArticleGetPayload<typeof article>;
export type BlogPost = Prisma.BlogPostGetPayload<typeof blogpost>;
export type ChatMessage = Prisma.ChatMessageGetPayload<typeof chatMessage>;
