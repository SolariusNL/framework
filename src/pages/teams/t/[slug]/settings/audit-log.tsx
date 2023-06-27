import ModernEmptyState from "@/components/ModernEmptyState";
import Owner from "@/components/Owner";
import ShadedCard from "@/components/ShadedCard";
import Stateful from "@/components/Stateful";
import TeamsViewProvider from "@/components/Teams/TeamsView";
import auditLogMeta from "@/data/auditLog";
import { TeamType } from "@/pages/teams";
import authorizedRoute from "@/util/auth";
import clsx from "@/util/clsx";
import { NonUser, User } from "@/util/prisma-types";
import { getTeam } from "@/util/teams";
import { Group, Pagination, Select, Text, Title } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { Rating, TeamAuditLog, TeamAuditLogType } from "@prisma/client";
import { getCookie } from "cookies-next";
import { AnimatePresence, motion } from "framer-motion";
import { GetServerSideProps } from "next";
import React, { forwardRef, useEffect, useState } from "react";
import { HiGlobe, HiXCircle } from "react-icons/hi";
import { IconType } from "react-icons/lib";

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
    verified: boolean;
  };
  rows: {
    key: string;
    value: string;
  }[];
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
                ? "dark:text-teal-500/70"
                : type === "remove"
                ? "dark:text-red-500/70"
                : "dark:text-orange-500/70",
              active && "!text-white",
              type === "all" && "!text-white",
              "flex-shrink-0"
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
        new URLSearchParams({
          type,
        }).toString(),
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
      <div className="flex items-center justify-between flex-col gap-y-2 md:gap-y-0 md:flex-row">
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
          styles={() => ({
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
      <div className="mt-6 flex flex-col gap-4">
        {audits &&
        audits.filter((a) => {
          if (type === "ALL") return true;
          return a.type === type;
        }).length === 0 ? (
          <ShadedCard className="col-span-full">
            <ModernEmptyState
              title="No entries"
              body="There are no audit log entries with the provided filters."
            />
          </ShadedCard>
        ) : (
          audits
            ?.filter((a) => {
              if (type === "ALL") return true;
              return a.type === type;
            })
            .map((a, i) => (
              <Stateful key={i}>
                {(open, setOpen) => (
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <ShadedCard
                      className="cursor-pointer"
                      onClick={() => setOpen(!open)}
                    >
                      <Title order={4} className="!font-mono">
                        {auditLogMeta.get(a.type)?.label}
                      </Title>
                      <Text size="sm" color="dimmed" mt="xs">
                        {a.content}
                      </Text>
                      <AnimatePresence mode="wait" initial={false}>
                        {open && (
                          <motion.div
                            initial={{
                              opacity: 0,
                              y: -20,
                              height: 0,
                              marginTop: 8,
                            }}
                            animate={{
                              opacity: 1,
                              y: 0,
                              height: "auto",
                              marginTop: 12,
                            }}
                            exit={{
                              opacity: 0,
                              y: -20,
                              height: 0,
                              marginTop: 0,
                            }}
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 30,
                              delay: 0.05,
                            }}
                          >
                            <ShadedCard
                              sx={(theme) => ({
                                backgroundColor:
                                  theme.colorScheme === "dark"
                                    ? "#000"
                                    : "#FFF",
                              })}
                              className="grid grid-cols-2 gap-6"
                            >
                              {a.rows.map((r, i) => (
                                <div
                                  className={clsx(
                                    "flex flex-col col-span-full md:col-span-1"
                                  )}
                                  key={i}
                                >
                                  <Text color="dimmed">{r.key}</Text>
                                  <Text weight={500}>{r.value}</Text>
                                </div>
                              ))}
                            </ShadedCard>
                          </motion.div>
                        )}
                      </AnimatePresence>
                      <Text color="dimmed" weight={500} mt="lg" mb="md">
                        {new Date(a.createdAt as Date).toLocaleString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "numeric",
                          minute: "numeric",
                        })}
                      </Text>
                      <Owner user={a.user} />
                    </ShadedCard>
                  </motion.div>
                )}
              </Stateful>
            ))
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
  if (team.ownerId !== auth.props.user?.id) {
    if (!team.staff?.find((s) => s.id === auth.props.user?.id)) {
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
