import Framework from "@/components/Framework";
import IntegratedTabs from "@/components/Framework/IntegratedTabs";
import { User } from "@/util/prisma-types";
import Link from "next/link";
import {
  HiExclamation,
  HiGlobe,
  HiPaperClip,
  HiPlus,
  HiTicket,
  HiViewList,
} from "react-icons/hi";
import ReactNoSSR from "react-no-ssr";

type TeamsProps = {
  user: User;
  title: string;
  description: string;
  children: React.ReactNode;
};

const tabs = [
  {
    name: "My teams",
    href: "/teams",
    icon: <HiViewList />,
  },
  {
    name: "Discover",
    href: "/teams/discover",
    icon: <HiGlobe />,
  },
  {
    name: "Assigned",
    href: "/teams/assigned",
    icon: <HiPaperClip />,
  },
  {
    name: "Issues",
    href: "/teams/issues",
    icon: <HiExclamation />,
  },
  {
    name: "Tickets",
    href: "/teams/tickets",
    icon: <HiTicket />,
  },
  {
    name: "New team",
    href: "/teams/new",
    icon: <HiPlus />,
    right: true,
  },
];

const TeamsProvider: React.FC<TeamsProps> = ({
  user,
  title,
  description,
  children,
}) => {
  return (
    <Framework
      user={user}
      modernTitle={title}
      modernSubtitle={description}
      beta
      activeTab="none"
      integratedTabs={
        <ReactNoSSR>
          <IntegratedTabs>
            {tabs.map((tab) => (
              <Link href={tab.href} key={tab.name} passHref>
                <IntegratedTabs.Tab
                  icon={tab.icon}
                  href={tab.href}
                  right={tab.right}
                >
                  {tab.name}
                </IntegratedTabs.Tab>
              </Link>
            ))}
          </IntegratedTabs>
        </ReactNoSSR>
      }
    >
      {children}
    </Framework>
  );
};

export default TeamsProvider;
