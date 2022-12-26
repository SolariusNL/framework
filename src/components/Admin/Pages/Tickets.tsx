import { Anchor, Avatar, Badge, Loader, Text } from "@mantine/core";
import { openModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { SupportTicket, SupportTicketStatus } from "@prisma/client";
import { getCookie } from "cookies-next";
import { useEffect, useState } from "react";
import { HiCheckCircle } from "react-icons/hi";
import getMediaUrl from "../../../util/getMedia";
import { NonUser } from "../../../util/prisma-types";
import ModernEmptyState from "../../ModernEmptyState";
import ShadedButton from "../../ShadedButton";
import UserContext from "../../UserContext";

const Tickets: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState<
    Array<
      SupportTicket & {
        author: NonUser;
      }
    >
  >([]);

  useEffect(() => {
    setLoading(true);
    fetch("/api/admin/tickets", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(getCookie(".frameworksession")),
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setTickets(res);
        setLoading(false);
      });
  }, []);

  return (
    <div className="grid grid-cols-3 gap-4">
      {loading ? (
        <Loader />
      ) : tickets.length === 0 ? (
        <div className="col-span-3">
          <ModernEmptyState
            title="No tickets"
            body="No tickets have been created yet"
          />
        </div>
      ) : (
        tickets.map((ticket) => (
          <ShadedButton
            key={ticket.id}
            onClick={() => {
              openModal({
                title: ticket.title,
                children: (
                  <>
                    <Text mb={16}>{ticket.content}</Text>
                    <div className="flex justify-between md:flex-row flex-col">
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
                            key={new Date(ticket.createdAt).toLocaleString()}
                          >
                            {new Date(ticket.createdAt).toLocaleString()}
                          </Text>,
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
                      <Anchor
                        onClick={async () => {
                          await fetch(`/api/admin/tickets/close/${ticket.id}`, {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: String(
                                getCookie(".frameworksession")
                              ),
                            },
                          }).then(() => {
                            showNotification({
                              title: "Ticket closed",
                              message: "The ticket has been closed",
                              icon: <HiCheckCircle />,
                            });
                            setTickets(
                              tickets.filter((t) => t.id !== ticket.id)
                            );
                          });
                        }}
                      >
                        Close ticket
                      </Anchor>
                    </div>
                  </>
                ),
                closeButtonLabel: "Close",
                withCloseButton: true,
              });
            }}
          >
            <div className="flex justify-between">
              <div>
                <Text size="lg" weight={500}>
                  {ticket.title}
                </Text>
                <Text color="dimmed" size="sm" lineClamp={2}>
                  {ticket.content}
                </Text>
              </div>
              <div>
                <Badge color="green">Opened</Badge>
              </div>
            </div>
          </ShadedButton>
        ))
      )}
    </div>
  );
};

export default Tickets;
