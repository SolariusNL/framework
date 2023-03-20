import {
  Avatar,
  Button,
  CloseButton,
  Loader,
  Stack,
  Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { Rating, TeamAccess, TeamStaffPermission } from "@prisma/client";
import { getCookie } from "cookies-next";
import { GetServerSideProps } from "next";
import { useEffect, useState } from "react";
import { HiCheck, HiCheckCircle, HiPlus, HiXCircle } from "react-icons/hi";
import { TeamType } from "../../..";
import DetailCard from "../../../../../components/DetailCard";
import LabelledRadio from "../../../../../components/LabelledRadio";
import TeamsViewProvider from "../../../../../components/Teams/TeamsView";
import UserSelect from "../../../../../components/UserSelect";
import authorizedRoute from "../../../../../util/auth";
import getMediaUrl from "../../../../../util/get-media";
import { NonUser, User } from "../../../../../util/prisma-types";
import { getTeam } from "../../../../../util/teams";

const headers = {
  "Content-Type": "application/json",
  Authorization: String(getCookie(".frameworksession")),
};
const blackInput = "dark:bg-black dark:text-white";

export type TeamViewSettingsAccessProps = {
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

type Updatable = {
  description: string;
  location: string;
  timezone: string;
  website: string;
  email: string;
  access: TeamAccess;
};

type InvitedListProps = {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  tid: string;
  canEdit: boolean;
};

const InvitedList: React.FC<InvitedListProps> = ({
  loading,
  tid,
  setLoading,
  canEdit,
}) => {
  const [invited, setInvited] = useState<
    {
      avatarUri: string;
      username: string;
      id: number;
    }[]
  >();
  const getInvited = async () => {
    setLoading(true);
    await fetch(`/api/teams/${tid}/invited`, {
      method: "GET",
      headers,
    })
      .then(async (res) => res.json())
      .then(async (res) => {
        setInvited(res);
        setLoading(false);
      });
  };

  useEffect(() => {
    getInvited();
  }, []);

  return !loading ? (
    <div className="flex flex-col gap-2">
      <UserSelect
        disabled={!canEdit}
        label="Add user"
        description="Invite a user to join your team."
        onUserSelect={async (user) => {
          if (invited?.find((u) => u.id === user.id)) return;
          setInvited((invited) => [...(invited || []), user]);

          await fetch(`/api/teams/${tid}/invite/${user.id}`, {
            method: "POST",
            headers,
          });
        }}
        key={tid}
        id={tid}
        filter={(_, user) =>
          !invited?.find((u) => u.username === user.username)
        }
        classNames={{
          input: blackInput,
          icon: "dark:text-white",
        }}
        icon={<HiPlus />}
      />
      <Stack spacing={2} mt="sm">
        {invited &&
          invited.map((user) => (
            <div key={user.id} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Avatar
                  src={getMediaUrl(user.avatarUri)}
                  size={20}
                  radius={999}
                />
                <Text size="sm" color="dimmed" weight={500}>
                  @{user.username}
                </Text>
              </div>
              <CloseButton
                size="xs"
                onClick={async () => {
                  setInvited(invited?.filter((u) => u.id !== user.id));
                  await fetch(`/api/teams/${tid}/invite/${user.id}`, {
                    method: "DELETE",
                    headers,
                  });
                }}
                disabled={!canEdit}
              />
            </div>
          ))}
      </Stack>
    </div>
  ) : (
    <div className="py-4 w-full flex justify-center">
      <Loader />
    </div>
  );
};
const StaffList: React.FC<{
  staff: { id: number; username: string; avatarUri: string }[];
  tid: string;
  owner: boolean;
}> = ({ staff, tid, owner }) => {
  const [staffState, setStaff] = useState<
    {
      avatarUri: string;
      username: string;
      id: number;
    }[]
  >(staff);

  return (
    <div className="flex flex-col gap-2">
      <UserSelect
        disabled={!owner}
        label="Add staff"
        description="Add a user to your team's staff."
        onUserSelect={async (user) => {
          if (staff?.find((u) => u.id === user.id)) return;
          setStaff((s) => [...(s || []), user]);

          await fetch(`/api/teams/${tid}/staff/${user.id}`, {
            method: "POST",
            headers,
          });
        }}
        key={tid}
        id={tid}
        filter={(_, user) => !staff?.find((u) => u.username === user.username)}
        classNames={{
          input: blackInput,
          icon: "dark:text-white",
        }}
        icon={<HiPlus />}
      />
      <Stack spacing={2} mt="sm">
        {staff &&
          staff.map((user) => (
            <div key={user.id} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Avatar
                  src={getMediaUrl(user.avatarUri)}
                  size={20}
                  radius={999}
                />
                <Text size="sm" color="dimmed" weight={500}>
                  @{user.username}
                </Text>
              </div>
              <CloseButton
                size="xs"
                onClick={async () => {
                  setStaff(staff?.filter((u) => u.id !== user.id));
                  await fetch(`/api/teams/${tid}/staff/${user.id}`, {
                    method: "DELETE",
                    headers,
                  });
                }}
                disabled={!owner}
              />
            </div>
          ))}
      </Stack>
    </div>
  );
};

const TeamViewSettingsAccess: React.FC<TeamViewSettingsAccessProps> = ({
  user,
  team,
}) => {
  const form = useForm<{
    description: string;
    location?: string;
    timezone?: string;
    website?: string;
    email?: string;
    access?: TeamAccess;
    staffPermissions?: TeamStaffPermission[];
  }>({
    initialValues: {
      description: team.descriptionMarkdown || "",
      location: team.location || "",
      timezone: team.timezone || "",
      website: team.website || "",
      email: team.email || "",
      access: team.access || TeamAccess.OPEN,
      staffPermissions: team.staffPermissions || [],
    },
    validate: {
      description: (value) => {
        if (value.length > 2048 || value.length < 3) {
          return "Description must be between 3 and 2048 characters";
        }
      },
      location: (value: string) => {
        if (value && (value.length > 50 || value.length < 3)) {
          return "Location must be between 3 and 50 characters";
        }
      },
      timezone: (value: string) => {
        if (value && (value.length > 50 || value.length < 3)) {
          return "Timezone must be between 3 and 50 characters";
        }
      },
      website: (value: string) => {
        if (
          value &&
          !value.match(
            /^(https?:\/\/)?((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?$/i
          )
        ) {
          return "Website must be a valid URL";
        }
      },
      email: (value: string) => {
        if (
          value &&
          !value.match(
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          )
        ) {
          return "Email must be a valid email address";
        }
      },
    },
  });
  const [loadingInvited, setLoadingInvited] = useState<boolean>(false);

  const updateTeam = async (values: Updatable) => {
    await fetch(`/api/teams/${team.id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(
        Object.fromEntries(
          Object.entries(values).filter(([key, value]) => {
            return value !== team[key as keyof TeamType];
          })
        )
      ),
    })
      .then(async (res) => res.json())
      .then(async (res) => {
        if (res.success) {
          showNotification({
            title: "Team updated",
            message: "Your team has been updated.",
            icon: <HiCheckCircle />,
          });
        } else {
          showNotification({
            title: "Failed to update team",
            message: "Failed to update team. Please try again.",
            icon: <HiXCircle />,
          });
        }
      });
  };

  return (
    <TeamsViewProvider user={user} team={team} active="settings-access">
      <form
        onSubmit={form.onSubmit(async (values) =>
          updateTeam(values as Updatable)
        )}
      >
        <DetailCard.Group>
          <DetailCard title="Staff" description="Manage your team's staff.">
            <StaffList
              staff={team.staff}
              tid={team.id}
              owner={team.ownerId === user.id}
            />
          </DetailCard>
          <DetailCard
            title="Access"
            description="Control how people join your team, whether your team is public or private."
          >
            {[
              {
                label: "Public",
                value: TeamAccess.OPEN,
                description: "Anyone can join your team.",
              },
              {
                label: "Private",
                value: TeamAccess.PRIVATE,
                description: "Only invited members can join your team.",
              },
            ].map((t) => (
              <LabelledRadio
                key={t.value}
                label={t.label}
                description={t.description}
                {...form.getInputProps("access")}
                value={t.value}
                checked={form.values.access === t.value}
                disabled={team.ownerId !== user.id}
              />
            ))}
          </DetailCard>
          {form.values.access === TeamAccess.PRIVATE && (
            <DetailCard
              title="Invited"
              description="People who have been invited to join your team."
            >
              <InvitedList
                tid={team.id}
                loading={loadingInvited}
                setLoading={setLoadingInvited}
                canEdit={
                  team.ownerId === user.id ||
                  (team.staff.find((s) => s.id === user.id) &&
                    team.staffPermissions &&
                    team.staffPermissions.includes(
                      TeamStaffPermission.EDIT_MEMBERS
                    )) ||
                  false
                }
              />
            </DetailCard>
          )}
        </DetailCard.Group>
        <div className="mt-8 flex justify-end">
          <Button leftIcon={<HiCheck />} type="submit">
            Save
          </Button>
        </div>
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
    if (!team.staff.find((s) => s.id === auth.props.user?.id)) {
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

export default TeamViewSettingsAccess;
