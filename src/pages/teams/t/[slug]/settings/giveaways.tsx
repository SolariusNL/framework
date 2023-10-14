import Descriptive from "@/components/descriptive";
import Markdown, { ToolbarItem } from "@/components/markdown";
import TeamsViewProvider from "@/components/teams/teams-view";
import { TeamType } from "@/pages/teams";
import { BLACK, FormSection } from "@/pages/teams/t/[slug]/issue/create";
import IResponseBase from "@/types/api/IResponseBase";
import authorizedRoute from "@/util/auth";
import fetchJson from "@/util/fetch";
import { User } from "@/util/prisma-types";
import { getTeam } from "@/util/teams";
import { Button, Divider, NumberInput, Text, TextInput } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { TeamGiveaway } from "@prisma/client";
import { GetServerSideProps } from "next";
import { useState } from "react";
import {
  HiCheckCircle,
  HiOutlineCalendar,
  HiOutlineGift,
  HiOutlineTicket,
  HiXCircle,
} from "react-icons/hi";

export type TeamViewGiveawaysProps = {
  user: User;
  team: TeamType;
};
type CreateGiveawayForm = {
  name: string;
  description: string;
  tickets: number;
  ends?: string;
};

const TeamViewSettingsGiveaways: React.FC<TeamViewGiveawaysProps> = ({
  user,
  team,
}) => {
  const form = useForm<CreateGiveawayForm>({
    initialValues: {
      name: "",
      description: "",
      tickets: 150,
    },
    validate: {
      name: (value) => {
        if (!value) return "Name cannot be empty";
        if (value.length > 32)
          return "Name cannot be longer than 32 characters";
      },
      description: (value) => {
        if (!value) return "Description cannot be empty";
        if (value.length > 500)
          return "Description cannot be longer than 500 characters";
      },
      tickets: (value: number) => {
        if (!value) return "You must provide a ticket amount";
        if (value > 2500 || value < 25)
          return "Ticket amount must not exceed 2500 and must be more than 25";
      },
      // @todo: PREVENT DATE IN THE PAST
      ends: (value: string) => {
        if (!value) return "You must provide an ending date";
      },
    },
  });
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <TeamsViewProvider user={user} team={team} active="settings-giveaways">
      <Text size="sm" color="dimmed">
        Giveaways are a way to foster a sense of community in your team. Here,
        you can create new giveaways for members to participate in to engage
        users in your team.
      </Text>
      <Text size="sm" color="dimmed" mt="md">
        Ticket amounts for giveaways are deducted from your teams balance.
      </Text>
      <Divider my={32} />
      <form
        onSubmit={form.onSubmit(async (values) => {
          setLoading(true);
          await fetchJson<
            IResponseBase<{
              giveaway: TeamGiveaway;
            }>
          >(`/api/teams/${team.id}/giveaways/new`, {
            method: "POST",
            body: values,
            auth: true,
          })
            .then((res) => {
              if (res.success && res.data) {
                showNotification({
                  title: "Created giveaway",
                  message: "Giveaway successfully created!",
                  icon: <HiCheckCircle />,
                });
                form.reset();
              } else {
                showNotification({
                  title: "Unexpected error",
                  message:
                    "An unexpected error occurred while processing your request.",
                  icon: <HiXCircle />,
                  color: "red",
                });
              }
            })
            .finally(() => setLoading(false));
        })}
      >
        <FormSection
          title="Information"
          description="Fill in details for this giveaway and describe its purpose."
          noCard
        >
          <TextInput
            label="Name"
            description="Enter a name for this giveaway."
            required
            placeholder="Weekly Ticket giveaway"
            classNames={BLACK}
            {...form.getInputProps("name")}
          />
          <Descriptive
            title="Description"
            description="Describe the purpose of this giveaway."
            required
          >
            <Markdown
              toolbar={[
                ToolbarItem.Bold,
                ToolbarItem.BulletList,
                ToolbarItem.H2,
                ToolbarItem.H3,
                ToolbarItem.H4,
                ToolbarItem.OrderedList,
                ToolbarItem.Table,
                ToolbarItem.Url,
                ToolbarItem.Help,
              ]}
              placeholder="Enter your description here..."
              {...form.getInputProps("description")}
            />
          </Descriptive>
        </FormSection>
        <div className="my-12" />
        <FormSection
          title="Result"
          description="Fill in information that will take effect after the giveaway."
          noCard
        >
          <NumberInput
            icon={<HiOutlineTicket />}
            placeholder="300"
            required
            label="Tickets"
            description="How many Tickets will the winner receive?"
            classNames={BLACK}
            {...form.getInputProps("tickets")}
          />
          <DatePicker
            placeholder="Choose an ending date for this giveway"
            label="Ending date"
            description="When will this giveaway end?"
            dropdownType="modal"
            required
            classNames={BLACK}
            icon={<HiOutlineCalendar />}
            minDate={new Date(new Date().getTime() + 1000 * 60 * 60 * 24)}
            {...form.getInputProps("ends")}
          />
          <Divider />
          <Button
            fullWidth
            size="lg"
            leftIcon={<HiOutlineGift />}
            type="submit"
            loading={loading}
          >
            Create giveaway
          </Button>
        </FormSection>
      </form>
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

export default TeamViewSettingsGiveaways;
