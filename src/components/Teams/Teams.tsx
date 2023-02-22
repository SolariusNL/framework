import Link from "next/link";
import {
  HiExclamation,
  HiPaperClip,
  HiPlus,
  HiTicket,
  HiViewGrid,
  HiViewList,
} from "react-icons/hi";
import ReactNoSSR from "react-no-ssr";
import { User } from "../../util/prisma-types";
import Framework from "../Framework";
import IntegratedTabs from "../Framework/IntegratedTabs";

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
    name: "Games overview",
    href: "/teams/games",
    icon: <HiViewGrid />,
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
