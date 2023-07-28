import Framework from "@/components/framework";
import ModernEmptyState from "@/components/modern-empty-state";
import ShadedCard from "@/components/shaded-card";
import authorizedRoute from "@/util/auth";
import clsx from "@/util/clsx";
import getMediaUrl from "@/util/get-media";
import prisma from "@/util/prisma";
import { Game, User, gameSelect } from "@/util/prisma-types";
import { Avatar, Badge, Button, Text, Title } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { Team, TeamAccess } from "@prisma/client";
import { getCookie } from "cookies-next";
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { HiArrowRight, HiCake, HiCheckCircle, HiUsers } from "react-icons/hi";

interface TransferGameToTeamProps {
  user: User;
  game: Game;
  teams: Array<Team & { _count: { members: number } }>;
}

const TransferGameToTeam: React.FC<TransferGameToTeamProps> = ({
  user,
  game,
  teams,
}) => {
  const [selectedTeam, setSelectedTeam] = React.useState<Team | null>(
    teams[0] || null
  );
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const transferToTeam = async () => {
    if (!selectedTeam) return;
    setLoading(true);
    await fetch(`/api/teams/${selectedTeam.id}/transfer/${game.id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          router.push("/invent/games");
          showNotification({
            title: "Success",
            message: "Game transferred to team successfully.",
            icon: <HiCheckCircle />,
          });
        }
      })
      .finally(() => setLoading(false));
  };

  return (
    <Framework
      activeTab="invent"
      user={user}
      modernTitle={`Transfer ${game.name} to a team`}
      modernSubtitle="Transfer your game to a team to allow other team members to manage it, and to enable advanced features like issue tracking."
    >
      {teams.length > 0 ? (
        <>
          <div className="grid lg:grid-cols-3 gap-4 grid-cols-1 mb-12 md:grid-cols-2">
            {teams.map((team) => (
              <ShadedCard
                className={clsx(
                  team.id == selectedTeam?.id
                    ? "dark:border-blue-700 border-blue-500"
                    : "border-transparent",
                  "border-solid cursor-pointer shadow-md ",
                  "transition-all duration-100 ease-in-out"
                )}
                key={team.id}
                onClick={() => setSelectedTeam(team)}
              >
                <div className="flex flex-col gap-4">
                  <Avatar src={getMediaUrl(team.iconUri)} size="lg" />
                  <div className="flex flex-col gap-1">
                    <Title order={4} className="gap-2 items-center flex">
                      {team.name}{" "}
                      {team.access === TeamAccess.PRIVATE && (
                        <Badge size="sm" radius="md">
                          Private
                        </Badge>
                      )}
                    </Title>
                    <Text color="dimmed" lineClamp={2} mb="md">
                      {team.description.replace(/(<([^>]+)>)/gi, "")}
                    </Text>
                    <div className="flex items-center gap-2">
                      <HiCake className="text-dimmed" />
                      <Text size="sm" color="dimmed">
                        {new Date(team.cakeDay).toLocaleDateString()}
                      </Text>
                    </div>
                    <div className="flex items-center gap-2">
                      <HiUsers className="text-dimmed" />
                      <Text size="sm" color="dimmed">
                        {team._count.members + 1} members
                      </Text>
                    </div>
                  </div>
                </div>
              </ShadedCard>
            ))}
          </div>
          <div className="flex items-center justify-center">
            <Button size="lg" onClick={transferToTeam} loading={loading}>
              Transfer {game.name} to {selectedTeam?.name}
            </Button>
          </div>
        </>
      ) : (
        <ShadedCard className="flex flex-col items-center justify-between py-12">
          <ModernEmptyState title="No teams" body="You don't have any teams." />
          <Link href="/teams/new" passHref>
            <Button variant="default" leftIcon={<HiArrowRight />} component="a">
              Create a team
            </Button>
          </Link>
        </ShadedCard>
      )}
    </Framework>
  );
};

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const auth = await authorizedRoute(ctx);
  if (auth.redirect) {
    return auth;
  }

  const { id } = ctx.query;
  const game: Game = JSON.parse(
    JSON.stringify(
      await prisma.game.findFirst({
        where: { id: Number(id) },
        select: gameSelect,
      })
    )
  );

  if (!game) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  if (game.author.id != auth.props.user?.id) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  if (game.teamId) {
    return {
      redirect: {
        destination: "/invent/games",
        permanent: false,
      },
    };
  }

  const usersTeams = await prisma.team.findMany({
    where: {
      ownerId: auth.props.user?.id,
    },
    include: {
      _count: {
        select: {
          members: true,
        },
      },
    },
  });

  return {
    props: {
      game: game,
      user: auth?.props?.user,
      teams: JSON.parse(JSON.stringify(usersTeams)),
    },
  };
}

export default TransferGameToTeam;
