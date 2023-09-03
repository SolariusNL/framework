import dynamic from "next/dynamic";
import {
  HiOutlineClipboardCheck,
  HiOutlineCloud,
  HiOutlineDownload,
  HiOutlineExclamation,
  HiOutlineFilm,
  HiOutlineIdentification,
  HiOutlineKey,
  HiOutlineMailOpen,
  HiOutlineMusicNote,
  HiOutlineScissors,
  HiOutlineTicket,
  HiOutlineViewGrid,
} from "react-icons/hi";
import { TbShirt } from "react-icons/tb";

const Games = dynamic(() => import("@/components/invent/games"), {
  ssr: false,
});
const Advertisements = dynamic(
  () => import("@/components/invent/advertisements"),
  {
    ssr: false,
  }
);
const GameUpdates = dynamic(() => import("@/components/invent/game-updates"), {
  ssr: false,
});
const Gamepasses = dynamic(() => import("@/components/invent/gamepasses"), {
  ssr: false,
});
const Nucleus = dynamic(() => import("@/components/invent/nucleus"), {
  ssr: false,
});
const Secrets = dynamic(() => import("@/components/invent/secrets"), {
  ssr: false,
});
const Shirts = dynamic(() => import("@/components/invent/shirts"), {
  ssr: false,
});
const Snippets = dynamic(() => import("@/components/invent/snippets"), {
  ssr: false,
});
const Sounds = dynamic(() => import("@/components/invent/sounds"), {
  ssr: false,
});

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
        component: Gamepasses,
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
        component: Shirts,
        href: "/invent/t-shirts",
        tab: {
          icon: <TbShirt />,
          label: "T-Shirts",
        },
      },
      {
        name: "shirts",
        component: Shirts,
        href: "/invent/shirts",
        tab: {
          icon: <TbShirt />,
          label: "Shirts",
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
      {
        name: "issues",
        href: "/teams/issues",
        tab: {
          icon: <HiOutlineExclamation />,
          label: "Issues",
        },
      },
      {
        name: "feedback",
        href: "/teams/feedback",
        tab: {
          icon: <HiOutlineMailOpen />,
          label: "Feedback",
        },
      },
    ],
  },
];

export default tabs;
