import { Avatar, Button, Text } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { Team } from "@prisma/client";
import { getCookie } from "cookies-next";
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { HiArrowRight, HiCake, HiCheckCircle, HiUsers } from "react-icons/hi";
import Framework from "../../../../components/Framework";
import ModernEmptyState from "../../../../components/ModernEmptyState";
import ShadedCard from "../../../../components/ShadedCard";
import authorizedRoute from "../../../../util/auth";
import clsx from "../../../../util/clsx";
import getMediaUrl from "../../../../util/get-media";
import prisma from "../../../../util/prisma";
import { Game, gameSelect, User } from "../../../../util/prisma-types";

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
          router.push("/invent");
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
          <div className="grid md:grid-cols-2 gap-4 grid-cols-1 mb-12">
            {teams.map((team) => (
              <ShadedCard
                className={clsx(
                  team.id == selectedTeam?.id
                    ? "dark:border-blue-700 border-blue-500"
                    : "border-gray-200 dark:border-zinc-700 !border-opacity-40",
                  "border-solid cursor-pointer shadow-md ",
                  "transition-all duration-100 ease-in-out"
                )}
                key={team.id}
                onClick={() => setSelectedTeam(team)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <Avatar src={getMediaUrl(team.iconUri)} size="xl" />
                    <div className="flex flex-col gap-1">
                      <Text size="xl" weight={500}>
                        {team.name}
                      </Text>
                      <div className="flex items-center gap-2">
                        <Avatar
                          src={getMediaUrl(user.avatarUri)}
                          size="sm"
                          className="rounded-full"
                        />
                        <Text size="sm" color="dimmed">
                          @{user.username}
                        </Text>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <HiCake className="text-gray-400" />
                      <Text size="sm" color="dimmed">
                        {new Date(team.cakeDay).toLocaleDateString()}
                      </Text>
                    </div>
                    <div className="flex items-center gap-2">
                      <HiUsers className="text-gray-400" />
                      <Text size="sm" color="dimmed">
                        {team._count.members} members
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
        destination: "/invent",
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