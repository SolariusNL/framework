import {
  HiOutlineCog,
  HiOutlineHome,
  HiOutlineLightBulb,
  HiOutlineShoppingBag,
  HiOutlineSparkles,
  HiOutlineUser,
  HiOutlineViewGrid,
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
      icon: <HiOutlineViewGrid />,
      color: "violet",
      description: "Browse Frameworks catalog of immersive games",
    },
    {
      label: "Catalog",
      href: "/catalog",
      icon: <HiOutlineShoppingBag />,
      color: "blue",
      description: "Find some new items for your avatar",
    },
    {
      label: "Invent",
      href: "/invent/games",
      icon: <HiOutlineLightBulb />,
      color: "teal",
      description: "Where imagination comes to life",
    },
    {
      label: "Social",
      href: "/social",
      icon: <HiOutlineSparkles />,
      color: "green",
      description: "See what your friends are up to",
    },
    {
      label: "Avatar",
      href: "/avatar",
      icon: <HiOutlineUser />,
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
