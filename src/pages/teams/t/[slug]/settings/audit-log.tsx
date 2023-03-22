import { showNotification } from "@mantine/notifications";
import { Rating, TeamAuditLog, TeamAuditLogType } from "@prisma/client";
import { getCookie } from "cookies-next";
import { GetServerSideProps } from "next";
import { useEffect, useState } from "react";
import { HiXCircle } from "react-icons/hi";
import { TeamType } from "../../..";
import TeamsViewProvider from "../../../../../components/Teams/TeamsView";
import authorizedRoute from "../../../../../util/auth";
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
  }
};

const TeamViewSettingsAuditLog: React.FC<TeamViewSettingsAuditLogProps> = ({
  user,
  team,
}) => {
  const [page, setPage] = useState(0);
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
      {JSON.stringify(audits)}
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
