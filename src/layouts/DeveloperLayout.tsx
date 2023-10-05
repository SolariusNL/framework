import Framework from "@/components/framework";
import IntegratedTabs from "@/components/framework/integrated-tabs";
import WrenchScrewdriver from "@/icons/WrenchScrewdriver";
import { Fw } from "@/util/fw";
import { User } from "@/util/prisma-types";
import Link from "next/link";
import {
  HiDatabase,
  HiGlobe,
  HiKey,
  HiServer,
  HiUserCircle,
} from "react-icons/hi";
import { IconType } from "react-icons/lib";

type DeveloperLayoutProps = {
  user: User;
  title: string;
  description: string;
  children: React.ReactNode;
};

const tabs: Array<{
  0: React.FC;
  1: string;
  2: string;
  3?: Fw.FeatureIdentifier;
}> = [
  [HiServer, "/developer/servers", "Servers"],
  [HiGlobe, "/developer/domains", "Domains", Fw.FeatureIdentifier.Domains],
  [HiKey, "/developer/api-keys", "API Keys", Fw.FeatureIdentifier.APIKeys],
  [
    WrenchScrewdriver,
    "/developer/oauth2",
    "OAuth2 Applications",
    Fw.FeatureIdentifier.OAuth2,
  ],
  [
    HiUserCircle,
    "/developer/profile",
    "Developer Profile",
    Fw.FeatureIdentifier.DevProfiles,
  ],
  [HiDatabase, "/developer/redis", "Redis"],
];

const Developer: React.FC<DeveloperLayoutProps> = ({
  user,
  title,
  description,
  children,
}) => {
  const Tab = ({
    href,
    label,
    icon: Icon,
  }: {
    href: string;
    label: string;
    icon: IconType;
  }) => (
    <Link href={String(href)} key={String(label)} passHref>
      <IntegratedTabs.Tab icon={<Icon />} href={String(href)}>
        {String(label)}
      </IntegratedTabs.Tab>
    </Link>
  );

  return (
    <Framework
      user={user}
      modernTitle={title}
      modernSubtitle={description}
      beta
      activeTab="none"
      integratedTabs={
        <IntegratedTabs>
          {tabs
            .filter((tab) => {
              if (tab[3]) {
                return Fw.Feature.enabled(tab[3]);
              } else {
                return true;
              }
            })
            .map((tab) => (
              <Tab
                href={tab[1]}
                label={tab[2]}
                icon={tab[0] as IconType}
                key={tab[1]}
              />
            ))}
        </IntegratedTabs>
      }
    >
      {children}
    </Framework>
  );
};

export default Developer;
