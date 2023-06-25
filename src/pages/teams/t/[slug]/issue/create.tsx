import {
  Button,
  MultiSelect,
  Select,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { TeamIssueEnvironmentType } from "@prisma/client";
import { getCookie } from "cookies-next";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { HiXCircle } from "react-icons/hi";
import { TeamType } from "../../..";
import Descriptive from "../../../../../components/Descriptive";
import Markdown, { ToolbarItem } from "../../../../../components/Markdown";
import ShadedCard from "../../../../../components/ShadedCard";
import TeamsViewProvider from "../../../../../components/Teams/TeamsView";
import UserSelect from "../../../../../components/UserSelect";
import authorizedRoute from "../../../../../util/auth";
import { User } from "../../../../../util/prisma-types";
import { getTeam } from "../../../../../util/teams";

export type TeamIssueCreateProps = {
  user: User;
  team: TeamType & {
    games: {
      name: string;
      iconUri: string;
      id: number;
    }[];
  };
};

export const FormSection: React.FC<
  {
    title: string;
    description: string;
    noCard?: boolean;
    actions?: React.ReactNode;
  } & React.HTMLAttributes<HTMLDivElement>
> = ({ title, description, children, noCard, actions, ...props }) => {
  return (
    <div className="md:grid md:grid-cols-3 md:gap-7" {...props}>
      <div className="md:col-span-1">
        <div className="px-4 sm:px-0">
          <Title order={4} className="leading-6 mb-2">
            {title}
          </Title>
          <Text size="sm" color="dimmed">
            {description}
          </Text>
          {actions && <div className="mt-4">{actions}</div>}
        </div>
      </div>
      {noCard ? (
        <div className="mt-5 md:mt-0 md:col-span-2 gap-6 flex flex-col">
          {children}
        </div>
      ) : (
        <ShadedCard className="mt-5 md:col-span-2 md:mt-0 gap-6 flex flex-col">
          {children}
        </ShadedCard>
      )}
    </div>
  );
};

export const tags = [
  { label: "Crash", value: "crash" },
  { label: "Performance", value: "performance" },
  { label: "Graphics", value: "graphics" },
  { label: "Audio", value: "audio" },
  { label: "Network", value: "network" },
  { label: "Suggestions", value: "suggestions" },
  { label: "General", value: "general" },
  { label: "Technical", value: "technical" },
  { label: "UI", value: "ui" },
];

type CreateIssueForm = {
  title: string;
  description: string;
  game: number;
  tags: string[];
  environment: TeamIssueEnvironmentType;
  assignee: number;
};

export const BLACK = {
  icon: "dark:text-white",
  input: "dark:bg-black dark:text-white !border-[1px] !border-black-border",
};

const TeamIssueCreate: React.FC<TeamIssueCreateProps> = ({ user, team }) => {
  const form = useForm<CreateIssueForm>({
    initialValues: {
      title: "",
      description: "",
      game: 0,
      tags: [],
      environment: TeamIssueEnvironmentType.DESKTOP,
      assignee: 0,
    },
    validate(values) {
      const errors: Record<string, string> = {};
      if (!values.title) errors.title = "Title is required";
      if (!values.description) errors.description = "Description is required";
      if (!values.game) errors.game = "Game is required";
      return errors;
    },
  });
  const router = useRouter();

  return (
    <TeamsViewProvider user={user} team={team} active="issues">
      <form
        onSubmit={form.onSubmit(async (values) => {
          await fetch(`/api/teams/${team.id}/issue/${values.game}/new`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: String(getCookie(".frameworksession")),
            },
            body: JSON.stringify(values),
          })
            .then((res) => res.json())
            .then((res) => {
              if (res.error) {
                showNotification({
                  title: "Error",
                  message: `An error occurred while creating your issue: ${
                    res.error || "Unknown error"
                  }`,
                  icon: <HiXCircle />,
                  color: "red",
                });
              } else {
                router.push(`/teams/t/${team.slug}/issue/v/${res.issue.id}`);
              }
            });
        })}
      >
        <Stack spacing="md">
          <FormSection
            title="Necessary information"
            description="Fill out the title and description of your issue below, and choose the game it applies to."
          >
            <TextInput
              classNames={BLACK}
              label="Title"
              required
              description="A short, descriptive title for your issue."
              placeholder="My game is crashing"
              {...form.getInputProps("title")}
            />
            <Descriptive
              required
              title="Description"
              description="A detailed description of your issue, markdown supported."
            >
              <Markdown
                toolbar={[
                  ToolbarItem.Bold,
                  ToolbarItem.Italic,
                  ToolbarItem.Help,
                  ToolbarItem.BulletList,
                  ToolbarItem.Code,
                  ToolbarItem.CodeBlock,
                  ToolbarItem.H2,
                  ToolbarItem.H3,
                  ToolbarItem.H4,
                  ToolbarItem.OrderedList,
                  ToolbarItem.Table,
                  ToolbarItem.Url,
                ]}
                {...form.getInputProps("description")}
              />
            </Descriptive>
            <Select
              label="Game"
              description="The game this issue applies to."
              data={team.games.map((game) => ({
                label: game.name,
                value: game.id,
              }))}
              nothingFound="No games found"
              searchable
              required
              classNames={BLACK}
              placeholder="Choose a game"
              {...form.getInputProps("game")}
            />
          </FormSection>
          <FormSection
            title="Metadata"
            description="Fill out additional information about your issue to help this team better understand it."
          >
            <MultiSelect
              label="Tags"
              description="Tags to help categorize your issue."
              data={tags}
              placeholder="Choose some tags"
              classNames={BLACK}
              required
              {...form.getInputProps("tags")}
            />
            <Select
              label="Environment"
              description="The environment this issue applies to, to scope it to a specific platform."
              data={[
                { label: "Desktop", value: TeamIssueEnvironmentType.DESKTOP },
                { label: "Mobile", value: TeamIssueEnvironmentType.MOBILE },
                { label: "Console", value: TeamIssueEnvironmentType.CONSOLE },
              ]}
              classNames={BLACK}
              required
              {...form.getInputProps("environment")}
            />
            <UserSelect
              required
              label="Assignee"
              description="The user this issue is assigned to."
              classNames={BLACK}
              placeholder="Choose an assignee"
              {...form.getInputProps("assignee")}
            />
            <Button size="lg" type="submit">
              Create issue
            </Button>
          </FormSection>
        </Stack>
      </form>
    </TeamsViewProvider>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const auth = await authorizedRoute(ctx, true, false);
  const slug = ctx.query.slug;
  const team = await getTeam(String(slug), {
    games: {
      select: {
        name: true,
        iconUri: true,
        id: true,
      },
    },
  });

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

export default TeamIssueCreate;
