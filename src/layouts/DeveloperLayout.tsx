import Link from "next/link";
import { HiHome, HiKey, HiServer, HiUser, HiViewList } from "react-icons/hi";
import Framework from "../components/Framework";
import IntegratedTabs from "../components/Framework/IntegratedTabs";
import WrenchScrewdriver from "../icons/WrenchScrewdriver";
import { User } from "../util/prisma-types";

type DeveloperLayoutProps = {
  user: User;
  title: string;
  description: string;
  children: React.ReactNode;
};

const tabs = [
  [HiServer, "/developer/servers", "Servers"],
  [HiKey, "/developer/api-keys", "API Keys"],
  [WrenchScrewdriver, "/developer/oauth2", "OAuth2 Applications"],
  [HiViewList, "/developer/activity", "Activity"],
];

const Developer: React.FC<DeveloperLayoutProps> = ({
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
        <IntegratedTabs>
          {tabs.map(([Icon, href, label]) => (
            <Link href={String(href)} key={String(label)} passHref>
              <IntegratedTabs.Tab icon={<Icon />} href={String(href)}>
                {String(label)}
              </IntegratedTabs.Tab>
            </Link>
          ))}
        </IntegratedTabs>
      }
    >
      {children}
    </Framework>
  );
};

export default Developer;
