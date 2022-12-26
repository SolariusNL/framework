import {
  Anchor,
  Badge,
  Button,
  Checkbox,
  Modal,
  Pagination,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { openModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { SupportTicket, SupportTicketStatus } from "@prisma/client";
import { getCookie } from "cookies-next";
import { GetServerSidePropsContext, NextPage } from "next";
import { useEffect, useState } from "react";
import { HiCheckCircle, HiMail, HiXCircle } from "react-icons/hi";
import Framework from "../components/Framework";
import ModernEmptyState from "../components/ModernEmptyState";
import ShadedButton from "../components/ShadedButton";
import ShadedCard from "../components/ShadedCard";
import authorizedRoute from "../util/authorizedRoute";
import { User } from "../util/prisma-types";

interface SupportProps {
  user: User;
}

export const categories = [
  ["general", "General", "Get help with general questions"],
  [
    "billing",
    "Billing",
    "Get help with billing questions, renewals, trials, etc",
  ],
  ["bug", "Bug", "Get help with a bug you found on the site"],
  [
    "feature",
    "Feature",
    "Get help with a feature you want to see on Framework",
  ],
  [
    "security",
    "Security",
    "Get help with a security issue you found on Framework",
  ],
  ["hacked", "Hacked", "Get help with a hacked or compromised account"],
  ["recovery", "Recovery", "Get help with recovering your account"],
  ["other", "Other", "Get help with something else"],
];

const Support: NextPage<SupportProps> = ({ user }) => {
  const form = useForm<{
    title: string;
    content: string;
    category: string;
    contactEmail: string;
    contactName: string;
    agree: boolean;
  }>({
    initialValues: {
      title: "",
      content: "",
      category: categories[0][0],
      contactEmail: user.email,
      contactName: "",
      agree: false,
    },
    validate: {
      title: (value) => {
        if (value.length < 3) {
          return "Title must be at least 3 characters long";
        }
      },
      content: (value) => {
        if (value.length < 10 || value.length > 1000) {
          return "Content must be at least 10 characters long, and no more than 1000";
        }
      },
      category: (value) => {
        if (!categories.map((category) => category[0]).includes(value)) {
          return "Category is invalid";
        }
      },
      contactEmail: (value) => {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return "Contact email is invalid";
        }
      },
      agree: (value: boolean) => {
        if (!value) {
          return "You must agree to the terms";
        }
      },
    },
  });
  const [viewingTickets, setViewingTickets] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>();
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch("/api/support/tickets", {
      headers: {
        Authorization: String(getCookie(".frameworksession")),
      },
    })
      .then((res) => res.json())
      .then((res) => {
        setTickets(res.data.tickets);
      });
  }, [viewingTickets]);

  return (
    <>
      <Modal
        title="Your tickets"
        opened={viewingTickets}
        onClose={() => setViewingTickets(false)}
      >
        <Stack spacing={3}>
          {tickets?.length === 0 && (
            <ModernEmptyState
              title="No tickets"
              body="We aren't seeing any tickets yet"
            />
          )}
          {tickets?.length! > 0 && (
            <>
              {tickets?.slice((page - 1) * 5, page * 5).map((ticket) => (
                <ShadedButton
                  key={ticket.id}
                  onClick={() => {
                    setViewingTickets(false);
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
                                  key={new Date(
                                    ticket.createdAt
                                  ).toLocaleString()}
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
                        </>
                      ),
                      closeButtonLabel: "Close",
                      onClose: () => {
                        setViewingTickets(true);
                      },
                    });
                  }}
                >
                  <div className="flex justify-between">
                    <div>
                      <Text size="lg" mb={4}>
                        {ticket.title}
                      </Text>
                      <Text size="sm" lineClamp={2} color="dimmed">
                        {ticket.content}
                      </Text>
                    </div>
                    <div>
                      <Badge
                        color={
                          ticket.status === SupportTicketStatus.OPEN
                            ? "green"
                            : "red"
                        }
                      >
                        {ticket.status}
                      </Badge>
                    </div>
                  </div>
                </ShadedButton>
              ))}
              <div className="w-full flex justify-center">
                <Pagination
                  total={Math.ceil(tickets?.length! / 5)}
                  page={page}
                  onChange={setPage}
                  mt={8}
                  radius="xl"
                  size="sm"
                />
              </div>
            </>
          )}
        </Stack>
      </Modal>
      <Framework
        user={user}
        activeTab="none"
        modernTitle="Support"
        modernSubtitle="Get help with all things Framework"
        actions={[["View tickets", () => setViewingTickets(true)]]}
      >
        <ShadedCard mb={24}>
          <form
            onSubmit={form.onSubmit(async (values) => {
              await fetch("/api/support/submit", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: String(getCookie(".frameworksession")),
                },
                body: JSON.stringify(values),
              })
                .then((res) => res.json())
                .then((data) => {
                  if (data.status !== 200) {
                    throw new Error(data.message);
                  } else {
                    showNotification({
                      title: "Request submitted",
                      message: "Your request has been submitted",
                      icon: <HiCheckCircle />,
                    });
                    form.reset();
                  }
                })
                .catch((err) => {
                  showNotification({
                    title: "Error",
                    message: err.message,
                    color: "red",
                    icon: <HiXCircle />,
                  });
                });
            })}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 gap-y-8">
              <Select
                label="Category"
                description="What do you need help with?"
                data={categories.map((category) => ({
                  value: category[0],
                  label: `${category[1]} - ${category[2]}`,
                }))}
                required
                {...form.getInputProps("category")}
              />
              <TextInput
                label="Title"
                description="What is your issue?"
                required
                placeholder="Title of your issue"
                {...form.getInputProps("title")}
              />
              <TextInput
                label="Contact email"
                description="What email should we contact you at for updates?"
                required
                placeholder="Email to contact you at"
                {...form.getInputProps("contactEmail")}
              />
              <TextInput
                label="Contact name"
                description="What can we call you?"
                placeholder="Name to contact you as"
                {...form.getInputProps("contactName")}
              />
              <Textarea
                minRows={3}
                maxRows={5}
                label="Content"
                description="Describe your issue in detail"
                required
                placeholder="Describe your issue in detail so we can help you"
                {...form.getInputProps("content")}
              />
              <div>
                <Checkbox
                  label="I agree to the Framework Terms of Service and Privacy Policy"
                  required
                  mb={12}
                  {...form.getInputProps("agree")}
                />
                <Button leftIcon={<HiMail />} type="submit" fullWidth>
                  Submit request
                </Button>
              </div>
            </div>
          </form>
        </ShadedCard>
        <Text color="dimmed" align="center" size="sm">
          Your request will be sent to our support team and you will be
          contacted via email. You can also contact us at{" "}
          <Anchor href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}`}>
            {process.env.NEXT_PUBLIC_SUPPORT_EMAIL}
          </Anchor>
          .
        </Text>
      </Framework>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return await authorizedRoute(context, true, false);
}

export default Support;
