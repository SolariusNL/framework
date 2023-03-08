import { Avatar, NavLink, Text } from "@mantine/core";
import Link from "next/link";
import {
  HiCog,
  HiExclamation,
  HiTicket,
  HiUsers,
  HiViewGrid,
  HiViewList,
} from "react-icons/hi";
import SidebarTabNavigation from "../../layouts/SidebarTabNavigation";
import { TeamType } from "../../pages/teams";
import getMediaUrl from "../../util/get-media";
import { User } from "../../util/prisma-types";
import Framework from "../Framework";
import ShadedButton from "../ShadedButton";

type TeamsViewProps = {
  user: User;
  children: React.ReactNode;
  active: "details" | "members" | "games" | "issues" | "tickets" | "settings";
  team: TeamType;
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
  active,
  team,
}) => {
  return (
    <Framework user={user} activeTab="none">
      <SidebarTabNavigation>
        <SidebarTabNavigation.Sidebar>
          <Link href={`/teams/t/${team.slug}`}>
            <ShadedButton mb="md" className="col-span-full">
              <div className="flex items-center gap-4">
                <Avatar
                  size={42}
                  src={getMediaUrl(team.iconUri)}
                  className="rounded-md"
                />
                <Text size="lg" weight={500}>
                  {team.name}
                </Text>
              </div>
            </ShadedButton>
          </Link>
          {tabs.map((t) => (
            <Link href={`/teams/t/${team.slug}${t.href}`} key={t.name}>
              <NavLink
                className="rounded-md"
                label={t.name}
                icon={t.icon}
                active={t.name.toLowerCase() === active}
              />
            </Link>
          ))}
          {team.ownerId === user.id && (
            <Link href={`/teams/t/${team.slug}/settings`}>
              <NavLink
                className="rounded-md"
                label="Settings"
                icon={<HiCog />}
                active={"settings" === active}
              />
            </Link>
          )}
        </SidebarTabNavigation.Sidebar>
        <SidebarTabNavigation.Content>{children}</SidebarTabNavigation.Content>
      </SidebarTabNavigation>
    </Framework>
  );
};

export default TeamsViewProvider;
