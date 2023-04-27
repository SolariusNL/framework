import {
  Avatar,
  Badge,
  Button,
  Loader,
  Modal,
  Pagination,
  Select,
  Text,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { SupportTicket, SupportTicketStatus } from "@prisma/client";
import { getCookie } from "cookies-next";
import { useEffect, useState } from "react";
import { HiCheckCircle, HiInformationCircle } from "react-icons/hi";
import sanitize from "sanitize-html";
import useAuthorizedUserStore from "../../../stores/useAuthorizedUser";
import getMediaUrl from "../../../util/get-media";
import { NonUser } from "../../../util/prisma-types";
import { supportSanitization } from "../../../util/sanitize";
import ModernEmptyState from "../../ModernEmptyState";
import RenderMarkdown from "../../RenderMarkdown";
import ShadedButton from "../../ShadedButton";
import ShadedCard from "../../ShadedCard";
import Stateful from "../../Stateful";
import UserContext from "../../UserContext";

const Tickets: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<
    Array<
      SupportTicket & {
        author: NonUser;
        claimedBy: NonUser | null;
      }
    >
  >([]);
  const { user } = useAuthorizedUserStore();
  const { colors } = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(0);
  const [status, setStatus] = useState<"OPEN" | "CLOSED" | "ALL">("ALL");
  const [filter, setFilter] = useState<
    "CLAIMED_BY_ME" | "CLAIMED" | "UNCLAIMED" | "ALL"
  >("ALL");

  const updateTicket = (
    id: string,
    data: Partial<
      SupportTicket & {
        claimedBy: NonUser | null;
      }
    >
  ) => {
    setTickets(
      tickets.map((ticket) => {
        if (ticket.id === id) {
          return { ...ticket, ...data };
        }
        return ticket;
      })
    );
  };

  const getTickets = async () => {
    await fetch(
      `/api/admin/tickets/${page}?` +
        new URLSearchParams({
          status: status || "ALL",
          filter: filter || "ALL",
        }),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: String(getCookie(".frameworksession")),
        },
      }
    )
      .then((res) => res.json())
      .then((res) => {
        setTickets(res.tickets);
        setLoading(false);
        setPages(res.pages);
      });
  };

  useEffect(() => {
    setLoading(true);
    getTickets();
  }, []);

  useEffect(() => {
    setLoading(true);
    getTickets();
  }, [page, status, filter]);

  return (
    <>
      <div className="flex items-center gap-6 flex-wrap md:flex-nowrap mb-8">
        <Pagination
          total={pages}
          page={page}
          onChange={setPage}
          radius="md"
          withEdges
        />
        <Select
          className="flex items-center gap-2"
          label="Status"
          placeholder="Sort by status"
          data={[
            { label: "All", value: "ALL" },
            { label: "Open", value: "OPEN" },
            { label: "Closed", value: "CLOSED" },
          ]}
          value={status}
          onChange={(v) => setStatus(v as any)}
        />
        <Select
          className="flex items-center gap-2"
          label="Filter"
          placeholder="Filter by"
          data={
            [
              { label: "All", value: "ALL" },
              { label: "Claimed by me", value: "CLAIMED_BY_ME" },
              { label: "Claimed", value: "CLAIMED" },
              { label: "Unclaimed", value: "UNCLAIMED" },
            ] as any
          }
          onChange={(v) => {
            setFilter(v as any);
          }}
          value={filter}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {loading ? (
          <Loader />
        ) : tickets.length === 0 ? (
          <ShadedCard className="col-span-3">
            <ModernEmptyState
              title="No tickets"
              body="No tickets have been created yet"
            />
          </ShadedCard>
        ) : tickets ? (
          tickets.map((ticket) => (
            <Stateful key={ticket.id}>
              {(opened, setOpened) => (
                <>
                  <ShadedButton
                    key={ticket.id}
                    onClick={() => {
                      setOpened(true);
                    }}
                    className="flex flex-col gap-4"
                  >
                    <div className="flex justify-between">
                      <div>
                        <Text size="lg" weight={500}>
                          {ticket.title}
                        </Text>
                        <Text color="dimmed" size="sm" lineClamp={2}>
                          {sanitize(
                            ticket.content,
                            supportSanitization
                          ).replace(/<[^>]*>?/gm, "")}
                        </Text>
                      </div>
                      <div>
                        <Badge
                          color={
                            ticket.status === SupportTicketStatus.CLOSED
                              ? "red"
                              : "green"
                          }
                        >
                          {ticket.status}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      {[
                        ["Unclaimed", ticket.claimedBy === null],
                        ["Claimed", ticket.claimedBy !== null],
                        ["Your ticket", ticket.claimedBy?.id === user?.id],
                      ]
                        .filter(([, value]) => value)
                        .map(([label]) => (
                          <div
                            className="flex items-center gap-2"
                            key={String(label)}
                          >
                            <HiInformationCircle color={colors.gray[7]} />
                            <Text color="dimmed" size="sm">
                              {label}
                            </Text>
                          </div>
                        ))}
                    </div>
                  </ShadedButton>
                  <Modal
                    title={ticket.title}
                    opened={opened}
                    className={colorScheme}
                    onClose={() => setOpened(false)}
                  >
                    <>
                      <RenderMarkdown>{ticket.content}</RenderMarkdown>
                      <div className="grid grid-cols-1 mt-4 mb-8 md:grid-cols-3">
                        {[
                          [
                            "Status",
                            <Badge
                              color={
                                ticket.status === SupportTicketStatus.OPEN
                                  ? "green"
                                  : "red"
                              }
                              key={ticket.status}
                            >
                              {ticket.status}
                            </Badge>,
                          ],
                          [
                            "Category",
                            <Text weight={500} key={ticket.category}>
                              {ticket.category.charAt(0).toUpperCase() +
                                ticket.category.slice(1)}
                            </Text>,
                          ],
                          [
                            "Created at",
                            <Text
                              weight={500}
                              key={new Date(
                                ticket.createdAt
                              ).toLocaleTimeString()}
                            >
                              {new Date(ticket.createdAt).toLocaleTimeString()}
                            </Text>,
                          ],
                          [
                            "Claimed by",
                            ticket.claimedBy ? (
                              <UserContext user={ticket.claimedBy}>
                                <div className="flex gap-2 items-center">
                                  <Avatar
                                    size={28}
                                    src={getMediaUrl(
                                      ticket.claimedBy.avatarUri
                                    )}
                                    radius={999}
                                  />
                                  <Text weight={500} color="dimmed">
                                    {ticket.claimedBy.username}
                                  </Text>
                                </div>
                              </UserContext>
                            ) : (
                              <Text color="dimmed">Not claimed</Text>
                            ),
                          ],
                        ].map(([label, value]) => (
                          <div key={String(label)} className="mb-4">
                            <Text color="dimmed" weight={500}>
                              {String(label)}
                            </Text>
                            {value}
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between">
                        <div className="flex gap-2 items-center">
                          {ticket.author ? (
                            <>
                              <UserContext user={ticket.author}>
                                <Avatar
                                  size={28}
                                  src={getMediaUrl(ticket.author.avatarUri)}
                                  radius={999}
                                />
                              </UserContext>
                              <Text weight={500} color="dimmed">
                                {ticket.author.username}
                              </Text>
                            </>
                          ) : (
                            <Text color="dimmed">User not logged in</Text>
                          )}
                        </div>
                        <div className="flex gap-2 items-center">
                          <Button
                            variant="subtle"
                            onClick={async () => {
                              await fetch(
                                `/api/admin/tickets/close/${ticket.id}`,
                                {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                    Authorization: String(
                                      getCookie(".frameworksession")
                                    ),
                                  },
                                }
                              ).then(() => {
                                showNotification({
                                  title: "Ticket closed",
                                  message: "The ticket has been closed",
                                  icon: <HiCheckCircle />,
                                });
                                setOpened(false);
                              });
                            }}
                            disabled={
                              ticket.claimedBy !== null &&
                              ticket.claimedBy.id !== user?.id
                            }
                          >
                            Close
                          </Button>
                          <Button
                            onClick={async () => {
                              updateTicket(ticket.id, { claimedBy: user });
                              await fetch(
                                `/api/admin/tickets/claim/${ticket.id}`,
                                {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                    Authorization: String(
                                      getCookie(".frameworksession")
                                    ),
                                  },
                                }
                              ).then(() => {
                                showNotification({
                                  title: "Ticket claimed",
                                  message: "The ticket has been claimed",
                                  icon: <HiCheckCircle />,
                                });
                              });
                            }}
                            disabled={ticket.claimedBy !== null}
                          >
                            Claim
                          </Button>
                        </div>
                      </div>
                    </>
                  </Modal>
                </>
              )}
            </Stateful>
          ))
        ) : null}
      </div>
    </>
  );
};

export default Tickets;
