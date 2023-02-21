import { useMantineTheme } from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  HiExclamation,
  HiPaperClip,
  HiPlus,
  HiTicket,
  HiViewGrid,
  HiViewList,
} from "react-icons/hi";
import ReactNoSSR from "react-no-ssr";
import clsx from "../../util/clsx";
import { User } from "../../util/prisma-types";
import Framework from "../Framework";

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
  const router = useRouter();
  const theme = useMantineTheme();

  return (
    <Framework
      user={user}
      modernTitle={title}
      modernSubtitle={description}
      beta
      activeTab="none"
      integratedTabs={
        <ReactNoSSR>
          <nav
            className="flex md:space-x-4 w-full md:flex-row flex-col"
            aria-label="Tabs"
          >
            {tabs.map((tab) => (
              <Link href={tab.href} key={tab.name} passHref>
                <a
                  className={clsx(
                    "px-3 py-2 font-medium text-sm rounded-lg",
                    "no-underline flex items-center gap-2",
                    tab.right ? "md:!ml-auto" : undefined
                  )}
                  aria-current={
                    router.pathname === tab.href ? "page" : undefined
                  }
                  style={{
                    color:
                      router.pathname === tab.href
                        ? theme.colors.blue[1]
                        : theme.colorScheme === "dark"
                        ? theme.colors.gray[2]
                        : theme.colors.gray[6],
                    backgroundColor:
                      router.pathname === tab.href
                        ? theme.colors.blue[9]
                        : "transparent",
                  }}
                >
                  {tab.icon}
                  {tab.name}
                </a>
              </Link>
            ))}
          </nav>
        </ReactNoSSR>
      }
    >
      {children}
    </Framework>
  );
};

export default TeamsProvider;
