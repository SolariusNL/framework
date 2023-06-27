import Framework from "@/components/Framework";
import ShadedButton from "@/components/ShadedButton";
import SidebarTabNavigation from "@/layouts/SidebarTabNavigation";
import { TeamType } from "@/pages/teams";
import getMediaUrl from "@/util/get-media";
import { User } from "@/util/prisma-types";
import { Avatar, Badge, NavLink, Text } from "@mantine/core";
import Link from "next/link";
import { useState } from "react";
import {
  HiCog,
  HiCollection,
  HiExclamation,
  HiFolder,
  HiLockClosed,
  HiTicket,
  HiUserGroup,
  HiUsers,
  HiViewGrid,
  HiViewList,
} from "react-icons/hi";

type TeamsViewProps = {
  user: User;
  children: React.ReactNode;
  active:
    | "details"
    | "members"
    | "games"
    | "issues"
    | "tickets"
    | "settings-general"
    | "settings-audit"
    | "settings-access";
  team: TeamType & {
    staff: { username: string; id: number }[];
  };
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
  const [settingsOpened, setSettingsOpened] = useState(
    active.startsWith("settings") || false
  );
  return (
    <Framework user={user} activeTab="none">
      <SidebarTabNavigation>
        <SidebarTabNavigation.Sidebar>
          <Link href={`/teams/t/${team.slug}`}>
            <ShadedButton mb="md" className="col-span-full">
              <div className="flex items-start gap-4">
                <Avatar
                  size={42}
                  src={getMediaUrl(team.iconUri)}
                  className="rounded-md"
                />
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Text size="lg" weight={500}>
                      {team.name}
                    </Text>
                    {team.access === "PRIVATE" && (
                      <HiLockClosed className="dark:text-gray-300/50 text-gray-700/50" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge color="gray" leftSection={<HiUsers size={10} />}>
                      {team._count.members + 1}
                    </Badge>
                  </div>
                </div>
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
          {(team.owner.id === user.id ||
            (team.staff && team.staff.map((s) => s.id).includes(user.id))) && (
            <Link href={`/teams/t/${team.slug}/settings/general`}>
              <NavLink
                className="rounded-md"
                label="Settings"
                icon={<HiCog />}
                active={active.startsWith("settings")}
                opened={settingsOpened}
                onClick={() => setSettingsOpened(!settingsOpened)}
                classNames={{
                  children: "col-span-full md:col-span-2",
                  root: "col-span-full md:col-span-2",
                }}
              >
                <Link href={`/teams/t/${team.slug}/settings/general`}>
                  <NavLink
                    className="rounded-md"
                    label="General"
                    icon={<HiCollection />}
                    active={"settings-general" === active}
                  />
                </Link>
                <Link href={`/teams/t/${team.slug}/settings/access`}>
                  <NavLink
                    className="rounded-md"
                    label="Access"
                    icon={<HiUserGroup />}
                    active={"settings-access" === active}
                  />
                </Link>
                <Link href={`/teams/t/${team.slug}/settings/audit-log`}>
                  <NavLink
                    className="rounded-md"
                    label="Audit Log"
                    icon={<HiFolder />}
                    active={"settings-audit" === active}
                  />
                </Link>
              </NavLink>
            </Link>
          )}
        </SidebarTabNavigation.Sidebar>
        <SidebarTabNavigation.Content>{children}</SidebarTabNavigation.Content>
      </SidebarTabNavigation>
    </Framework>
  );
};

export default TeamsViewProvider;
