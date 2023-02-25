import {
  Anchor,
  Avatar,
  Button,
  Text,
  Title,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { Rating, TeamAccess } from "@prisma/client";
import { getCookie } from "cookies-next";
import { GetServerSideProps } from "next";
import { useEffect, useState } from "react";
import {
  HiCake,
  HiCheckCircle,
  HiClock,
  HiExclamationCircle,
  HiGlobe,
  HiLockClosed,
  HiMail,
  HiOfficeBuilding,
  HiUsers,
  HiViewGrid,
} from "react-icons/hi";
import { TeamType } from "../..";
import Owner from "../../../../components/Owner";
import RenderMarkdown from "../../../../components/RenderMarkdown";
import ShadedCard from "../../../../components/ShadedCard";
import TeamsViewProvider from "../../../../components/Teams/TeamsView";
import authorizedRoute from "../../../../util/auth";
import getMediaUrl from "../../../../util/get-media";
import { NonUser, User } from "../../../../util/prisma-types";
import { getTeam } from "../../../../util/teams";

export type TeamViewProps = {
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
  };
};

const TeamView: React.FC<TeamViewProps> = ({ user, team }) => {
  const theme = useMantineTheme();
  const [member, setMember] = useState<boolean | null>(null);
  const [invited, setInvited] = useState<boolean>(false);

  const headers = {
    "Content-Type": "application/json",
    Authorization: String(getCookie(".frameworksession")),
  };

  const joinTeam = async () => {
    if (member === null) return;
    setMember(!member);
    const res = await fetch(`/api/teams/${team.id}/join`, {
      method: "POST",
      headers,
    });
    if (res.status === 200 || res.status === 204) {
      setMember(!member);
      showNotification({
        title: "Success",
        message: `You have ${member ? "left" : "joined"} the team.`,
        icon: <HiCheckCircle />,
      });
    } else {
      showNotification({
        title: "Error",
        message: `There was an error ${
          member ? "leaving" : "joining"
        } the team.`,
        icon: <HiExclamationCircle />,
      });
    }
  };

  useEffect(() => {
    fetch(`/api/teams/${team.id}/ismember`, {
      method: "GET",
      headers,
    })
      .then((res) => res.json())
      .then((res) => setMember(res.isMember));

    fetch(`/api/teams/${team.id}/isinvited`, {
      method: "GET",
      headers,
    })
      .then((res) => res.json())
      .then((res) => setInvited(res.isInvited));
  }, [team.id]);

  return (
    <TeamsViewProvider user={user} team={team} active="details">
      <div className="flex items-start flex-col md:flex-row gap-y-4 md:gap-y-0 justify-between mb-8">
        <div className="flex items-start gap-7">
          <Avatar size={100} src={getMediaUrl(team.iconUri)} />
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              {team.access === TeamAccess.PRIVATE && (
                <HiLockClosed className="dark:text-gray-300/50 text-gray-700/50" />
              )}
              <Title order={2}>{team.name}</Title>
            </div>
            <Owner user={team.owner} size={34} className="mt-2" />
          </div>
        </div>
        <Button
          color={member === null ? "dark" : member ? "red" : "blue"}
          disabled={
            member === null ||
            team.owner.id === user.id ||
            (team.access === TeamAccess.PRIVATE && !invited && !member)
          }
          onClick={joinTeam}
          className="ml-auto md:ml-0"
        >
          {member === null
            ? "..."
            : member
            ? "Leave team"
            : team.access === TeamAccess.PRIVATE
            ? invited
              ? "Accept invite"
              : "Private"
            : "Join team"}
        </Button>
      </div>
      <ShadedCard>
        <div className="flex flex-col md:flex-row gap-4 md:gap-8">
          <div className="flex flex-col w-full md:w-1/3 gap-2">
            {[
              {
                tooltip: "Cake day",
                icon: HiCake,
                value: `Joined ${new Date(
                  team.cakeDay as Date
                ).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}`,
              },
              {
                tooltip: "Members",
                icon: HiUsers,
                value: `${team._count.members + 1} members`,
              },
              {
                tooltip: "Games",
                icon: HiViewGrid,
                value: `${team._count.games} games`,
              },
              {
                tooltip: "Open issues",
                icon: HiExclamationCircle,
                value: "0 open issues",
              },
              {
                tooltip: "Contact email",
                icon: HiMail,
                value: team.email || "Unprovided",
              },
              {
                tooltip: "Website",
                icon: HiGlobe,
                value: team.website || "Unprovided",
              },
              {
                tooltip: "Based in",
                icon: HiOfficeBuilding,
                value: team.location || "Unprovided",
              },
              {
                tooltip: "Timezone",
                icon: HiClock,
                value: team.timezone || "Unprovided",
              },
            ].map(({ tooltip, icon: Icon, value }) => (
              <Tooltip label={`${tooltip}: ${value}`} key={tooltip}>
                <div className="flex items-center gap-3">
                  <Icon
                    color={theme.colors.gray[5]}
                    className="flex-shrink-0"
                  />
                  <Text weight={500} color="dimmed" lineClamp={1}>
                    {value.startsWith("http") ? (
                      <Anchor href={value} target="_blank" rel="noreferrer">
                        {value}
                      </Anchor>
                    ) : (
                      value
                    )}
                  </Text>
                </div>
              </Tooltip>
            ))}
          </div>
          <div className="flex flex-col w-full md:w-2/3">
            <Text weight={500} color="dimmed" mb="sm">
              Description
            </Text>
            <RenderMarkdown>
              {team.description || "No description provided."}
            </RenderMarkdown>
          </div>
        </div>
      </ShadedCard>
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

  return {
    props: {
      user: auth.props.user,
      team: JSON.parse(JSON.stringify(team)),
    },
  };
};

export default TeamView;
