import DataGrid from "@/components/data-grid";
import InlineError from "@/components/inline-error";
import Markdown, { ToolbarItem } from "@/components/markdown";
import Owner from "@/components/owner";
import RenderMarkdown, { parse } from "@/components/render-markdown";
import ShadedCard from "@/components/shaded-card";
import Stateful from "@/components/stateful";
import TeamsViewProvider from "@/components/teams/teams-view";
import { TeamType } from "@/pages/teams";
import useAuthorizedUserStore from "@/stores/useAuthorizedUser";
import IResponseBase from "@/types/api/IResponseBase";
import authorizedRoute from "@/util/auth";
import fetchJson from "@/util/fetch";
import { Fw } from "@/util/fw";
import getMediaUrl from "@/util/get-media";
import { NonUser, User } from "@/util/prisma-types";
import { getTeam } from "@/util/teams";
import {
  ActionIcon,
  Anchor,
  Avatar,
  Button,
  Menu,
  Modal,
  NumberInput,
  Text,
  Title,
  Tooltip,
  useMantineColorScheme,
} from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { openModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { Rating, TeamAccess } from "@prisma/client";
import { getCookie } from "cookies-next";
import { GetServerSideProps } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  HiArrowRight,
  HiCake,
  HiChat,
  HiCheckCircle,
  HiClipboard,
  HiClock,
  HiCog,
  HiDocumentText,
  HiDotsVertical,
  HiExclamationCircle,
  HiGlobe,
  HiLockClosed,
  HiMail,
  HiOfficeBuilding,
  HiOutlineTicket,
  HiTicket,
  HiUsers,
  HiViewGrid,
} from "react-icons/hi";
import { BLACK } from "./issue/create";

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
    staff: {
      id: number;
      username: string;
      avatarUri: string;
    }[];
  };
};

const TeamView: React.FC<TeamViewProps> = ({ user, team: teamInitial }) => {
  const [member, setMember] = useState<boolean | null>(null);
  const [invited, setInvited] = useState<boolean>(false);
  const { copy } = useClipboard();
  const { setProperty } = useAuthorizedUserStore();
  const [shoutEditOpened, setShoutEditOpened] = useState(false);
  const [addFundsOpened, setAddFundsOpened] = useState(false);
  const [team, setTeam] = useState(teamInitial);

  const headers = {
    "Content-Type": "application/json",
    Authorization: String(getCookie(".frameworksession")),
  };

  const updateTeam = (property: keyof TeamType, value: any) => {
    setTeam((prev) => ({ ...prev, [property]: value }));
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
      <Modal
        title="Edit shout"
        opened={shoutEditOpened}
        onClose={() => setShoutEditOpened(false)}
      >
        <Text size="sm" color="dimmed" mb="sm">
          This is the message that will be displayed on your teams&apos; page,
          which will be visible to everyone and can be useful to notify your
          team members about something, like an upcoming event.
        </Text>
        <Text size="sm" color="dimmed" weight={500} mb="lg">
          Limited Markdown is supported.
        </Text>
        <Stateful initialState={team.shoutMd}>
          {(state, setState) => (
            <>
              <Markdown
                toolbar={[
                  ToolbarItem.Bold,
                  ToolbarItem.Url,
                  ToolbarItem.Italic,
                  ToolbarItem.Code,
                  ToolbarItem.Help,
                ]}
                placeholder="Write a shout for your team here..."
                value={state}
                onChange={(value) => setState(value)}
                maxLen={256}
              />
              <div className="flex justify-between mt-4">
                <Text
                  size="sm"
                  color="dimmed"
                  weight={700}
                  className="flex items-center gap-2"
                >
                  <HiDocumentText />
                  {(state && state.length) || 0}/256
                </Text>
                <div className="flex gap-4">
                  <Button
                    variant="default"
                    onClick={() => setShoutEditOpened(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    leftIcon={<HiChat />}
                    onClick={async () => {
                      setShoutEditOpened(false);
                      const res = await fetch(`/api/teams/${team.id}/shout`, {
                        method: "PATCH",
                        headers,
                        body: JSON.stringify({ content: state }),
                      });
                      const json = await res.json();
                      if (res.status === 200) {
                        showNotification({
                          title: "Success",
                          message: "Shout updated successfully.",
                          icon: <HiCheckCircle />,
                        });
                        updateTeam("shout", parse(state));
                        updateTeam("shoutMd", state);
                        updateTeam("shoutUpdatedAt", new Date());
                      } else {
                        showNotification({
                          title: "Error",
                          message:
                            json.message ||
                            "There was an error updating the shout, please try again later.",
                          icon: <HiExclamationCircle />,
                        });
                      }
                    }}
                  >
                    Save and close
                  </Button>
                </div>
              </div>
            </>
          )}
        </Stateful>
      </Modal>
      <Modal
        title="Add funds"
        opened={addFundsOpened}
        onClose={() => setAddFundsOpened(false)}
        className={useMantineColorScheme().colorScheme}
      >
        <Text size="sm" color="dimmed">
          This will add funds to your team&apos;s balance.
        </Text>
        <Stateful>
          {(tickets, setTickets) => (
            <>
              <NumberInput
                icon={<HiTicket />}
                classNames={BLACK}
                label="Ticket amount"
                description="How many tickets do you want to add to your team's balance?"
                my="xl"
                required
                placeholder="450T$"
                value={tickets}
                onChange={(value) => setTickets(value)}
              />
              <div className="flex justify-end mt-4">
                <Stateful initialState={0}>
                  {(confirm, setConfirm) => (
                    <Button
                      leftIcon={<HiArrowRight />}
                      onClick={async () => {
                        setConfirm(confirm + 1);
                        if (confirm === 1) {
                          if (tickets > 1_000_000) {
                            showNotification({
                              title: "Error",
                              message:
                                "You cannot add more than 1,000,000 tickets at once.",
                              icon: <HiExclamationCircle />,
                            });
                            return;
                          }
                          if (user.tickets < tickets) {
                            showNotification({
                              title: "Error",
                              message:
                                "You do not have enough tickets to add this amount.",
                              icon: <HiExclamationCircle />,
                            });
                            return;
                          }
                          await fetchJson<IResponseBase>(
                            `/api/teams/${team.id}/funds/add/${tickets}`,
                            {
                              method: "POST",
                              auth: true,
                            }
                          ).then((res) => {
                            if (res.success) {
                              showNotification({
                                title: "Funds added",
                                message: `You have successfully added T$${tickets} to your team's balance.`,
                                icon: <HiCheckCircle />,
                              });
                              setProperty("tickets", user.tickets - tickets);
                              updateTeam("funds", team.funds + tickets);
                            } else {
                              showNotification({
                                title: "Error",
                                message:
                                  res.message ||
                                  "There was an error adding funds to your team's balance.",
                                icon: <HiExclamationCircle />,
                              });
                            }
                          });
                          setAddFundsOpened(false);
                          setTickets(0);
                          setConfirm(0);
                        }
                      }}
                    >
                      {confirm === 0
                        ? "Confirm transaction"
                        : confirm === 1
                        ? "Are you sure?"
                        : "Confirm transaction"}
                    </Button>
                  )}
                </Stateful>
              </div>
            </>
          )}
        </Stateful>
        <InlineError variant="warning" title="Non-refundable" className="mt-8">
          Any funds contributed to your team&apos;s balance are non-refundable
          and can only be transferred to regular members. They cannot be
          transferred to the owner or staff members.
        </InlineError>
      </Modal>
      <div className="flex items-start flex-col md:flex-row gap-y-4 md:gap-y-0 justify-between mb-8">
        <div className="flex items-start gap-7">
          <Avatar size={100} src={getMediaUrl(team.iconUri)} />
          <div className="flex flex-col gap-2 w-full">
            <div className="flex items-center gap-4">
              {team.access === TeamAccess.PRIVATE && (
                <HiLockClosed className="dark:text-gray-300/50 text-gray-700/50" />
              )}
              <Title order={2}>{team.name}</Title>
            </div>
            <div className="flex justify-between items-center gap-8 w-full">
              <Owner user={team.owner} size={34} className="mt-2" />
              {team.displayFunds && (
                <Tooltip label={`Team funds: ${team.funds} Tickets`}>
                  <div
                    className="flex items-center gap-2 mt-2 text-teal-400 cursor-pointer"
                    onClick={() =>
                      openModal({
                        title: "Team funds",
                        children: (
                          <>
                            <Text size="sm" color="dimmed" align="center">
                              Teams can have Ticket balances which can be used
                              to distribute earnings to giveaway winners, fund
                              development, or anything else you can think of.
                            </Text>
                            <Text
                              size="sm"
                              color="dimmed"
                              mt="md"
                              align="center"
                            >
                              You can add funds to your team by clicking the
                              triple vertical dots in the top right corner of
                              this page, and selecting &quot;Add funds&quot;.
                            </Text>
                          </>
                        ),
                      })
                    }
                  >
                    <HiOutlineTicket />
                    <Text size="sm" weight={500}>
                      T${team.funds}
                    </Text>
                  </div>
                </Tooltip>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 ml-auto">
          <Menu>
            <Menu.Target>
              <ActionIcon size="lg">
                <HiDotsVertical />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Actions</Menu.Label>
              <Menu.Item
                icon={<HiClipboard />}
                onClick={() => {
                  copy(
                    `${window.location.protocol}//${window.location.host}/teams/t/${team.slug}`
                  );
                }}
              >
                Copy team link
              </Menu.Item>
              <Menu.Item icon={<HiClipboard />} onClick={() => copy(team.id)}>
                Copy ID
              </Menu.Item>
              <Menu.Item
                icon={<HiOutlineTicket />}
                onClick={() => setAddFundsOpened(true)}
              >
                Add funds
              </Menu.Item>
              {(team.owner.id === user.id ||
                (team.staff &&
                  team.staff.map((s) => s.id).includes(user.id))) && (
                <>
                  <Menu.Divider />
                  <Menu.Label>Administration</Menu.Label>
                  <Link
                    href={`/teams/t/${team.slug}/settings/general`}
                    passHref
                  >
                    <Menu.Item icon={<HiCog />}>Manage team</Menu.Item>
                  </Link>
                  <Menu.Item
                    icon={<HiChat />}
                    onClick={() => setShoutEditOpened(true)}
                  >
                    Edit shout
                  </Menu.Item>
                </>
              )}
            </Menu.Dropdown>
          </Menu>
          <Button
            color={member === null ? "dark" : member ? "red" : "blue"}
            disabled={
              member === null ||
              team.owner.id === user.id ||
              (team.access === TeamAccess.PRIVATE && !invited && !member) ||
              team.banned.some((b) => b.id === user.id)
            }
            onClick={joinTeam}
            className="ml-auto md:ml-0"
          >
            {member === null
              ? "..."
              : team.banned.some((b) => b.id === user.id)
              ? "Banned"
              : member
              ? "Leave team"
              : team.access === TeamAccess.PRIVATE
              ? invited
                ? "Accept invite"
                : "Private"
              : "Join team"}
          </Button>
        </div>
      </div>
      {team.shout && (
        <ShadedCard className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <Owner
              user={{
                alias: team.name,
                username: team.name,
                avatarUri: team.iconUri,
                verified: false,
              }}
              size={34}
              overrideHref={`/teams/t/${team.slug}`}
            />
            <Text size="sm" color="dimmed" weight={500}>
              {new Date(team.shoutUpdatedAt as Date).toLocaleDateString(
                "en-US",
                {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                }
              )}
            </Text>
          </div>
          <RenderMarkdown>{team.shout}</RenderMarkdown>
        </ShadedCard>
      )}
      <ShadedCard>
        <Text weight={500} color="dimmed" mb="sm">
          Description
        </Text>
        <RenderMarkdown>
          {team.description || "No description provided."}
        </RenderMarkdown>
      </ShadedCard>
      <DataGrid
        mdCols={3}
        smCols={2}
        defaultCols={1}
        items={[
          {
            tooltip: "Cake day",
            icon: <HiCake />,
            value: `Joined ${new Date(team.cakeDay as Date).toLocaleDateString(
              "en-US",
              {
                year: "numeric",
                month: "short",
                day: "numeric",
              }
            )}`,
          },
          {
            tooltip: "Members",
            icon: <HiUsers />,
            value: `${team._count.members + 1} members`,
          },
          {
            tooltip: "Games",
            icon: <HiViewGrid />,
            value: `${team._count.games} games`,
          },
          {
            tooltip: "Open issues",
            icon: <HiExclamationCircle />,
            value: team._count.issues + " open issue(s)",
          },
          {
            tooltip: "Contact email",
            icon: <HiMail />,
            value: team.email || "Unprovided",
          },
          {
            tooltip: "Website",
            icon: <HiGlobe />,
            value:
              (
                <Anchor onClick={() => Fw.Links.externalWarning(team.website!)}>
                  {team.website}
                </Anchor>
              ) || "Unprovided",
          },
          {
            tooltip: "Based in",
            icon: <HiOfficeBuilding />,
            value: team.location || "Unprovided",
          },
          {
            tooltip: "Timezone",
            icon: <HiClock />,
            value: team.timezone || "Unprovided",
          },
          {
            tooltip: "Funds",
            icon: <HiOutlineTicket />,
            value: `T$${team.funds}`,
          },
        ]}
      />
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
