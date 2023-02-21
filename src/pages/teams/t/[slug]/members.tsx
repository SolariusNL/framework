import { Pagination, Skeleton } from "@mantine/core";
import { Rating } from "@prisma/client";
import { getCookie } from "cookies-next";
import { GetServerSideProps } from "next";
import { useEffect, useState } from "react";
import { TeamType } from "../..";
import { Friend } from "../../../../components/Home/FriendsWidget";
import TeamsViewProvider from "../../../../components/Teams/TeamsView";
import authorizedRoute from "../../../../util/auth";
import { NonUser, User } from "../../../../util/prisma-types";
import { getTeam } from "../../../../util/teams";

export type TeamViewMembersProps = {
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

const TeamViewMembers: React.FC<TeamViewMembersProps> = ({ user, team }) => {
  const [members, setMembers] = useState<NonUser[]>();
  const [pages, setPages] = useState<number>(1);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchMembers = async () => {
    setLoading(true);
    await fetch(`/api/teams/${team.id}/members/${page}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setMembers(res.members);
        setPages(res.pages);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMembers();
  }, [page]);

  return (
    <TeamsViewProvider user={user} team={team} active="members">
      <Pagination
        radius="md"
        total={pages}
        page={page}
        onChange={setPage}
        mb="xl"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading
          ? Array.from(Array(8).keys()).map((i) => (
              <Skeleton height={100} key={i} />
            ))
          : members && (
              <>
                {members.map((member) => (
                  <Friend friend={member} key={member.id} />
                ))}
                {page === 1 && <Friend friend={team.owner} />}
              </>
            )}
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

  return {
    props: {
      user: auth.props.user,
      team: JSON.parse(JSON.stringify(team)),
    },
  };
};

export default TeamViewMembers;
