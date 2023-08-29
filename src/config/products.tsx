import AnalyticsLogo from "@/products/analytics";
import FlowLogo from "@/products/flow";
import FrameworkLogo from "@/products/framework";
import InfraLogo from "@/products/infra";
import PayLogo from "@/products/pay";
import VerseLogo from "@/products/verse";
import VortexLogo from "@/products/vortex";

type Product = {
  name: string;
  description: string;
  href: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
};

const products: Product[] = [
  {
    href: "#",
    name: "Framework",
    description:
      "A free and open source game platform for building your dream games.",
    icon: FrameworkLogo,
  },
  {
    href: "#",
    name: "Infra",
    description:
      "A powerful and scalable backend for your games, apps, and websites.",
    icon: InfraLogo,
  },
  {
    href: "#",
    name: "Verse",
    description:
      "Verse is a decentralised and encrypted social network for the future.",
    icon: VerseLogo,
  },
  {
    href: "#",
    name: "Vortex",
    description:
      "Vortex is a powerful, open source 3D and 2D game engine for Framework.",
    icon: VortexLogo,
  },
  {
    href: "#",
    name: "Pay",
    description: "Pay is a simple, secure, and fast no-code payment gateway.",
    icon: PayLogo,
  },
  {
    href: "#",
    name: "Flow",
    description:
      "Flow is a comprehensive visual scripting system that transpiles to TypeScript.",
    icon: FlowLogo,
  },
  {
    href: "#",
    name: "Analytics",
    description:
      "Analytics is a powerful privacy-focused analytics platform for your suite.",
    icon: AnalyticsLogo,
  },
];

export default products;
