import Descriptive from "@/components/Descriptive";
import Framework from "@/components/Framework";
import { Section } from "@/components/Home/FriendsWidget";
import Markdown, { ToolbarItem } from "@/components/Markdown";
import ModernEmptyState from "@/components/ModernEmptyState";
import RenderMarkdown from "@/components/RenderMarkdown";
import ShadedButton from "@/components/ShadedButton";
import ShadedCard from "@/components/ShadedCard";
import authorizedRoute from "@/util/auth";
import { User } from "@/util/prisma-types";
import { supportSanitization } from "@/util/sanitize";
import {
  Anchor,
  Badge,
  Button,
  Checkbox,
  Divider,
  Modal,
  Pagination,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { openModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";
import { SupportTicket, SupportTicketStatus } from "@prisma/client";
import { getCookie } from "cookies-next";
import { GetServerSidePropsContext, NextPage } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  HiCheckCircle,
  HiInbox,
  HiMail,
  HiPaperAirplane,
  HiTag,
  HiUser,
  HiXCircle,
} from "react-icons/hi";
import sanitize from "sanitize-html";
import { BLACK } from "./teams/t/[slug]/issue/create";

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
    contentMd: string;
    category: string;
    contactEmail: string;
    contactName: string;
    agree: boolean;
  }>({
    initialValues: {
      title: "",
      contentMd: "",
      category: categories[0][0],
      contactEmail: user ? user.email : "",
      contactName: "",
      agree: false,
    },
    validate: {
      title: (value) => {
        if (value.length < 3) {
          return "Title must be at least 3 characters long";
        }
      },
      contentMd: (value) => {
        if (value.length < 10 || value.length > 2048) {
          return "Content must be at least 10 characters long, and no more than 2048";
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
  const { colorScheme } = useMantineColorScheme();

  useEffect(() => {
    if (user) {
      fetch("/api/support/tickets", {
        headers: {
          Authorization: String(getCookie(".frameworksession")),
        },
      })
        .then((res) => res.json())
        .then((res) => {
          setTickets(res.data.tickets);
        });
    }
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
                      className: colorScheme,
                      children: (
                        <>
                          <RenderMarkdown>{ticket.content}</RenderMarkdown>
                          <Divider mt="xl" mb="xl" />
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
                        {sanitize(ticket.content, supportSanitization).replace(
                          /<[^>]*>?/gm,
                          ""
                        )}
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
          {!user && (
            <ModernEmptyState
              title="Not logged in"
              body="You must be logged in to view your tickets"
            />
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
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Text color="dimmed" mb={6}>
              Support
            </Text>
            <Title order={2} mb={24}>
              Support information
            </Title>
            <Text size="sm" color="dimmed" mb="md">
              If you have any questions, concerns or other inquiries related to
              our company or products, please don&apos;t hesitate to contact us.
              We&apos;re here to help and will do our best to respond to your
              inquiry <span className="font-semibold">within 48 hours</span>.
            </Text>
            <Text size="sm" color="dimmed" mb="md">
              At Solarius, we&apos;re committed to providing exceptional
              customer service and support. Whether you&apos;re a current
              customer or simply curious about our company or products, we want
              to make sure that you have all the information you need to make
              informed decisions.
            </Text>
            <Text size="sm" color="dimmed" mb="md">
              If you have a question or concern about a specific product, please
              make sure to include as much information as possible in your
              inquiry. This will help us provide a more accurate and timely
              response. If you&apos;re having trouble with a product or service,
              we may also ask for additional information to help us troubleshoot
              the issue.
            </Text>
            <Text size="sm" color="dimmed" mb="md">
              In addition to responding to inquiries, we also collect and
              analyze data related to our customer feedback and support
              interactions. This information helps us identify trends and areas
              for improvement and allows us to continuously enhance our
              products.
            </Text>
            <Text size="sm" color="dimmed" mb="md">
              We take your feedback and concerns seriously and strive to provide
              the best possible experience for our community. If you have
              suggestions or feedback for how we can improve our products or
              services, please let us know.
            </Text>
            <div className="flex flex-col gap-1/2">
              <Link href="/dmca" passHref>
                <Anchor mb="md">File DMCA complaint</Anchor>
              </Link>
              <Link href="/privacy" passHref>
                <Anchor mb="md">Privacy Policy</Anchor>
              </Link>
            </div>
            <Text color="dimmed" align="center" size="sm" mt="md">
              Your request will be sent to our support team and you will be
              contacted via email. You can also contact us at{" "}
              <Anchor href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}`}>
                {process.env.NEXT_PUBLIC_SUPPORT_EMAIL}
              </Anchor>
              .
            </Text>
          </div>
          <div className="flex-1">
            <ShadedCard>
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
                <Section
                  title="Categorization"
                  description="Please categorize your inquiry."
                  sm
                />
                <Select
                  label="Category"
                  description="What do you need help with?"
                  classNames={BLACK}
                  data={categories.map((category) => ({
                    value: category[0],
                    label: `${category[1]} - ${category[2]}`,
                  }))}
                  mb="xl"
                  icon={<HiTag />}
                  required
                  {...form.getInputProps("category")}
                />
                <Section
                  title="Content"
                  description="Describe your inquiry in detail so we fully understand your ticket."
                  sm
                />
                <Stack spacing="xs" mb="xl">
                  <TextInput
                    label="Title"
                    description="What is your issue?"
                    required
                    placeholder="Title of your issue"
                    icon={<HiInbox />}
                    classNames={BLACK}
                    {...form.getInputProps("title")}
                  />
                  <Descriptive
                    title="Content"
                    description="Describe your inquiry in detail"
                    required
                  >
                    <Markdown
                      placeholder="Describe your inquiry in detail so we can help you at our fullest extent"
                      toolbar={[
                        ToolbarItem.Bold,
                        ToolbarItem.BulletList,
                        ToolbarItem.H2,
                        ToolbarItem.H3,
                        ToolbarItem.OrderedList,
                        ToolbarItem.Help,
                      ]}
                      {...form.getInputProps("contentMd")}
                    />
                  </Descriptive>
                </Stack>
                <Section
                  title="Contact"
                  description="Fill in some contact information so we can respond to your inquiry."
                  sm
                />
                <Stack spacing="xs" mb="xl">
                  <TextInput
                    label="Contact email"
                    description="What email should we contact you at for updates?"
                    required
                    placeholder="Email to contact you at"
                    classNames={BLACK}
                    leftIcon={<HiMail />}
                    {...form.getInputProps("contactEmail")}
                  />
                  <TextInput
                    label="Contact name"
                    description="What can we call you?"
                    placeholder="Name to contact you as"
                    classNames={BLACK}
                    icon={<HiUser />}
                    {...form.getInputProps("contactName")}
                  />
                </Stack>
                <div>
                  <Checkbox
                    label="I agree to the Framework Terms of Service and Privacy Policy"
                    required
                    mb={12}
                    classNames={BLACK}
                    {...form.getInputProps("agree")}
                  />
                  <Button
                    leftIcon={<HiPaperAirplane />}
                    type="submit"
                    fullWidth
                    size="lg"
                  >
                    Submit request
                  </Button>
                </div>
              </form>
            </ShadedCard>
          </div>
        </div>
      </Framework>
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  return await authorizedRoute(context, false, false);
}

export default Support;
