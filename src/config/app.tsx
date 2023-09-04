import {
  HiOutlineAdjustments,
  HiOutlineCog,
  HiOutlineHome,
  HiOutlinePlay,
  HiOutlineShoppingCart,
  HiOutlineSparkles,
  HiOutlineUserGroup,
} from "react-icons/hi";

const appConfig = {
  nav: [
    {
      label: "Home",
      href: "/",
      icon: <HiOutlineHome />,
      color: "pink",
      description: "Your experience at a glance",
    },
    {
      label: "Games",
      href: "/games",
      icon: <HiOutlinePlay />,
      color: "violet",
      description: "Browse Frameworks catalog of immersive games",
    },
    {
      label: "Catalog",
      href: "/catalog",
      icon: <HiOutlineShoppingCart />,
      color: "blue",
      description: "Find some new items for your avatar",
    },
    {
      label: "Invent",
      href: "/invent/games",
      icon: <HiOutlineSparkles />,
      color: "teal",
      description: "Where imagination comes to life",
    },
    {
      label: "Social",
      href: "/social",
      icon: <HiOutlineUserGroup />,
      color: "green",
      description: "See what your friends are up to",
    },
    {
      label: "Avatar",
      href: "/avatar",
      icon: <HiOutlineAdjustments />,
      color: "orange",
      description: "Manage your avatar",
    },
    {
      label: "Settings",
      href: "/settings/account",
      icon: <HiOutlineCog />,
      color: "grape",
      description: "Manage your account and other settings",
    },
  ],
};

export default appConfig;
