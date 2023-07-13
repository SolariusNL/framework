import DataGrid from "@/components/DataGrid";
import LoadingIndicator from "@/components/LoadingIndicator";
import ModernEmptyState from "@/components/ModernEmptyState";
import RenderMarkdown from "@/components/RenderMarkdown";
import ShadedButton from "@/components/ShadedButton";
import ShadedCard from "@/components/ShadedCard";
import TeamsViewProvider from "@/components/Teams/TeamsView";
import IResponseBase from "@/types/api/IResponseBase";
import authorizedRoute from "@/util/auth";
import clsx from "@/util/clsx";
import fetchJson from "@/util/fetch";
import { Fw } from "@/util/fw";
import { User } from "@/util/prisma-types";
import { getTeam } from "@/util/teams";
import {
  ActionIcon,
  Badge,
  Button,
  Divider,
  Select,
  Skeleton,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { TeamGiveaway as TeamGiveawayBase } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import { GetServerSideProps } from "next";
import { FC, useEffect, useState } from "react";
import {
  HiArrowLeft,
  HiCheckCircle,
  HiOutlineGift,
  HiOutlineLogin,
  HiOutlineLogout,
  HiOutlineSearch,
  HiOutlineTicket,
  HiOutlineUserGroup,
  HiSortAscending,
  HiXCircle,
} from "react-icons/hi";
import { TeamType } from "../..";

export type TeamViewGiveawaysProps = {
  user: User;
  team: TeamType;
};
type TeamGiveaway = TeamGiveawayBase & {
  _count: {
    participants: number;
  };
};
type FetchGiveawaysResponse = IResponseBase<{
  giveaways: TeamGiveaway[];
}>;
type SortGiveawayFnType = Pick<TeamGiveaway, "name" | "tickets" | "createdAt">;
export type GiveawaySort = "title" | "created_at" | "tickets";

const TeamViewGiveaways: FC<TeamViewGiveawaysProps> = ({ user, team }) => {
  const [giveaways, setGiveaways] = useState<TeamGiveaway[]>();
  const [search, setSearch] = useState("");
  const [giveawaySort, setGiveawaySort] = useState<GiveawaySort>("tickets");
  const [loading, setLoading] = useState(true);
  const [selectedGiveaway, setSelectedGiveaway] = useState<
    TeamGiveaway | undefined
  >();
  const [selectedGiveawayCountdown, setSelectedGiveawayCountdown] = useState<
    number | undefined
  >(undefined);
  const [participating, setParticipating] = useState<boolean | undefined>(
    undefined
  );

  const searchFn = (giveaway: TeamGiveaway) => {
    if (search.length === 0) return true;
    return giveaway.name.toLowerCase().includes(search.toLowerCase());
  };
  const sortFn = (a: SortGiveawayFnType, b: SortGiveawayFnType) => {
    if (giveawaySort === "title") {
      return a.name.localeCompare(b.name);
    } else if (giveawaySort === "tickets") {
      return a.tickets > b.tickets ? 1 : 0;
    } else if (giveawaySort === "created_at") {
      return a.createdAt > b.createdAt ? 1 : 0;
    }
    return 0;
  };

  const fetchGiveaways = async () => {
    setLoading(true);

    await fetchJson<FetchGiveawaysResponse>(`/api/teams/${team.id}/giveaways`, {
      method: "GET",
      auth: true,
    })
      .then((res) => {
        if (res.success && res.data) {
          setGiveaways(res.data.giveaways);
        } else {
          showNotification({
            title: "An error occurred",
            message: "An error occurred when fetching this teams giveaways.",
            color: "red",
            icon: <HiXCircle />,
          });
        }
      })
      .finally(() => setLoading(false));
  };

  const fetchParticipating = async () => {
    await fetchJson<IResponseBase<{ participating: boolean }>>(
      `/api/teams/${team.id}/giveaways/${selectedGiveaway?.id}/participating`,
      {
        auth: true,
        method: "GET",
      }
    ).then((res) => {
      if (res.success) {
        setParticipating(res.data?.participating);
      } else {
        showNotification({
          title: "An error occurred",
          message:
            "An error occurred when acquiring the current participation status for this giveaway.",
          icon: <HiXCircle />,
          color: "red",
        });
      }
    });
  };

  const toggleParticipationStatus = async () => {
    setParticipating(!participating);

    await fetchJson<IResponseBase>(
      `/api/teams/${team.id}/giveaways/${selectedGiveaway?.id}/join`,
      {
        auth: true,
        method: "PATCH",
      }
    ).then((res) => {
      if (res.success) {
        showNotification({
          title: participating ? "Left giveaway" : "Joined giveaway",
          message: `You've ${participating ? "left" : "joined"} this giveaway.`,
          icon: <HiCheckCircle />,
        });
      }
    });
  };

  useEffect(() => {
    fetchGiveaways();
  }, []);

  useEffect(() => {
    if (selectedGiveaway !== undefined) {
      fetchParticipating();
      const countdown = setInterval(() => {
        setSelectedGiveawayCountdown(
          Math.floor(
            (new Date(selectedGiveaway?.endsAt).getTime() - Date.now()) / 1000
          )
        );
      }, 1000);
      return () => clearInterval(countdown);
    }
  }, [selectedGiveaway]);

  return (
    <TeamsViewProvider active="giveaways" team={team} user={user}>
      <AnimatePresence mode="wait" initial={false}>
        {selectedGiveaway !== undefined ? (
          <motion.div
            key="server-details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
            }}
          >
            {selectedGiveaway && (
              <>
                {" "}
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-5">
                    <div className="flex items-center md:gap-6 gap-2">
                      <ActionIcon
                        onClick={() => {
                          setSelectedGiveaway(undefined);
                          setSelectedGiveawayCountdown(undefined);
                        }}
                        size="xl"
                        className="rounded-full hover:border-zinc-500/50 transition-all"
                        sx={{
                          borderWidth: 1,
                        }}
                      >
                        <HiArrowLeft />
                      </ActionIcon>
                      <HiOutlineGift size={32} />
                    </div>
                    <div>
                      <Title order={3}>{selectedGiveaway.name}</Title>
                      <Text color="dimmed" size="sm">
                        Ends on{" "}
                        <span className="font-semibold">
                          {new Date(
                            selectedGiveaway.endsAt
                          ).toLocaleDateString()}
                        </span>
                      </Text>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={toggleParticipationStatus}
                      leftIcon={
                        participating ? <HiOutlineLogout /> : <HiOutlineLogin />
                      }
                    >
                      {participating ? "Leave" : "Join"}
                    </Button>
                  </div>
                </div>
                <Divider className="my-8" />
                <div className="min-h-full flex gap-4 md:flex-row flex-col">
                  <div className="flex-1">
                    <Text color="dimmed" weight={500}>
                      Description
                    </Text>
                    <ShadedCard className="mt-2">
                      <RenderMarkdown proseAddons="prose-sm">
                        {selectedGiveaway.description}
                      </RenderMarkdown>
                    </ShadedCard>
                  </div>
                  <div className="flex-1">
                    <DataGrid
                      mdCols={2}
                      smCols={1}
                      defaultCols={2}
                      items={[
                        {
                          tooltip: "Tickets",
                          icon: <HiOutlineTicket />,
                          value: `T$${selectedGiveaway.tickets}`,
                        },
                        {
                          tooltip: "Participants",
                          icon: <HiOutlineUserGroup />,
                          value: `${
                            selectedGiveaway._count.participants
                          } ${Fw.Strings.pluralize(
                            selectedGiveaway._count.participants,
                            "participant"
                          )}`,
                        },
                      ]}
                      className="mt-0"
                    />
                    <div className="flex justify-center mt-4">
                      {selectedGiveawayCountdown ? (
                        <Title order={2}>
                          {selectedGiveawayCountdown > 0
                            ? `${Math.floor(
                                selectedGiveawayCountdown / 86400
                              )}d ${Math.floor(
                                (selectedGiveawayCountdown % 86400) / 3600
                              )}h ${Math.floor(
                                ((selectedGiveawayCountdown % 86400) % 3600) /
                                  60
                              )}m ${Math.floor(
                                ((selectedGiveawayCountdown % 86400) % 3600) %
                                  60
                              )}s`
                            : "Ended"}
                        </Title>
                      ) : (
                        <Skeleton width={200} height={36} />
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{
                opacity: 0,
                x: !selectedGiveaway ? 20 : 0,
              }}
              animate={{ opacity: 1, x: 0 }}
              exit={{
                opacity: 0,
                x: !selectedGiveaway ? 20 : 0,
              }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 30,
              }}
            >
              {loading ? (
                <ShadedCard className="flex w-full justify-center p-8">
                  <LoadingIndicator />
                </ShadedCard>
              ) : giveaways &&
                giveaways.filter(searchFn).sort(sortFn).length > 0 ? (
                <>
                  <div
                    className={clsx(
                      "flex-initial flex-col md:flex-row flex items-center gap-4",
                      "items-stretch md:items-center mb-8"
                    )}
                  >
                    <TextInput
                      icon={<HiOutlineSearch />}
                      placeholder="Search for a giveaway"
                      sx={{
                        flex: "0 0 70%",
                      }}
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                      }}
                    />
                    <Select
                      icon={<HiSortAscending />}
                      value={giveawaySort}
                      onChange={(v) => {
                        setGiveawaySort(v as GiveawaySort);
                      }}
                      data={
                        [
                          { value: "name", label: "Name" },
                          { value: "created_at", label: "Created at" },
                          { value: "tickets", label: "Tickets" },
                        ] as { value: GiveawaySort; label: string }[]
                      }
                      placeholder="Sort by..."
                    />
                  </div>
                  <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
                    {giveaways
                      .filter(searchFn)
                      .sort(sortFn)
                      .map((g, i) => (
                        <ShadedButton
                          className="w-full flex flex-col gap-2"
                          onClick={() => setSelectedGiveaway(g)}
                          key={i}
                        >
                          <div className="flex flex-col w-full gap-2">
                            <div className="flex justify-between">
                              <Badge radius="md" color="blue">
                                T${g.tickets}
                              </Badge>
                              <Text size="sm" color="dimmed">
                                Ends{" "}
                                <span className="font-semibold">
                                  {new Date(g.endsAt).toLocaleDateString()}
                                </span>
                              </Text>
                            </div>
                            <div className="flex items-center gap-3">
                              <HiOutlineGift className="dark:text-sky-500 flex-shrink-0 text-sky-600 -mt-1" />
                              <Title order={3}>{g.name}</Title>
                            </div>
                          </div>
                          <span className="text-sm text-dimmed">
                            <RenderMarkdown proseAddons="text-sm line-clamp-2">
                              {g.description}
                            </RenderMarkdown>
                          </span>
                        </ShadedButton>
                      ))}
                  </div>
                </>
              ) : (
                <ShadedCard>
                  <ModernEmptyState
                    title="No giveaways"
                    body="No giveaways were found at this time."
                  />
                </ShadedCard>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
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

export default TeamViewGiveaways;
