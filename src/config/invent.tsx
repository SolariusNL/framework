import Advertisements from "@/components/invent/advertisements";
import GameUpdates from "@/components/invent/game-updates";
import GamePasses from "@/components/invent/gamepasses";
import Games from "@/components/invent/games";
import Nucleus from "@/components/invent/nucleus";
import Secrets from "@/components/invent/secrets";
import Snippets from "@/components/invent/snippets";
import Sounds from "@/components/invent/sounds";
import {
  HiOutlineClipboardCheck,
  HiOutlineCloud,
  HiOutlineDownload,
  HiOutlineFilm,
  HiOutlineIdentification,
  HiOutlineKey,
  HiOutlineMusicNote,
  HiOutlineScissors,
  HiOutlineServer,
  HiOutlineShoppingCart,
  HiOutlineTicket,
  HiOutlineViewGrid,
} from "react-icons/hi";
import { TbShirt } from "react-icons/tb";

const tabs = [
  {
    name: "Experiences",
    children: [
      {
        name: "games",
        component: Games,
        href: "/invent/games",
        tab: {
          icon: <HiOutlineViewGrid />,
          label: "Games",
        },
      },
      {
        name: "gamepasses",
        component: GamePasses,
        href: "/invent/gamepasses",
        tab: {
          icon: <HiOutlineTicket />,
          label: "Passes",
        },
      },
      {
        name: "snippets",
        component: Snippets,
        href: "/invent/snippets",
        tab: {
          icon: <HiOutlineScissors />,
          label: "Snippets",
        },
      },
      {
        name: "secrets",
        component: Secrets,
        href: "/invent/secrets",
        tab: {
          icon: <HiOutlineKey />,
          label: "Secrets",
        },
      },
      {
        name: "nucleus",
        component: Nucleus,
        href: "/invent/nucleus",
        tab: {
          icon: <HiOutlineServer />,
          label: "Nucleus",
        },
      },
      {
        name: "connections",
        href: "/developer/servers",
        tab: {
          icon: <HiOutlineCloud />,
          label: "Connections",
        },
      },
      {
        name: "updates",
        component: GameUpdates,
        href: "/invent/updates",
        tab: {
          icon: <HiOutlineDownload />,
          label: "Updates",
        },
      },
      {
        name: "developer",
        href: "/developer/profile",
        tab: {
          icon: <HiOutlineIdentification />,
          label: "Profile",
        },
      },
    ],
  },
  {
    name: "Assets",
    children: [
      {
        name: "sounds",
        component: Sounds,
        href: "/invent/sounds",
        tab: {
          icon: <HiOutlineMusicNote />,
          label: "Sounds",
        },
      },
      {
        name: "t-shirts",
        component: TbShirt,
        href: "/invent/t-shirts",
        tab: {
          icon: <HiOutlineShoppingCart />,
          label: "T-Shirts",
        },
      },
      {
        name: "advertisements",
        component: Advertisements,
        href: "/invent/advertisements",
        tab: {
          icon: <HiOutlineFilm />,
          label: "Ads",
        },
      },
    ],
  },
  {
    name: "Planning",
    children: [
      {
        name: "checklists",
        href: "/checklists",
        tab: {
          icon: <HiOutlineClipboardCheck />,
          label: "Checklists",
        },
      },
    ],
  },
];

export default tabs;
