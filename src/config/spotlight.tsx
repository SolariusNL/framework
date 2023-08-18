import {
  HiCode,
  HiCog,
  HiGift,
  HiHome,
  HiLightBulb,
  HiShoppingBag,
  HiTicket,
  HiUser,
  HiViewGrid,
} from "react-icons/hi";

export const spotlight = [
  {
    title: "Home",
    icon: <HiHome />,
    description: "Your experience starts here.",
    path: "/",
  },
  {
    title: "Games",
    icon: <HiViewGrid />,
    description: "Find games to play on Framework.",
    path: "/games",
  },
  {
    title: "Catalog",
    icon: <HiShoppingBag />,
    description:
      "Find new items for your avatar, or purchase other digital goods.",
    path: "/catalog",
  },
  {
    title: "Invent",
    icon: <HiLightBulb />,
    description: "Where dreams are made, create your first game here.",
    path: "/invent/games",
  },
  {
    title: "Avatar",
    icon: <HiUser />,
    description: "Customize your avatar.",
    path: "/avatar",
  },
  {
    title: "Settings",
    icon: <HiCog />,
    description: "Change your account settings.",
    path: "/settings/account",
  },
  {
    title: "Daily prize",
    icon: <HiGift />,
    description: "Claim your daily prize.",
    path: "/prizes",
  },
  {
    title: "Tickets",
    icon: <HiTicket />,
    description: "View your ticket dashboard.",
    path: "/tickets",
  },
  {
    title: "Ticket history",
    icon: <HiTicket />,
    description: "View your ticket transaction history.",
    path: "/tickets/transactions",
  },
  {
    title: "Purchase tickets",
    icon: <HiTicket />,
    description: "Purchase tickets.",
    path: "/tickets/buy",
  },
  {
    title: "Browse snippets",
    icon: <HiCode />,
    description: "Browse code snippets from the community.",
    path: "/snippets",
  },
];
