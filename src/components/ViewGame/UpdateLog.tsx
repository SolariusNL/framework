import ModernEmptyState from "@/components/ModernEmptyState";
import ShadedButton from "@/components/ShadedButton";
import ShadedCard from "@/components/ShadedCard";
import UpdateCard from "@/components/UpdateCard";
import ViewGameTab from "@/components/ViewGame/ViewGameTab";
import { BLACK } from "@/pages/teams/t/[slug]/issue/create";
import clsx from "@/util/clsx";
import fetchJson from "@/util/fetch";
import { Fw } from "@/util/fw";
import { Game } from "@/util/prisma-types";
import { Avatar, Pagination, Text } from "@mantine/core";
import { openModal } from "@mantine/modals";
import { useEffect, useState } from "react";
import { HiArrowRight } from "react-icons/hi";

interface UpdateLogTabProps {
  game: Game;
}

const UpdateLogTab = ({ game }: UpdateLogTabProps) => {
  const [updateLogs, setUpdateLogs] = useState(game.updateLogs);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);

  const getUpdates = async () => {
    await fetchJson<{
      updates: Game["updateLogs"];
      pages: number;
    }>(`/api/games/updates/${game.id}/${page}`, {
      auth: true,
    }).then((res) => {
      setUpdateLogs(res.updates);
      setPages(res.pages);
    });
  };

  useEffect(() => {
    getUpdates();
  }, [page]);

  return (
    <ViewGameTab
      value="updatelog"
      title="Versions"
      description="See updates that have been posted for this game."
    >
      {updateLogs.length > 0 ? (
        <>
          <div className="w-full flex justify-center mb-4">
            <Pagination
              radius="xl"
              page={page}
              onChange={setPage}
              total={pages || 1}
              withEdges
              classNames={{
                item: BLACK.input,
              }}
            />
          </div>
          <ShadedCard className="p-0">
            {updateLogs.map((updateLog, i) => (
              <ShadedButton
                className={clsx(
                  "px-4 dark:hover:bg-zinc-900/50 group flex justify-between",
                  i === 0
                    ? "rounded-t-md rounded-b-none"
                    : i === updateLogs.length - 1
                    ? "rounded-b-md rounded-t-none"
                    : "rounded-none"
                )}
                key={updateLog.id}
                onClick={() =>
                  openModal({
                    title: updateLog.title,
                    children: <UpdateCard update={updateLog} />,
                  })
                }
              >
                <div className="flex items-start gap-2 w-[90%]">
                  <div className="flex-shrink-0">
                    <Avatar
                      className="mr-2 h-8 w-12 rounded-full"
                      color={Fw.Strings.color(updateLog.title)}
                    >
                      <span className="text-sm">{updateLog.tag}</span>
                    </Avatar>
                  </div>

                  <div className="flex flex-col w-full">
                    <div className="flex items-center gap-2 w-full">
                      <Text
                        size="sm"
                        mr={6}
                        weight={500}
                        className="truncate"
                        sx={{
                          maxWidth: "75%",
                        }}
                      >
                        {updateLog.title}
                      </Text>
                    </div>

                    <Text size="sm" color="dimmed">
                      {Fw.Strings.upper(updateLog.type)}
                    </Text>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between w-full h-full gap-2 text-right">
                  <HiArrowRight className="text-dimmed group-hover:opacity-100 transition-all opacity-0" />
                  <Text size="xs" color="dimmed">
                    {Fw.Dates.format(
                      new Date(updateLog.createdAt),
                      "MMMM dd, yyyy"
                    )}
                  </Text>
                </div>
              </ShadedButton>
            ))}
          </ShadedCard>
        </>
      ) : (
        <ModernEmptyState
          title="No updates yet"
          body="Updates will appear here when they are posted."
        />
      )}
    </ViewGameTab>
  );
};

export default UpdateLogTab;
