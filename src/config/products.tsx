import FrameworkLogo from "@/components/framework-logo";
import { MantineColor } from "@mantine/core";

type Product = {
  name: string;
  subname: string;
  url: string;
  icon: JSX.Element;
  color: MantineColor;
};

const products: Product[] = [
  {
    name: "Framework",
    subname: "The best place to play games.",
    url: "/",
    icon: <FrameworkLogo square className="w-6 h-6" />,
    color: "blue",
  },
  {
    name: "Framework",
    subname: "The best place to play games.",
    url: "/",
    icon: <FrameworkLogo square className="w-6 h-6" />,
    color: "pink",
  },
  {
    name: "Framework",
    subname: "The best place to play games.",
    url: "/",
    icon: <FrameworkLogo square className="w-6 h-6" />,
    color: "grape",
  },
  {
    name: "Framework",
    subname: "The best place to play games.",
    url: "/",
    icon: <FrameworkLogo square className="w-6 h-6" />,
    color: "indigo",
  },
];

export default products;
