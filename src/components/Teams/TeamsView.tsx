import { NavLink } from "@mantine/core";
import Link from "next/link";
import {
  HiExclamation,
  HiTicket,
  HiUsers,
  HiViewGrid,
  HiViewList
} from "react-icons/hi";
import SidebarTabNavigation from "../../layouts/SidebarTabNavigation";
import { User } from "../../util/prisma-types";
import Framework from "../Framework";

type TeamsViewProps = {
  user: User;
  children: React.ReactNode;
  teamSlug: string;
  active: "details" | "members" | "games" | "issues" | "tickets";
};

export const tabs = [
  {
    name: "Details",
    href: "/",
    icon: <HiViewList />,
  },
  {
    name: "Members",
    href: "/members",
    icon: <HiUsers />,
  },
  {
    name: "Games",
    href: "/games",
    icon: <HiViewGrid />,
  },
  {
    name: "Issues",
    href: "/issues",
    icon: <HiExclamation />,
  },
  {
    name: "Tickets",
    href: "/tickets",
    icon: <HiTicket />,
  },
];

const TeamsViewProvider: React.FC<TeamsViewProps> = ({
  user,
  children,
  teamSlug,
  active
}) => {
  return (
    <Framework user={user} activeTab="none">
      <SidebarTabNavigation>
        <SidebarTabNavigation.Sidebar>
          {tabs.map((t) => (
            <Link href={`/teams/t/${teamSlug}${t.href}`} key={t.name}>
              <NavLink
                className="rounded-lg"
                label={t.name}
                icon={t.icon}
                active={t.name.toLowerCase() === active}
              />
            </Link>
          ))}
        </SidebarTabNavigation.Sidebar>
        <SidebarTabNavigation.Content>{children}</SidebarTabNavigation.Content>
      </SidebarTabNavigation>
    </Framework>
  );
};

export default TeamsViewProvider;
