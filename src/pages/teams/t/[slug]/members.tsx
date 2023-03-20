import {
  ActionIcon,
  Button,
  Menu,
  Pagination,
  Skeleton,
  Text,
} from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { Rating } from "@prisma/client";
import { getCookie } from "cookies-next";
import { GetServerSideProps } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import { HiArrowRight, HiDotsVertical, HiXCircle } from "react-icons/hi";
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

  const isStaff = (user: NonUser) => {
    return (
      team.owner.id === user.id ||
      (team.staff && team.staff.map((s) => s.id).includes(user.id))
    );
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
                  <Friend friend={member} key={member.id}>
                    {isStaff(user) && (
                      <div className="flex flex-row items-center justify-center gap-3 w-full">
                        <Button
                          color="red"
                          leftIcon={<HiXCircle />}
                          variant="light"
                          sx={{
                            flex: "0 0 85%",
                          }}
                          disabled={
                            (isStaff(member) &&
                              team.staff &&
                              team.staff.map((s) => s.id).includes(user.id)) ||
                            member.id === user.id
                          }
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            openConfirmModal({
                              title: "Confirm removal",
                              children: (
                                <>
                                  <Text size="sm" color="dimmed">
                                    Are you sure you want to remove{" "}
                                    {member.username} from the team? They can
                                    still rejoin if they want, but can be
                                    prevented by banning them available in the
                                    context menu.
                                  </Text>
                                </>
                              ),
                              labels: { confirm: "Remove", cancel: "Cancel" },
                              confirmProps: { color: "red" },
                              async onConfirm() {
                                await fetch(
                                  `/api/teams/${team.id}/users/${member.id}`,
                                  {
                                    method: "DELETE",
                                    headers: {
                                      "Content-Type": "application/json",
                                      Authorization: String(
                                        getCookie(".frameworksession")
                                      ),
                                    },
                                  }
                                ).then((res) => {
                                  if (res.status === 200) {
                                    fetchMembers();
                                  } else {
                                    showNotification({
                                      title: "Error",
                                      message:
                                        "Failed to remove user. May be insufficient permissions.",
                                      color: "red",
                                      icon: <HiXCircle />,
                                    });
                                  }
                                });
                              },
                            });
                          }}
                        >
                          Remove
                        </Button>
                        <Menu>
                          <Menu.Target>
                            <ActionIcon
                              size="lg"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <HiDotsVertical />
                            </ActionIcon>
                          </Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Label>User administration</Menu.Label>
                            <Link href={`/profile/${member.username}`}>
                              <Menu.Item icon={<HiArrowRight />}>
                                View profile
                              </Menu.Item>
                            </Link>
                            <Menu.Item
                              icon={<HiXCircle />}
                              color="red"
                              disabled={
                                (isStaff(member) &&
                                  team.staff &&
                                  team.staff
                                    .map((s) => s.id)
                                    .includes(user.id)) ||
                                member.id === user.id
                              }
                              onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                openConfirmModal({
                                  title: "Confirm ban",
                                  children: (
                                    <>
                                      <Text size="sm" color="dimmed">
                                        Are you sure you want to ban{" "}
                                        {member.username} from the team? They
                                        will not be able to rejoin unless
                                        unbanned.
                                      </Text>
                                    </>
                                  ),
                                  confirmProps: { color: "red" },
                                  labels: { confirm: "Ban", cancel: "Cancel" },
                                  async onConfirm() {
                                    await fetch(
                                      `/api/teams/${team.id}/users/${member.id}/ban`,
                                      {
                                        method: "POST",
                                        headers: {
                                          "Content-Type": "application/json",
                                          Authorization: String(
                                            getCookie(".frameworksession")
                                          ),
                                        },
                                      }
                                    ).then((res) => {
                                      if (res.status === 200) {
                                        fetchMembers();
                                      } else {
                                        showNotification({
                                          title: "Error",
                                          message:
                                            "Failed to ban user. May be insufficient permissions.",
                                          color: "red",
                                          icon: <HiXCircle />,
                                        });
                                      }
                                    });
                                  },
                                });
                              }}
                            >
                              Ban
                            </Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </div>
                    )}
                  </Friend>
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
