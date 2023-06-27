import ModernEmptyState from "@/components/ModernEmptyState";
import Owner from "@/components/Owner";
import ShadedCard from "@/components/ShadedCard";
import Stateful from "@/components/Stateful";
import { AutomodTriggerWithUser } from "@/pages/api/admin/[[...params]]";
import IResponseBase from "@/types/api/IResponseBase";
import clsx from "@/util/clsx";
import fetchJson from "@/util/fetch";
import {
  CloseButton,
  Code,
  Pagination,
  Skeleton,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { AnimatePresence, motion } from "framer-motion";
import { FC, useEffect, useState } from "react";
import { HiCheckCircle } from "react-icons/hi";

const Automod: FC = () => {
  const [entries, setEntries] = useState<AutomodTriggerWithUser[]>();
  const [pages, setPages] = useState<number>(1);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  const getAutomodEntries = async () => {
    setLoading(true);
    await fetchJson<
      IResponseBase<{ pages: number; automod: AutomodTriggerWithUser[] }>
    >(
      "/api/admin/automod?" +
        new URLSearchParams({ page: String(page) }).toString(),
      {
        method: "GET",
        auth: true,
      }
    )
      .then((res) => {
        if (res.success) {
          setEntries(res.data?.automod);
          setPages(Number(res.data?.pages));
        }
      })
      .finally(() => setLoading(false));
  };

  const deleteEntry = async (id: string) => {
    await fetchJson<IResponseBase<null>>(`/api/admin/automod/${id}`, {
      method: "DELETE",
      auth: true,
    }).then((res) => {
      if (res.success) {
        getAutomodEntries();
        showNotification({
          title: "Success",
          message: "Automod entry deleted.",
          color: "green",
          icon: <HiCheckCircle />,
        });
      }
    });
  };

  useEffect(() => {
    getAutomodEntries();
  }, [page]);

  return (
    <>
      <div className="flex items-center justify-center mb-6">
        <Pagination total={pages} page={page} radius="md" onChange={setPage} />
      </div>
      <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
        {loading ? (
          Array.from({ length: 10 }).map((_, i) => (
            <Skeleton height={120} key={i} />
          ))
        ) : entries?.length! > 0 ? (
          entries?.map((entry) => (
            <Stateful key={entry.id}>
              {(open, setOpen) => (
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <ShadedCard
                    className="cursor-pointer"
                    onClick={() => setOpen(!open)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Title order={4}>{entry.reference}</Title>
                        <Tooltip label="Click to copy ID: for use in internal notes">
                          <Code
                            className="dark:bg-black bg-white"
                            onClick={(e: React.MouseEvent) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(entry.id);
                            }}
                          >
                            {entry.id.split("-").shift()}
                          </Code>
                        </Tooltip>
                      </div>
                      <CloseButton
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteEntry(entry.id);
                        }}
                      />
                    </div>
                    <Text size="sm" color="dimmed" mt="xs">
                      <code>{entry.reference}</code> trigger for user{" "}
                      <code>{entry.user.username}</code>
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
                                theme.colorScheme === "dark" ? "#000" : "#FFF",
                            })}
                          >
                            <div className="flex flex-col gap-1 mb-4">
                              <Text color="dimmed">Content</Text>
                              <Text weight={500} className="font-mono">
                                {entry.content}
                              </Text>
                            </div>
                            <Text color="dimmed" className="mb-1">
                              Matched words ({entry.matched.length})
                            </Text>
                            <div className="grid grid-cols-2 gap-6">
                              {entry.matched.map((r, i) => (
                                <div
                                  className={clsx(
                                    "flex flex-col col-span-full md:col-span-1"
                                  )}
                                  key={i}
                                >
                                  <Text weight={500}>{r}</Text>
                                </div>
                              ))}
                            </div>
                          </ShadedCard>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    <Text color="dimmed" weight={500} mt="lg" mb="md">
                      {new Date(entry.createdAt as Date).toLocaleString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "numeric",
                          minute: "numeric",
                        }
                      )}
                    </Text>
                    <Owner user={entry.user} />
                  </ShadedCard>
                </motion.div>
              )}
            </Stateful>
          ))
        ) : (
          <ShadedCard className="col-span-full flex items-center justify-center">
            <ModernEmptyState
              title="No entries"
              body="No automod entries were found. Hooray!"
            />
          </ShadedCard>
        )}
      </div>
    </>
  );
};

export default Automod;
