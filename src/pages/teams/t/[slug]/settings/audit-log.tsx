import { Group, Pagination, Select, Text } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { Rating, TeamAuditLog, TeamAuditLogType } from "@prisma/client";
import { getCookie } from "cookies-next";
import { GetServerSideProps } from "next";
import React, {
  forwardRef,
  FunctionComponent,
  useEffect,
  useState,
} from "react";
import { HiGlobe, HiXCircle } from "react-icons/hi";
import { IconBaseProps, IconType } from "react-icons/lib";
import { TeamType } from "../../..";
import TeamsViewProvider from "../../../../../components/Teams/TeamsView";
import auditLogMeta from "../../../../../data/auditLog";
import authorizedRoute from "../../../../../util/auth";
import clsx from "../../../../../util/clsx";
import { NonUser, User } from "../../../../../util/prisma-types";
import { getTeam } from "../../../../../util/teams";

const headers = {
  "Content-Type": "application/json",
  Authorization: String(getCookie(".frameworksession")),
};

export type TeamViewSettingsAuditLogProps = {
  user: User;
  team: TeamType & {
    games: {
      name: string;
      iconUri: string;
      _count: {
        likedBy: number;
        dislikedBy: number;
      };
      visits: number;
      author: NonUser;
      rating: Rating;
    }[];
    staff: { username: string; id: number; avatarUri: string }[];
  };
};

export type AuditLogType = TeamAuditLogType | "ALL";
type Audit = TeamAuditLog & {
  user: {
    id: number;
    username: string;
    alias: string;
    avatarUri: string;
  };
  rows: {
    key: string;
    value: string;
  };
};

interface ItemProps extends React.ComponentPropsWithoutRef<"div"> {
  icon: IconType;
  label: string;
  active: boolean;
  type: "add" | "remove" | "change" | "all";
}

const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
  ({ icon, label, active, type, ...others }: ItemProps, ref) => (
    <div ref={ref} {...others}>
      <Group noWrap>
        <>
          {React.createElement(icon, {
            className: clsx(
              type === "add"
                ? "dark:text-teal-500/50"
                : type === "remove"
                ? "dark:text-red-500/50"
                : "dark:text-orange-500/50",
              active && "!text-white",
              type === "all" && "!text-white"
            ),
          })}
          <Text size="sm">{label}</Text>
        </>
      </Group>
    </div>
  )
);

const TeamViewSettingsAuditLog: React.FC<TeamViewSettingsAuditLogProps> = ({
  user,
  team,
}) => {
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [type, setType] = useState<AuditLogType>("ALL");
  const [audits, setAudits] = useState<Audit[]>();

  const fetchAudits = async () => {
    await fetch(
      `/api/teams/${team.id}/audit/${page.toString()}?` +
        new URLSearchParams().append("type", type),
      {
        method: "GET",
        headers,
      }
    )
      .then((res) => res.json())
      .then((res) => {
        setAudits(res.audits);
        setPages(res.pages);
      })
      .catch((reason: string) => {
        showNotification({
          title: "Error",
          message: reason || "An unexpected error has occurred.",
          color: "red",
          icon: <HiXCircle />,
        });
      });
  };

  useEffect(() => {
    fetchAudits();
  }, [type, page]);

  return (
    <TeamsViewProvider user={user} team={team} active="settings-audit">
      <div className="flex items-center justify-between">
        <Pagination total={pages} page={page} radius="md" onChange={setPage} />
        <Select
          data={[
            ...Object.values(TeamAuditLogType).map((v) => ({
              label: auditLogMeta.get(v)?.label,
              value: v,
              icon: auditLogMeta.get(v)?.icon,
              active: type === v,
              type: auditLogMeta.get(v)?.type,
            })),
            {
              label: "All",
              value: "ALL",
              icon: HiGlobe,
              active: type === "ALL",
              type: "all",
            },
          ]}
          styles={(theme) => ({
            item: {
              "&[data-selected]": {
                color: "rgb(255 255 255 / var(--tw-text-opacity)) !important",
                fontWeight: 500,
              },
            },
          })}
          itemComponent={SelectItem}
          value={type}
          onChange={(t) => setType(t as AuditLogType)}
        />
      </div>
    </TeamsViewProvider>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const auth = await authorizedRoute(ctx, true, false);
  const slug = ctx.query.slug;
  const team = await getTeam(String(slug));

  if (auth.redirect) return auth;

  if (!team) {
    return {
      redirect: {
        destination: "/404",
        permanent: false,
      },
    };
  }
  if (team.ownerId !== auth.props.user?.id) {
    if (!team.staff.find((s) => s.id === auth.props.user?.id)) {
      return {
        redirect: {
          destination: "/404",
          permanent: false,
        },
      };
    }
  }

  return {
    props: {
      user: auth.props.user,
      team: JSON.parse(JSON.stringify(team)),
    },
  };
};

export default TeamViewSettingsAuditLog;
